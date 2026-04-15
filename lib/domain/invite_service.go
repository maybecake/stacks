package domain

import (
	"context"
	"errors"
	"fmt"
)

// InviteService implements the invitation system business logic.
// It is a pure domain struct — no HTTP, no gRPC, no ListenAndServe.
type InviteService struct {
	store InviteStore
}

func NewInviteService(store InviteStore) *InviteService {
	return &InviteService{store: store}
}

// ── Events ────────────────────────────────────────────────────────────────────

func (s *InviteService) CreateEvent(ctx context.Context, hostUserID string, p CreateEventParams) (*Event, error) {
	if p.Venue == "" {
		return nil, fmt.Errorf("venue is required: %w", ErrInvalidArgument)
	}
	if p.Datetime.IsZero() {
		return nil, fmt.Errorf("datetime is required: %w", ErrInvalidArgument)
	}
	if p.Capacity <= 0 {
		return nil, fmt.Errorf("capacity must be positive: %w", ErrInvalidArgument)
	}
	p.HostUserID = hostUserID
	return s.store.CreateEvent(ctx, p)
}

func (s *InviteService) GetEvent(ctx context.Context, publicToken string) (*Event, error) {
	event, err := s.store.GetEventByPublicToken(ctx, publicToken)
	if err != nil {
		return nil, err
	}
	if event == nil {
		return nil, ErrNotFound
	}
	return event, nil
}

// ── Invitees ──────────────────────────────────────────────────────────────────

func (s *InviteService) AddInvitee(ctx context.Context, eventID, personID string) (*Invitee, error) {
	return s.store.AddInvitee(ctx, eventID, personID)
}

func (s *InviteService) AddHouseholdInvitees(ctx context.Context, eventID, householdID string) ([]*Invitee, error) {
	return s.store.AddHouseholdInvitees(ctx, eventID, householdID)
}

// RemoveInvitee rejects if the invitee's household has a confirmed RSVP.
func (s *InviteService) RemoveInvitee(ctx context.Context, inviteeID string) error {
	hasRSVP, err := s.store.InviteeHouseholdHasConfirmedRSVP(ctx, inviteeID)
	if err != nil {
		return err
	}
	if hasRSVP {
		return fmt.Errorf("invitee's household has a confirmed RSVP: %w", ErrFailedPrecondition)
	}
	return s.store.RemoveInvitee(ctx, inviteeID)
}

func (s *InviteService) ListInvitees(ctx context.Context, eventID string, limit, offset int) ([]*InviteeWithStatus, error) {
	return s.store.ListInvitees(ctx, eventID, limit, offset)
}

func (s *InviteService) ListEvents(ctx context.Context, hostUserID string, limit, offset int) ([]*Event, error) {
	return s.store.ListEvents(ctx, hostUserID, limit, offset)
}

// ── RSVP ──────────────────────────────────────────────────────────────────────

// SubmitRSVP atomically validates capacity, writes the RSVP + attendees,
// and creates a household_claims row when the household is unclaimed.
// Returns the RSVP and a claim token (empty if household already has an owner).
func (s *InviteService) SubmitRSVP(ctx context.Context, p SubmitRSVPParams) (*RSVP, string, error) {
	if p.EmergencyContactName == "" || p.EmergencyContactPhone == "" {
		return nil, "", fmt.Errorf("emergency contact name and phone are required: %w", ErrInvalidArgument)
	}

	event, err := s.store.GetEventByID(ctx, p.EventID)
	if err != nil {
		return nil, "", err
	}
	if event == nil {
		return nil, "", ErrNotFound
	}

	// capacity check — count existing confirmed attendees + incoming
	if p.Status == RSVPStatusConfirmed {
		confirmed, err := s.store.ConfirmedAttendeeCount(ctx, p.EventID)
		if err != nil {
			return nil, "", err
		}
		incoming := len(p.AttendeePersonIDs)
		if confirmed+incoming > int(event.Capacity) {
			return nil, "", fmt.Errorf(
				"not enough capacity: %d spots remaining, %d requested: %w",
				int(event.Capacity)-confirmed, incoming, ErrResourceExhausted,
			)
		}
	}

	rsvp, claimToken, err := s.store.SubmitRSVP(ctx, p)
	if err != nil {
		if isUniqueViolation(err) {
			hh, _ := s.store.GetHousehold(ctx, p.HouseholdID)
			name := p.HouseholdID
			if hh != nil {
				name = hh.Name
			}
			return nil, "", fmt.Errorf("household %q already has an RSVP for this event: %w", name, ErrAlreadyExists)
		}
		return nil, "", err
	}
	return rsvp, claimToken, nil
}

func (s *InviteService) ListHouseholds(ctx context.Context, eventID string, limit, offset int) ([]*HouseholdGroup, error) {
	return s.store.ListHouseholds(ctx, eventID, limit, offset)
}

// ── Persons ───────────────────────────────────────────────────────────────────

// GetPerson returns the person if the caller has an invite relationship to them.
// Returns ErrNotFound (not ErrPermissionDenied) when the person exists but is inaccessible,
// to avoid revealing whether a person record exists.
func (s *InviteService) GetPerson(ctx context.Context, personID, callerUserID, eventToken string) (*Person, error) {
	accessible, err := s.store.IsPersonAccessible(ctx, personID, callerUserID, eventToken)
	if err != nil {
		return nil, err
	}
	if !accessible {
		return nil, ErrNotFound
	}
	p, err := s.store.GetPerson(ctx, personID)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, ErrNotFound
	}
	return p, nil
}

func (s *InviteService) ListPersons(ctx context.Context, callerUserID, eventToken string, limit, offset int) ([]*Person, error) {
	return s.store.ListPersonsForCaller(ctx, callerUserID, eventToken, limit, offset)
}

func (s *InviteService) CreatePerson(ctx context.Context, name string, t PersonType, phone, email string) (*Person, error) {
	if name == "" {
		return nil, fmt.Errorf("name is required: %w", ErrInvalidArgument)
	}
	return s.store.CreatePerson(ctx, name, t, phone, email)
}

// ── Households ────────────────────────────────────────────────────────────────

func (s *InviteService) CreateHousehold(ctx context.Context, name string) (*Household, error) {
	return s.store.CreateHousehold(ctx, name)
}

func (s *InviteService) AddHouseholdMember(ctx context.Context, householdID, personID string, role MemberRole) (*HouseholdMember, error) {
	return s.store.AddHouseholdMember(ctx, householdID, personID, role)
}

// ── Claims ────────────────────────────────────────────────────────────────────

// ClaimHousehold links an authenticated user to an unclaimed household.
// Returns ErrNotFound when the token is invalid or ErrPermissionDenied when already claimed.
func (s *InviteService) ClaimHousehold(ctx context.Context, claimToken, userID string) error {
	err := s.store.ClaimHousehold(ctx, claimToken, userID)
	if err == nil {
		return nil
	}
	msg := err.Error()
	switch msg {
	case "not found":
		return ErrNotFound
	case "already claimed":
		return fmt.Errorf("claim token has already been used: %w", ErrPermissionDenied)
	}
	return err
}

// ── Sentinel errors ───────────────────────────────────────────────────────────

var (
	ErrInvalidArgument   = errors.New("invalid argument")
	ErrNotFound          = errors.New("not found")
	ErrAlreadyExists     = errors.New("already exists")
	ErrResourceExhausted = errors.New("resource exhausted")
	ErrFailedPrecondition = errors.New("failed precondition")
	ErrPermissionDenied  = errors.New("permission denied")
)

// isUniqueViolation detects a PostgreSQL unique-constraint error by message prefix.
// The pgconn package is in the adapter layer; here we use a simple string check.
func isUniqueViolation(err error) bool {
	if err == nil {
		return false
	}
	// pgconn.PgError Code 23505 = unique_violation
	// We inspect the error string to avoid a direct pgconn import in the domain layer.
	return containsCode23505(err)
}

func containsCode23505(err error) bool {
	type pgcoder interface{ SQLState() string }
	var pc pgcoder
	if errors.As(err, &pc) {
		return pc.SQLState() == "23505"
	}
	// fallback: check error string
	return false
}
