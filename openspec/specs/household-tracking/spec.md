### Requirement: Household is a persistent, reusable entity
System SHALL store households as first-class records containing named persons. A household persists across events and can be reused when the same family is invited to future events.

#### Scenario: Host invites household
- **WHEN** host calls `AddHouseholdInvitees` with a household_id
- **THEN** system creates one invitee row per child member of that household (household_members WHERE role = 'child')

#### Scenario: Multiple children from same household invited
- **WHEN** two persons from the same household are both invitees on an event
- **THEN** system accepts one RSVP for the household covering both children — no duplicate RSVP required

### Requirement: RSVP is issued per household, not per invitee
System SHALL enforce one RSVP per household per event via a unique constraint on (event_id, household_id).

#### Scenario: Second guardian attempts RSVP
- **WHEN** a second guardian from the same household submits an RSVP for an event already confirmed by that household
- **THEN** system returns AlreadyExists with the household name; does not create a second RSVP

### Requirement: Attendees are named persons, not a count
System SHALL record which specific persons from the household are attending via rsvp_attendees rows. Headcount is derived from COUNT(rsvp_attendees).

#### Scenario: Guardian selects attending members
- **WHEN** guardian submits RSVP
- **THEN** system records each selected person as an rsvp_attendee; headcount = number of attendee rows

### Requirement: Attendees grouped by household on host dashboard
System SHALL present confirmed RSVPs on the host dashboard organised by household, showing: household name, attending persons, total headcount, and emergency contact.

#### Scenario: Host views attendees by household
- **WHEN** host opens event attendee dashboard
- **THEN** system displays each confirmed household as a group with its attending persons and headcount contribution

### Requirement: Emergency contact captured per RSVP
System SHALL collect at least one emergency contact (name and phone) from the RSVPing guardian.

#### Scenario: Emergency contact required
- **WHEN** guardian submits RSVP without emergency contact name or phone
- **THEN** system rejects submission

#### Scenario: Emergency contact visible to host
- **WHEN** host views a confirmed household
- **THEN** emergency contact name and phone SHALL be displayed

### Requirement: Host can view total confirmed headcount
System SHALL show running total of confirmed attendees vs. venue capacity on the event management page.

#### Scenario: Headcount summary
- **WHEN** host views event management page
- **THEN** system displays "X of Y spots filled" where X = SUM of rsvp_attendees across confirmed RSVPs, Y = venue capacity

### Requirement: Orphaned households can be claimed by original submitter
System SHALL generate a claim_token when an unauthenticated RSVP creates a new household. An authenticated user who presents a valid, unclaimed token is linked to that household.

#### Scenario: Claim token issued on RSVP confirmation
- **WHEN** an unauthenticated guest confirms an RSVP and the household has no owner
- **THEN** system creates a household_claims row with a unique claim_token

#### Scenario: Valid claim
- **WHEN** authenticated user presents a valid, unclaimed claim_token
- **THEN** system creates user_households row linking that user to the household and marks the token as claimed

#### Scenario: Invalid or already-claimed token
- **WHEN** claim_token is unknown or already claimed
- **THEN** system returns an error; no household link is created
