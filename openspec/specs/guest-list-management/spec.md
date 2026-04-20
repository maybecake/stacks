### Requirement: Host manages invited children
The system SHALL allow a host to add, edit, and remove invited children (invitees) on an event. Each invitee represents a child whose attendance is the target of an invitation.

#### Scenario: Add invitee
- **WHEN** host adds a child's name to the guest list
- **THEN** system creates an Invitee record associated with the event

#### Scenario: Remove invitee
- **WHEN** host removes an invitee who has not yet RSVPed
- **THEN** system deletes the invitee record

#### Scenario: Cannot remove RSVPed invitee
- **WHEN** host attempts to remove an invitee who already has a confirmed RSVP
- **THEN** system rejects the request and returns an error indicating the invitee has an active RSVP

### Requirement: Host may associate known parents with an invitee
The system SHALL allow a host to optionally link up to two parent records (name and contact) to an invitee. Parent association is not required; guests may also self-identify at RSVP time.

#### Scenario: Add parent to invitee
- **WHEN** host provides a parent name and contact for an invitee
- **THEN** system stores the parent as associated with that invitee

#### Scenario: Invitee has no pre-linked parents
- **WHEN** an invitee has no pre-linked parents
- **THEN** the RSVP flow SHALL allow any visitor to self-identify as that child's parent/guardian and proceed

### Requirement: Host views guest list status
The system SHALL provide the host a view of all invitees with their current RSVP status (pending, confirmed, declined).

#### Scenario: Guest list overview
- **WHEN** host opens the event management page
- **THEN** system displays each invitee with their RSVP status and the confirmed headcount contribution of their household
