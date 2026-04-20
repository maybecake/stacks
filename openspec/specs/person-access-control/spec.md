### Requirement: Person records are globally scoped but access-gated
System SHALL store persons in a global table with no owner field. Access to a person record is gated by relationship, not ownership. The caller's identity and context determine which persons they can read.

#### Scenario: Owner reads own household members
- **WHEN** authenticated user calls `GetPerson` or `ListPersons`
- **THEN** system returns persons who are members of any household linked to that user via `user_households`

#### Scenario: Host reads invitees across their events
- **WHEN** authenticated host calls `GetPerson` or `ListPersons`
- **THEN** system returns persons who are (or were) invitees in any event hosted by that user — current and past events
- **AND** system does NOT return persons from claimed households unless a prior invite relationship exists

#### Scenario: Host cannot discover claimed persons without invite relationship
- **WHEN** host attempts to look up a person who belongs to another user's claimed household
- **AND** that person has never been an invitee in any of the host's events
- **THEN** system returns NotFound or empty result; does not reveal the person exists

#### Scenario: Guest reads persons during active RSVP
- **WHEN** unauthenticated caller is submitting an RSVP for a specific event
- **THEN** system returns persons who are invitees on that event (to support selecting the child being RSVPed for)
- **AND** system does NOT return persons outside that event's invitee list

### Requirement: Invite relationship is required before host discovery
System SHALL require that a prior invite relationship exists before a host can access a person from a claimed household. The invite relationship is established in two ways:

1. Host added the person (or their household) to a guest list (`invite__invitees` row exists for any of the host's events)
2. Guest self-identified during RSVP, linking themselves to the event as an invitee

#### Scenario: Host re-invites person from prior event
- **WHEN** host calls `ListPersons` scoped to a prior event or household
- **AND** the person was an invitee on a previous event hosted by the same host
- **THEN** system returns that person

#### Scenario: Host cannot browse global person list
- **WHEN** host calls `ListPersons` without event or household scope
- **THEN** system returns only persons with an established invite relationship to that host's events — not all persons in the database

### Requirement: Future — household-level visibility consent (deferred, not MVP)
System SHALL be architected to support household-level visibility permissions post-MVP. The `households` table as a first-class entity provides the anchor. No implementation is required now.

#### Future scenarios (not implemented in MVP):
- Household grants within-event visibility: other attendees can see contact info
- Household grants host reuse: host may re-invite in future events
- Household grants cross-guest visibility: other parents from the same event can reference the household for future invitations (host-only or all-attendees scope)
