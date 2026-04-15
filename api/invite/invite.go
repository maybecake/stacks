package handler

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"connectrpc.com/connect"
	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
	invitev1 "github.com/maybecake/stacks/gen/go/invite"
	"github.com/maybecake/stacks/gen/go/invite/inviteconnect"
	"github.com/maybecake/stacks/lib/adapters/postgres"
	"github.com/maybecake/stacks/lib/domain"
	"github.com/maybecake/stacks/lib/pagination"
	"os"
)

// ── JWKS (mirrored from api/yo.go — each Go serverless function is independent) ──

var (
	inviteJWKSOnce   sync.Once
	inviteJWKSClient keyfunc.Keyfunc
	inviteJWKSErr    error
)

func inviteJWKSURLFromPublishableKey(key string) (string, error) {
	for _, prefix := range []string{"pk_test_", "pk_live_"} {
		if strings.HasPrefix(key, prefix) {
			key = strings.TrimPrefix(key, prefix)
			break
		}
	}
	decoded, err := base64.RawStdEncoding.DecodeString(key)
	if err != nil {
		return "", fmt.Errorf("decode publishable key: %w", err)
	}
	d := strings.TrimSuffix(string(decoded), "$")
	return "https://" + d + "/.well-known/jwks.json", nil
}

func getInviteJWKS() (keyfunc.Keyfunc, error) {
	inviteJWKSOnce.Do(func() {
		key := os.Getenv("VITE_CLERK_PUBLISHABLE_KEY")
		if key == "" {
			inviteJWKSErr = errors.New("VITE_CLERK_PUBLISHABLE_KEY not set")
			return
		}
		url, err := inviteJWKSURLFromPublishableKey(key)
		if err != nil {
			inviteJWKSErr = err
			return
		}
		inviteJWKSClient, inviteJWKSErr = keyfunc.NewDefault([]string{url})
	})
	return inviteJWKSClient, inviteJWKSErr
}

// requireInviteAuth validates the Bearer JWT; returns Unauthenticated error if invalid.
func requireInviteAuth(authHeader string) error {
	_, err := getCallerUserID(authHeader)
	return err
}

// getCallerUserID validates the Bearer token and returns the Clerk `sub` claim.
func getCallerUserID(authHeader string) (string, error) {
	const prefix = "Bearer "
	if len(authHeader) <= len(prefix) || authHeader[:len(prefix)] != prefix {
		return "", connect.NewError(connect.CodeUnauthenticated, errors.New("missing or invalid Authorization header"))
	}
	jwks, err := getInviteJWKS()
	if err != nil {
		return "", connect.NewError(connect.CodeInternal, err)
	}
	tokenStr := authHeader[len(prefix):]
	token, err := jwt.Parse(tokenStr, jwks.Keyfunc, jwt.WithValidMethods([]string{"RS256"}))
	if err != nil {
		return "", connect.NewError(connect.CodeUnauthenticated, err)
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", connect.NewError(connect.CodeUnauthenticated, errors.New("invalid claims"))
	}
	sub, ok := claims["sub"].(string)
	if !ok || sub == "" {
		return "", connect.NewError(connect.CodeUnauthenticated, errors.New("missing sub claim"))
	}
	return sub, nil
}

// tryGetCallerUserID returns the user ID when a valid token is present, or ("", nil) otherwise.
func tryGetCallerUserID(authHeader string) (string, error) {
	if authHeader == "" {
		return "", nil
	}
	userID, err := getCallerUserID(authHeader)
	if err != nil {
		return "", nil
	}
	return userID, nil
}

// ── Proto ↔ domain mapping ────────────────────────────────────────────────────

func pbPerson(p domain.Person) *invitev1.Person {
	return &invitev1.Person{
		Id:    p.ID,
		Name:  p.Name,
		Type:  personTypeToProto(p.Type),
		Phone: p.Phone,
		Email: p.Email,
	}
}

func personTypeToProto(t domain.PersonType) invitev1.PersonType {
	switch t {
	case domain.PersonTypeChild:
		return invitev1.PersonType_PERSON_TYPE_CHILD
	case domain.PersonTypeAdult:
		return invitev1.PersonType_PERSON_TYPE_ADULT
	default:
		return invitev1.PersonType_PERSON_TYPE_UNSPECIFIED
	}
}

func personTypeFromProto(t invitev1.PersonType) domain.PersonType {
	if t == invitev1.PersonType_PERSON_TYPE_ADULT {
		return domain.PersonTypeAdult
	}
	return domain.PersonTypeChild
}

func memberRoleFromProto(r invitev1.MemberRole) domain.MemberRole {
	if r == invitev1.MemberRole_MEMBER_ROLE_GUARDIAN {
		return domain.MemberRoleGuardian
	}
	return domain.MemberRoleChild
}

func memberRoleToProto(r domain.MemberRole) invitev1.MemberRole {
	if r == domain.MemberRoleGuardian {
		return invitev1.MemberRole_MEMBER_ROLE_GUARDIAN
	}
	return invitev1.MemberRole_MEMBER_ROLE_CHILD
}

func rsvpStatusFromProto(s invitev1.RSVPStatus) domain.RSVPStatus {
	if s == invitev1.RSVPStatus_RSVP_STATUS_DECLINED {
		return domain.RSVPStatusDeclined
	}
	return domain.RSVPStatusConfirmed
}

func rsvpStatusToProto(s domain.RSVPStatus) invitev1.RSVPStatus {
	switch s {
	case domain.RSVPStatusDeclined:
		return invitev1.RSVPStatus_RSVP_STATUS_DECLINED
	case domain.RSVPStatusConfirmed:
		return invitev1.RSVPStatus_RSVP_STATUS_CONFIRMED
	default:
		return invitev1.RSVPStatus_RSVP_STATUS_UNSPECIFIED
	}
}

func pbHousehold(h domain.Household) *invitev1.Household {
	return &invitev1.Household{Id: h.ID, Name: h.Name}
}

func pbEvent(e domain.Event) *invitev1.Event {
	return &invitev1.Event{
		Id:                e.ID,
		PublicToken:       e.PublicToken,
		HostUserId:        e.HostUserID,
		Name:              e.Name,
		Venue:             e.Venue,
		Description:       e.Description,
		DatetimeUnix:      e.Datetime.Unix(),
		Capacity:          e.Capacity,
		AllowSiblings:     e.AllowSiblings,
		RequireParentStay: e.RequireParentStay,
	}
}

func pbInvitee(i domain.Invitee) *invitev1.Invitee {
	return &invitev1.Invitee{
		Id:          i.ID,
		EventId:     i.EventID,
		PersonId:    i.PersonID,
		HouseholdId: i.HouseholdID,
	}
}

func pbRSVP(r domain.RSVP) *invitev1.RSVP {
	return &invitev1.RSVP{
		Id:                    r.ID,
		EventId:               r.EventID,
		HouseholdId:           r.HouseholdID,
		Status:                rsvpStatusToProto(r.Status),
		EmergencyContactName:  r.EmergencyContactName,
		EmergencyContactPhone: r.EmergencyContactPhone,
	}
}

// ── Error mapping ─────────────────────────────────────────────────────────────

func domainErr(err error) error {
	switch {
	case errors.Is(err, domain.ErrInvalidArgument):
		return connect.NewError(connect.CodeInvalidArgument, err)
	case errors.Is(err, domain.ErrNotFound):
		return connect.NewError(connect.CodeNotFound, err)
	case errors.Is(err, domain.ErrAlreadyExists):
		return connect.NewError(connect.CodeAlreadyExists, err)
	case errors.Is(err, domain.ErrResourceExhausted):
		return connect.NewError(connect.CodeResourceExhausted, err)
	case errors.Is(err, domain.ErrFailedPrecondition):
		return connect.NewError(connect.CodeFailedPrecondition, err)
	case errors.Is(err, domain.ErrPermissionDenied):
		return connect.NewError(connect.CodePermissionDenied, err)
	default:
		return connect.NewError(connect.CodeInternal, err)
	}
}

// ── Server ────────────────────────────────────────────────────────────────────

type InviteServer struct {
	svc *domain.InviteService
}

// ── Event RPCs ────────────────────────────────────────────────────────────────

func (s *InviteServer) CreateEvent(ctx context.Context, req *connect.Request[invitev1.CreateEventRequest]) (*connect.Response[invitev1.Event], error) {
	userID, err := getCallerUserID(req.Header().Get("Authorization"))
	if err != nil {
		return nil, err
	}
	msg := req.Msg
	event, err := s.svc.CreateEvent(ctx, userID, domain.CreateEventParams{
		Name:              msg.Name,
		Venue:             msg.Venue,
		Description:       msg.Description,
		Datetime:          time.Unix(msg.DatetimeUnix, 0).UTC(),
		Capacity:          msg.Capacity,
		AllowSiblings:     msg.AllowSiblings,
		RequireParentStay: msg.RequireParentStay,
	})
	if err != nil {
		return nil, domainErr(err)
	}
	return connect.NewResponse(pbEvent(*event)), nil
}

func (s *InviteServer) GetEvent(ctx context.Context, req *connect.Request[invitev1.GetEventRequest]) (*connect.Response[invitev1.Event], error) {
	event, err := s.svc.GetEvent(ctx, req.Msg.PublicToken)
	if err != nil {
		return nil, domainErr(err)
	}
	return connect.NewResponse(pbEvent(*event)), nil
}

// ── Invitee RPCs (host only) ──────────────────────────────────────────────────

func (s *InviteServer) AddInvitee(ctx context.Context, req *connect.Request[invitev1.AddInviteeRequest]) (*connect.Response[invitev1.Invitee], error) {
	if err := requireInviteAuth(req.Header().Get("Authorization")); err != nil {
		return nil, err
	}
	inv, err := s.svc.AddInvitee(ctx, req.Msg.EventId, req.Msg.PersonId)
	if err != nil {
		return nil, domainErr(err)
	}
	return connect.NewResponse(pbInvitee(*inv)), nil
}

func (s *InviteServer) AddHouseholdInvitees(ctx context.Context, req *connect.Request[invitev1.AddHouseholdInviteesRequest]) (*connect.Response[invitev1.AddHouseholdInviteesResponse], error) {
	if err := requireInviteAuth(req.Header().Get("Authorization")); err != nil {
		return nil, err
	}
	invitees, err := s.svc.AddHouseholdInvitees(ctx, req.Msg.EventId, req.Msg.HouseholdId)
	if err != nil {
		return nil, domainErr(err)
	}
	pbInvitees := make([]*invitev1.Invitee, len(invitees))
	for i, inv := range invitees {
		pbInvitees[i] = pbInvitee(*inv)
	}
	return connect.NewResponse(&invitev1.AddHouseholdInviteesResponse{Invitees: pbInvitees}), nil
}

func (s *InviteServer) RemoveInvitee(ctx context.Context, req *connect.Request[invitev1.RemoveInviteeRequest]) (*connect.Response[invitev1.RemoveInviteeResponse], error) {
	if err := requireInviteAuth(req.Header().Get("Authorization")); err != nil {
		return nil, err
	}
	if err := s.svc.RemoveInvitee(ctx, req.Msg.InviteeId); err != nil {
		return nil, domainErr(err)
	}
	return connect.NewResponse(&invitev1.RemoveInviteeResponse{}), nil
}

func (s *InviteServer) ListInvitees(ctx context.Context, req *connect.Request[invitev1.ListInviteesRequest]) (*connect.Response[invitev1.ListInviteesResponse], error) {
	if err := requireInviteAuth(req.Header().Get("Authorization")); err != nil {
		return nil, err
	}
	limit := pagination.EffectivePageSize(req.Msg.PageSize)
	offset, err := pagination.DecodeCursor(req.Msg.PageToken)
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	items, err := s.svc.ListInvitees(ctx, req.Msg.EventId, limit, offset)
	if err != nil {
		return nil, domainErr(err)
	}
	pbItems := make([]*invitev1.InviteeWithStatus, len(items))
	for i, it := range items {
		pbItems[i] = &invitev1.InviteeWithStatus{
			Invitee:    pbInvitee(it.Invitee),
			Person:     pbPerson(it.Person),
			RsvpStatus: rsvpStatusToProto(it.RSVPStatus),
		}
	}
	var nextToken string
	if len(items) == limit {
		nextToken = pagination.EncodeCursor(offset + limit)
	}
	return connect.NewResponse(&invitev1.ListInviteesResponse{Invitees: pbItems, NextPageToken: nextToken}), nil
}

// ── RSVP RPCs ─────────────────────────────────────────────────────────────────

func (s *InviteServer) SubmitRSVP(ctx context.Context, req *connect.Request[invitev1.SubmitRSVPRequest]) (*connect.Response[invitev1.SubmitRSVPResponse], error) {
	msg := req.Msg
	rsvp, claimToken, err := s.svc.SubmitRSVP(ctx, domain.SubmitRSVPParams{
		EventID:               msg.EventId,
		HouseholdID:           msg.HouseholdId,
		Status:                rsvpStatusFromProto(msg.Status),
		EmergencyContactName:  msg.EmergencyContactName,
		EmergencyContactPhone: msg.EmergencyContactPhone,
		AttendeePersonIDs:     msg.AttendeePersonIds,
	})
	if err != nil {
		return nil, domainErr(err)
	}
	return connect.NewResponse(&invitev1.SubmitRSVPResponse{
		Rsvp:       pbRSVP(*rsvp),
		ClaimToken: claimToken,
	}), nil
}

func (s *InviteServer) ListHouseholds(ctx context.Context, req *connect.Request[invitev1.ListHouseholdsRequest]) (*connect.Response[invitev1.ListHouseholdsResponse], error) {
	if err := requireInviteAuth(req.Header().Get("Authorization")); err != nil {
		return nil, err
	}
	limit := pagination.EffectivePageSize(req.Msg.PageSize)
	offset, err := pagination.DecodeCursor(req.Msg.PageToken)
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	groups, err := s.svc.ListHouseholds(ctx, req.Msg.EventId, limit, offset)
	if err != nil {
		return nil, domainErr(err)
	}
	pbGroups := make([]*invitev1.HouseholdGroup, len(groups))
	for i, g := range groups {
		attendees := make([]*invitev1.Person, len(g.Attendees))
		for j, a := range g.Attendees {
			attendees[j] = pbPerson(a)
		}
		pbGroups[i] = &invitev1.HouseholdGroup{
			Household:             pbHousehold(g.Household),
			Rsvp:                  pbRSVP(g.RSVP),
			Attendees:             attendees,
			EmergencyContactName:  g.EmergencyContactName,
			EmergencyContactPhone: g.EmergencyContactPhone,
		}
	}
	var nextToken string
	if len(groups) == limit {
		nextToken = pagination.EncodeCursor(offset + limit)
	}
	return connect.NewResponse(&invitev1.ListHouseholdsResponse{Households: pbGroups, NextPageToken: nextToken}), nil
}

// ── Person RPCs (partial auth) ────────────────────────────────────────────────

func (s *InviteServer) GetPerson(ctx context.Context, req *connect.Request[invitev1.GetPersonRequest]) (*connect.Response[invitev1.Person], error) {
	callerUserID, _ := tryGetCallerUserID(req.Header().Get("Authorization"))
	p, err := s.svc.GetPerson(ctx, req.Msg.PersonId, callerUserID, req.Msg.EventToken)
	if err != nil {
		return nil, domainErr(err)
	}
	return connect.NewResponse(pbPerson(*p)), nil
}

func (s *InviteServer) ListPersons(ctx context.Context, req *connect.Request[invitev1.ListPersonsRequest]) (*connect.Response[invitev1.ListPersonsResponse], error) {
	callerUserID, _ := tryGetCallerUserID(req.Header().Get("Authorization"))
	limit := pagination.EffectivePageSize(req.Msg.PageSize)
	offset, err := pagination.DecodeCursor(req.Msg.PageToken)
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	persons, err := s.svc.ListPersons(ctx, callerUserID, req.Msg.EventToken, limit, offset)
	if err != nil {
		return nil, domainErr(err)
	}
	pbPersons := make([]*invitev1.Person, len(persons))
	for i, p := range persons {
		pbPersons[i] = pbPerson(*p)
	}
	var nextToken string
	if len(persons) == limit {
		nextToken = pagination.EncodeCursor(offset + limit)
	}
	return connect.NewResponse(&invitev1.ListPersonsResponse{Persons: pbPersons, NextPageToken: nextToken}), nil
}

func (s *InviteServer) ListEvents(ctx context.Context, req *connect.Request[invitev1.ListEventsRequest]) (*connect.Response[invitev1.ListEventsResponse], error) {
	userID, err := getCallerUserID(req.Header().Get("Authorization"))
	if err != nil {
		return nil, err
	}
	limit := pagination.EffectivePageSize(req.Msg.PageSize)
	offset, decodeErr := pagination.DecodeCursor(req.Msg.PageToken)
	if decodeErr != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, decodeErr)
	}
	events, err := s.svc.ListEvents(ctx, userID, limit, offset)
	if err != nil {
		return nil, domainErr(err)
	}
	pbEvents := make([]*invitev1.Event, len(events))
	for i, e := range events {
		pbEvents[i] = pbEvent(*e)
	}
	var nextToken string
	if len(events) == limit {
		nextToken = pagination.EncodeCursor(offset + limit)
	}
	return connect.NewResponse(&invitev1.ListEventsResponse{Events: pbEvents, NextPageToken: nextToken}), nil
}

func (s *InviteServer) CreatePerson(ctx context.Context, req *connect.Request[invitev1.CreatePersonRequest]) (*connect.Response[invitev1.Person], error) {
	msg := req.Msg
	p, err := s.svc.CreatePerson(ctx, msg.Name, personTypeFromProto(msg.Type), msg.Phone, msg.Email)
	if err != nil {
		return nil, domainErr(err)
	}
	return connect.NewResponse(pbPerson(*p)), nil
}

func (s *InviteServer) CreateHousehold(ctx context.Context, req *connect.Request[invitev1.CreateHouseholdRequest]) (*connect.Response[invitev1.Household], error) {
	h, err := s.svc.CreateHousehold(ctx, req.Msg.Name)
	if err != nil {
		return nil, domainErr(err)
	}
	return connect.NewResponse(pbHousehold(*h)), nil
}

func (s *InviteServer) AddHouseholdMember(ctx context.Context, req *connect.Request[invitev1.AddHouseholdMemberRequest]) (*connect.Response[invitev1.HouseholdMember], error) {
	msg := req.Msg
	member, err := s.svc.AddHouseholdMember(ctx, msg.HouseholdId, msg.PersonId, memberRoleFromProto(msg.Role))
	if err != nil {
		return nil, domainErr(err)
	}
	return connect.NewResponse(&invitev1.HouseholdMember{
		HouseholdId: member.HouseholdID,
		PersonId:    member.PersonID,
		Role:        memberRoleToProto(member.Role),
	}), nil
}

// ── Claim RPC (authenticated) ─────────────────────────────────────────────────

func (s *InviteServer) ClaimHousehold(ctx context.Context, req *connect.Request[invitev1.ClaimHouseholdRequest]) (*connect.Response[invitev1.ClaimHouseholdResponse], error) {
	userID, err := getCallerUserID(req.Header().Get("Authorization"))
	if err != nil {
		return nil, err
	}
	if err := s.svc.ClaimHousehold(ctx, req.Msg.ClaimToken, userID); err != nil {
		return nil, domainErr(err)
	}
	return connect.NewResponse(&invitev1.ClaimHouseholdResponse{}), nil
}

// ── Vercel entrypoint ─────────────────────────────────────────────────────────

// Handler is the Vercel entrypoint for the InviteService.
func Handler(w http.ResponseWriter, r *http.Request) {
	store, err := postgres.NewPostgresInviteStore()
	if err != nil {
		log.Printf("invite: failed to create store: %v", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	svc := domain.NewInviteService(store)
	server := &InviteServer{svc: svc}

	mux := http.NewServeMux()
	_, h := inviteconnect.NewInviteServiceHandler(server)
	mux.Handle("/", h)
	mux.ServeHTTP(w, r)
}
