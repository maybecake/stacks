package domain

import (
	"context"
	"time"
)

// ── Enums ─────────────────────────────────────────────────────────────────────

type PersonType string

const (
	PersonTypeChild PersonType = "child"
	PersonTypeAdult PersonType = "adult"
)

type MemberRole string

const (
	MemberRoleChild    MemberRole = "child"
	MemberRoleGuardian MemberRole = "guardian"
)

type RSVPStatus string

const (
	RSVPStatusConfirmed RSVPStatus = "confirmed"
	RSVPStatusDeclined  RSVPStatus = "declined"
)

// ── Core structs ──────────────────────────────────────────────────────────────

type Person struct {
	ID        string
	Name      string
	Type      PersonType
	Phone     string
	Email     string
	CreatedAt time.Time
}

type Household struct {
	ID        string
	Name      string
	CreatedAt time.Time
}

type HouseholdMember struct {
	HouseholdID string
	PersonID    string
	Role        MemberRole
}

type UserHousehold struct {
	UserID      string
	HouseholdID string
}

type HouseholdClaim struct {
	ID          string
	HouseholdID string
	EventID     string
	ClaimToken  string
	ClaimedAt   *time.Time
	CreatedAt   time.Time
}

type Event struct {
	ID                string
	PublicToken       string
	HostUserID        string
	Name              string
	Venue             string
	Description       string
	Datetime          time.Time
	Capacity          int32
	AllowSiblings     bool
	RequireParentStay bool
	CreatedAt         time.Time
}

type Invitee struct {
	ID          string
	EventID     string
	PersonID    string
	HouseholdID string
}

type InviteeWithStatus struct {
	Invitee    Invitee
	Person     Person
	RSVPStatus RSVPStatus
}

type RSVP struct {
	ID                   string
	EventID              string
	HouseholdID          string
	Status               RSVPStatus
	EmergencyContactName  string
	EmergencyContactPhone string
	CreatedAt            time.Time
}

type RSVPAttendee struct {
	RSVPID   string
	PersonID string
}

type HouseholdGroup struct {
	Household             Household
	RSVP                  RSVP
	Attendees             []Person
	EmergencyContactName  string
	EmergencyContactPhone string
}

// ── Params ────────────────────────────────────────────────────────────────────

type CreateEventParams struct {
	HostUserID        string
	Name              string
	Venue             string
	Description       string
	Datetime          time.Time
	Capacity          int32
	AllowSiblings     bool
	RequireParentStay bool
}

type SubmitRSVPParams struct {
	EventID               string
	HouseholdID           string
	Status                RSVPStatus
	EmergencyContactName  string
	EmergencyContactPhone string
	AttendeePersonIDs     []string
}

// ── InviteStore interface ─────────────────────────────────────────────────────

type InviteStore interface {
	// Events
	CreateEvent(ctx context.Context, p CreateEventParams) (*Event, error)
	GetEventByPublicToken(ctx context.Context, publicToken string) (*Event, error)
	GetEventByID(ctx context.Context, eventID string) (*Event, error)

	// Events
	ListEvents(ctx context.Context, hostUserID string, limit, offset int) ([]*Event, error)

	// Invitees
	AddInvitee(ctx context.Context, eventID, personID string) (*Invitee, error)
	// AddHouseholdInvitees adds one invitee row per child member of the household.
	AddHouseholdInvitees(ctx context.Context, eventID, householdID string) ([]*Invitee, error)
	RemoveInvitee(ctx context.Context, inviteeID string) error
	ListInvitees(ctx context.Context, eventID string, limit, offset int) ([]*InviteeWithStatus, error)
	// HouseholdHasConfirmedRSVP returns true when the invitee's household has a confirmed RSVP.
	InviteeHouseholdHasConfirmedRSVP(ctx context.Context, inviteeID string) (bool, error)

	// RSVPs
	// SubmitRSVP atomically checks capacity, writes invite__rsvps + invite__rsvp_attendees,
	// and creates a household_claims row if the household is unclaimed.
	// Returns the created RSVP and a non-empty claimToken when a claim row was created.
	SubmitRSVP(ctx context.Context, p SubmitRSVPParams) (*RSVP, string, error)
	// ConfirmedAttendeeCount returns the total number of rsvp_attendees across confirmed RSVPs.
	ConfirmedAttendeeCount(ctx context.Context, eventID string) (int, error)
	ListHouseholds(ctx context.Context, eventID string, limit, offset int) ([]*HouseholdGroup, error)

	// Persons
	GetPerson(ctx context.Context, personID string) (*Person, error)
	// IsPersonAccessible checks if callerUserID or eventToken grants access to personID.
	IsPersonAccessible(ctx context.Context, personID, callerUserID, eventToken string) (bool, error)
	ListPersonsForCaller(ctx context.Context, callerUserID, eventToken string, limit, offset int) ([]*Person, error)
	CreatePerson(ctx context.Context, name string, t PersonType, phone, email string) (*Person, error)

	// Households
	CreateHousehold(ctx context.Context, name string) (*Household, error)
	AddHouseholdMember(ctx context.Context, householdID, personID string, role MemberRole) (*HouseholdMember, error)
	GetHousehold(ctx context.Context, householdID string) (*Household, error)
	// HouseholdOwner returns the user_id from user_households, or "" if unclaimed.
	HouseholdOwner(ctx context.Context, householdID string) (string, error)

	// Claims
	ClaimHousehold(ctx context.Context, claimToken, userID string) error
}
