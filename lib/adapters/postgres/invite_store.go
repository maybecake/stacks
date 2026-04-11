package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"

	pgdb "github.com/maybecake/stacks/lib/adapters/postgres/db"
	"github.com/maybecake/stacks/lib/domain"
)

// PostgresInviteStore implements domain.InviteStore using pgx + sqlc.
type PostgresInviteStore struct {
	db *sql.DB
}

var _ domain.InviteStore = (*PostgresInviteStore)(nil)

// NewPostgresInviteStore opens a pgx connection using DATABASE_URL.
func NewPostgresInviteStore() (*PostgresInviteStore, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL is not set")
	}
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}
	return &PostgresInviteStore{db: db}, nil
}

// ── helpers ───────────────────────────────────────────────────────────────────

func isPGUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func mustParseUUID(s string) (uuid.UUID, error) {
	if s == "" {
		return uuid.UUID{}, fmt.Errorf("empty UUID string")
	}
	return uuid.Parse(s)
}

func domainPerson(p pgdb.Person) domain.Person {
	return domain.Person{
		ID:        p.ID.String(),
		Name:      p.Name,
		Type:      domain.PersonType(p.Type),
		Phone:     p.Phone.String,
		Email:     p.Email.String,
		CreatedAt: p.CreatedAt,
	}
}

func domainHousehold(h pgdb.Household) domain.Household {
	return domain.Household{
		ID:        h.ID.String(),
		Name:      h.Name.String,
		CreatedAt: h.CreatedAt,
	}
}

func domainEvent(e pgdb.InviteEvent) domain.Event {
	return domain.Event{
		ID:                e.ID.String(),
		PublicToken:       e.PublicToken.String(),
		HostUserID:        e.HostUserID,
		Name:              e.Name,
		Venue:             e.Venue,
		Description:       e.Description.String,
		Datetime:          e.Datetime,
		Capacity:          e.Capacity,
		AllowSiblings:     e.AllowSiblings,
		RequireParentStay: e.RequireParentStay,
		CreatedAt:         e.CreatedAt,
	}
}

func domainInvitee(i pgdb.InviteInvitee) domain.Invitee {
	return domain.Invitee{
		ID:          i.ID.String(),
		EventID:     i.EventID.String(),
		PersonID:    i.PersonID.String(),
		HouseholdID: i.HouseholdID.String(),
	}
}

func domainRSVP(r pgdb.InviteRsvp) domain.RSVP {
	return domain.RSVP{
		ID:                   r.ID.String(),
		EventID:              r.EventID.String(),
		HouseholdID:          r.HouseholdID.String(),
		Status:               domain.RSVPStatus(r.Status),
		EmergencyContactName:  r.EmergencyContactName,
		EmergencyContactPhone: r.EmergencyContactPhone,
		CreatedAt:            r.CreatedAt,
	}
}

// ── Events ────────────────────────────────────────────────────────────────────

func (s *PostgresInviteStore) CreateEvent(ctx context.Context, p domain.CreateEventParams) (*domain.Event, error) {
	q := pgdb.New(s.db)
	row, err := q.InsertEvent(ctx, pgdb.InsertEventParams{
		HostUserID:        p.HostUserID,
		Name:              p.Name,
		Venue:             p.Venue,
		Description:       sql.NullString{String: p.Description, Valid: p.Description != ""},
		Datetime:          p.Datetime,
		Capacity:          p.Capacity,
		AllowSiblings:     p.AllowSiblings,
		RequireParentStay: p.RequireParentStay,
	})
	if err != nil {
		return nil, err
	}
	e := domainEvent(row)
	return &e, nil
}

func (s *PostgresInviteStore) GetEventByPublicToken(ctx context.Context, publicToken string) (*domain.Event, error) {
	tok, err := mustParseUUID(publicToken)
	if err != nil {
		return nil, err
	}
	q := pgdb.New(s.db)
	row, err := q.GetEventByPublicToken(ctx, tok)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	e := domainEvent(row)
	return &e, nil
}

func (s *PostgresInviteStore) GetEventByID(ctx context.Context, eventID string) (*domain.Event, error) {
	id, err := mustParseUUID(eventID)
	if err != nil {
		return nil, err
	}
	q := pgdb.New(s.db)
	row, err := q.GetEventByID(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	e := domainEvent(row)
	return &e, nil
}

// ── Persons ───────────────────────────────────────────────────────────────────

func (s *PostgresInviteStore) CreatePerson(ctx context.Context, name string, t domain.PersonType, phone, email string) (*domain.Person, error) {
	q := pgdb.New(s.db)
	row, err := q.InsertPerson(ctx, pgdb.InsertPersonParams{
		Name:  name,
		Type:  string(t),
		Phone: sql.NullString{String: phone, Valid: phone != ""},
		Email: sql.NullString{String: email, Valid: email != ""},
	})
	if err != nil {
		return nil, err
	}
	p := domainPerson(row)
	return &p, nil
}

func (s *PostgresInviteStore) GetPerson(ctx context.Context, personID string) (*domain.Person, error) {
	id, err := mustParseUUID(personID)
	if err != nil {
		return nil, err
	}
	q := pgdb.New(s.db)
	row, err := q.GetPersonByID(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	p := domainPerson(row)
	return &p, nil
}

func (s *PostgresInviteStore) IsPersonAccessible(ctx context.Context, personID, callerUserID, eventToken string) (bool, error) {
	pid, err := mustParseUUID(personID)
	if err != nil {
		return false, err
	}
	q := pgdb.New(s.db)

	// owner check
	if callerUserID != "" {
		ok, err := q.PersonIsAccessibleToOwner(ctx, pgdb.PersonIsAccessibleToOwnerParams{PersonID: pid, UserID: callerUserID})
		if err != nil {
			return false, err
		}
		if ok {
			return true, nil
		}
		// host check
		ok, err = q.PersonIsAccessibleToHost(ctx, pgdb.PersonIsAccessibleToHostParams{PersonID: pid, HostUserID: callerUserID})
		if err != nil {
			return false, err
		}
		if ok {
			return true, nil
		}
	}

	// unauthenticated RSVP context
	if eventToken != "" {
		tok, err := mustParseUUID(eventToken)
		if err != nil {
			return false, err
		}
		ok, err := q.PersonIsAccessibleViaEvent(ctx, pgdb.PersonIsAccessibleViaEventParams{PersonID: pid, PublicToken: tok})
		if err != nil {
			return false, err
		}
		if ok {
			return true, nil
		}
	}

	return false, nil
}

func (s *PostgresInviteStore) ListPersonsForCaller(ctx context.Context, callerUserID, eventToken string) ([]*domain.Person, error) {
	q := pgdb.New(s.db)
	seen := map[uuid.UUID]bool{}
	var result []*domain.Person

	addRows := func(rows []pgdb.Person) {
		for _, r := range rows {
			if !seen[r.ID] {
				seen[r.ID] = true
				p := domainPerson(r)
				result = append(result, &p)
			}
		}
	}

	if callerUserID != "" {
		rows, err := q.ListPersonsForOwner(ctx, callerUserID)
		if err != nil {
			return nil, err
		}
		addRows(rows)

		rows, err = q.ListPersonsForHost(ctx, callerUserID)
		if err != nil {
			return nil, err
		}
		addRows(rows)
	}

	if eventToken != "" {
		tok, err := mustParseUUID(eventToken)
		if err != nil {
			return nil, err
		}
		rows, err := q.ListPersonsForEvent(ctx, tok)
		if err != nil {
			return nil, err
		}
		addRows(rows)
	}

	return result, nil
}

// ── Households ────────────────────────────────────────────────────────────────

func (s *PostgresInviteStore) CreateHousehold(ctx context.Context, name string) (*domain.Household, error) {
	q := pgdb.New(s.db)
	row, err := q.InsertHousehold(ctx, sql.NullString{String: name, Valid: name != ""})
	if err != nil {
		return nil, err
	}
	h := domainHousehold(row)
	return &h, nil
}

func (s *PostgresInviteStore) GetHousehold(ctx context.Context, householdID string) (*domain.Household, error) {
	id, err := mustParseUUID(householdID)
	if err != nil {
		return nil, err
	}
	q := pgdb.New(s.db)
	row, err := q.GetHouseholdByID(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	h := domainHousehold(row)
	return &h, nil
}

func (s *PostgresInviteStore) AddHouseholdMember(ctx context.Context, householdID, personID string, role domain.MemberRole) (*domain.HouseholdMember, error) {
	hid, err := mustParseUUID(householdID)
	if err != nil {
		return nil, err
	}
	pid, err := mustParseUUID(personID)
	if err != nil {
		return nil, err
	}
	q := pgdb.New(s.db)
	row, err := q.InsertHouseholdMember(ctx, pgdb.InsertHouseholdMemberParams{
		HouseholdID: hid,
		PersonID:    pid,
		Role:        string(role),
	})
	if err != nil {
		return nil, err
	}
	return &domain.HouseholdMember{
		HouseholdID: row.HouseholdID.String(),
		PersonID:    row.PersonID.String(),
		Role:        domain.MemberRole(row.Role),
	}, nil
}

func (s *PostgresInviteStore) HouseholdOwner(ctx context.Context, householdID string) (string, error) {
	id, err := mustParseUUID(householdID)
	if err != nil {
		return "", err
	}
	q := pgdb.New(s.db)
	userID, err := q.GetHouseholdOwner(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	return userID, err
}

// ── Invitees ──────────────────────────────────────────────────────────────────

func (s *PostgresInviteStore) AddInvitee(ctx context.Context, eventID, personID string) (*domain.Invitee, error) {
	eid, err := mustParseUUID(eventID)
	if err != nil {
		return nil, err
	}
	pid, err := mustParseUUID(personID)
	if err != nil {
		return nil, err
	}

	// resolve household from household_members
	q := pgdb.New(s.db)
	members, err := q.GetHouseholdChildMembers(ctx, pid) // we just need any membership
	_ = members
	// Actually we need to look up which household the person belongs to.
	// We use ListPersonsForOwner etc., but here we need a direct lookup.
	// Use a raw query since sqlc doesn't have a direct person→household query.
	householdID, err := s.personHousehold(ctx, pid)
	if err != nil {
		return nil, err
	}

	row, err := q.InsertInvitee(ctx, pgdb.InsertInviteeParams{
		EventID:     eid,
		PersonID:    pid,
		HouseholdID: householdID,
	})
	if err != nil {
		return nil, err
	}
	inv := domainInvitee(row)
	return &inv, nil
}

// personHousehold returns the first household the person belongs to.
func (s *PostgresInviteStore) personHousehold(ctx context.Context, personID uuid.UUID) (uuid.UUID, error) {
	var householdID uuid.UUID
	row := s.db.QueryRowContext(ctx,
		`SELECT household_id FROM household_members WHERE person_id = $1 LIMIT 1`,
		personID,
	)
	if err := row.Scan(&householdID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return uuid.UUID{}, fmt.Errorf("person %s has no household", personID)
		}
		return uuid.UUID{}, err
	}
	return householdID, nil
}

func (s *PostgresInviteStore) AddHouseholdInvitees(ctx context.Context, eventID, householdID string) ([]*domain.Invitee, error) {
	eid, err := mustParseUUID(eventID)
	if err != nil {
		return nil, err
	}
	hid, err := mustParseUUID(householdID)
	if err != nil {
		return nil, err
	}
	q := pgdb.New(s.db)
	children, err := q.GetHouseholdChildMembers(ctx, hid)
	if err != nil {
		return nil, err
	}
	var invitees []*domain.Invitee
	for _, c := range children {
		row, err := q.InsertInvitee(ctx, pgdb.InsertInviteeParams{
			EventID:     eid,
			PersonID:    c.PersonID,
			HouseholdID: hid,
		})
		if err != nil {
			if isPGUniqueViolation(err) {
				continue // already invited
			}
			return nil, err
		}
		inv := domainInvitee(row)
		invitees = append(invitees, &inv)
	}
	return invitees, nil
}

func (s *PostgresInviteStore) RemoveInvitee(ctx context.Context, inviteeID string) error {
	id, err := mustParseUUID(inviteeID)
	if err != nil {
		return err
	}
	q := pgdb.New(s.db)
	return q.DeleteInvitee(ctx, id)
}

func (s *PostgresInviteStore) ListInvitees(ctx context.Context, eventID string) ([]*domain.InviteeWithStatus, error) {
	eid, err := mustParseUUID(eventID)
	if err != nil {
		return nil, err
	}
	q := pgdb.New(s.db)
	rows, err := q.ListInviteesWithStatus(ctx, eid)
	if err != nil {
		return nil, err
	}
	result := make([]*domain.InviteeWithStatus, len(rows))
	for i, r := range rows {
		result[i] = &domain.InviteeWithStatus{
			Invitee: domain.Invitee{
				ID:          r.InviteeID.String(),
				EventID:     r.EventID.String(),
				PersonID:    r.PersonID.String(),
				HouseholdID: r.HouseholdID.String(),
			},
			Person: domain.Person{
				ID:    r.PersonID.String(),
				Name:  r.PersonName,
				Type:  domain.PersonType(r.PersonType),
				Phone: r.PersonPhone.String,
				Email: r.PersonEmail.String,
			},
			RSVPStatus: domain.RSVPStatus(r.RsvpStatus),
		}
	}
	return result, nil
}

func (s *PostgresInviteStore) InviteeHouseholdHasConfirmedRSVP(ctx context.Context, inviteeID string) (bool, error) {
	id, err := mustParseUUID(inviteeID)
	if err != nil {
		return false, err
	}
	q := pgdb.New(s.db)
	return q.InviteeHouseholdHasConfirmedRSVP(ctx, id)
}

// ── RSVPs ─────────────────────────────────────────────────────────────────────

func (s *PostgresInviteStore) SubmitRSVP(ctx context.Context, p domain.SubmitRSVPParams) (*domain.RSVP, string, error) {
	eid, err := mustParseUUID(p.EventID)
	if err != nil {
		return nil, "", err
	}
	hid, err := mustParseUUID(p.HouseholdID)
	if err != nil {
		return nil, "", err
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, "", err
	}
	defer func() { _ = tx.Rollback() }()

	q := pgdb.New(tx)

	rsvpRow, err := q.InsertRSVP(ctx, pgdb.InsertRSVPParams{
		EventID:               eid,
		HouseholdID:           hid,
		Status:                string(p.Status),
		EmergencyContactName:  p.EmergencyContactName,
		EmergencyContactPhone: p.EmergencyContactPhone,
	})
	if err != nil {
		return nil, "", err
	}

	for _, pidStr := range p.AttendeePersonIDs {
		pid, err := mustParseUUID(pidStr)
		if err != nil {
			return nil, "", err
		}
		if err := q.InsertRSVPAttendee(ctx, pgdb.InsertRSVPAttendeeParams{
			RsvpID:   rsvpRow.ID,
			PersonID: pid,
		}); err != nil {
			return nil, "", err
		}
	}

	// create claim row if household is unclaimed
	claimToken := ""
	owner, err := q.GetHouseholdOwner(ctx, hid)
	if errors.Is(err, sql.ErrNoRows) || owner == "" {
		claim, err := q.InsertHouseholdClaim(ctx, pgdb.InsertHouseholdClaimParams{
			HouseholdID: hid,
			EventID:     eid,
		})
		if err != nil {
			return nil, "", err
		}
		claimToken = claim.ClaimToken.String()
	} else if err != nil {
		return nil, "", err
	}

	if err := tx.Commit(); err != nil {
		return nil, "", err
	}

	rsvp := domainRSVP(rsvpRow)
	return &rsvp, claimToken, nil
}

func (s *PostgresInviteStore) ConfirmedAttendeeCount(ctx context.Context, eventID string) (int, error) {
	eid, err := mustParseUUID(eventID)
	if err != nil {
		return 0, err
	}
	q := pgdb.New(s.db)
	count, err := q.ConfirmedAttendeeCount(ctx, eid)
	return int(count), err
}

func (s *PostgresInviteStore) ListHouseholds(ctx context.Context, eventID string) ([]*domain.HouseholdGroup, error) {
	eid, err := mustParseUUID(eventID)
	if err != nil {
		return nil, err
	}
	q := pgdb.New(s.db)
	rows, err := q.ListHouseholdGroups(ctx, eid)
	if err != nil {
		return nil, err
	}

	// group rows by household
	groups := map[uuid.UUID]*domain.HouseholdGroup{}
	var order []uuid.UUID
	for _, r := range rows {
		if _, exists := groups[r.HouseholdID]; !exists {
			order = append(order, r.HouseholdID)
			groups[r.HouseholdID] = &domain.HouseholdGroup{
				Household: domain.Household{
					ID:   r.HouseholdID.String(),
					Name: r.HouseholdName.String,
				},
				RSVP: domain.RSVP{
					ID:                   r.RsvpID.String(),
					EventID:              eventID,
					HouseholdID:          r.HouseholdID.String(),
					Status:               domain.RSVPStatus(r.RsvpStatus),
					EmergencyContactName:  r.EmergencyContactName,
					EmergencyContactPhone: r.EmergencyContactPhone,
					CreatedAt:            r.RsvpCreatedAt,
				},
				EmergencyContactName:  r.EmergencyContactName,
				EmergencyContactPhone: r.EmergencyContactPhone,
			}
		}
		groups[r.HouseholdID].Attendees = append(groups[r.HouseholdID].Attendees, domain.Person{
			ID:    r.PersonID.String(),
			Name:  r.PersonName,
			Type:  domain.PersonType(r.PersonType),
			Phone: r.PersonPhone.String,
			Email: r.PersonEmail.String,
		})
	}

	result := make([]*domain.HouseholdGroup, 0, len(order))
	for _, id := range order {
		result = append(result, groups[id])
	}
	return result, nil
}

// ── Claims ────────────────────────────────────────────────────────────────────

func (s *PostgresInviteStore) ClaimHousehold(ctx context.Context, claimToken, userID string) error {
	tok, err := mustParseUUID(claimToken)
	if err != nil {
		return err
	}
	q := pgdb.New(s.db)
	claim, err := q.GetHouseholdClaimByToken(ctx, tok)
	if errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("not found")
	}
	if err != nil {
		return err
	}
	if claim.ClaimedAt.Valid {
		return fmt.Errorf("already claimed")
	}
	if err := q.MarkClaimClaimed(ctx, tok); err != nil {
		return err
	}
	return q.InsertUserHousehold(ctx, pgdb.InsertUserHouseholdParams{
		UserID:      userID,
		HouseholdID: claim.HouseholdID,
	})
}
