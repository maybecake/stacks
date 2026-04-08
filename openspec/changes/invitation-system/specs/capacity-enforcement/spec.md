## ADDED Requirements

### Requirement: System enforces venue capacity before confirming RSVP
The system SHALL atomically check remaining capacity and reject any RSVP whose household headcount would cause total confirmed attendees to exceed the event's venue capacity limit.

#### Scenario: RSVP fits within remaining capacity
- **WHEN** a guest submits an RSVP and the household headcount is less than or equal to remaining capacity
- **THEN** system confirms the RSVP and deducts the headcount from remaining capacity

#### Scenario: RSVP exceeds remaining capacity
- **WHEN** a guest submits an RSVP and the household headcount would exceed remaining capacity
- **THEN** system rejects the RSVP and returns a clear error message stating how many spots remain

#### Scenario: Simultaneous submissions race
- **WHEN** two guests submit RSVPs simultaneously and only one can fit
- **THEN** system confirms exactly one RSVP and rejects the other with a capacity error

### Requirement: Remaining capacity is visible to guests during RSVP
The system SHALL display the number of remaining spots to the guest before they submit, so they can adjust their household size if needed.

#### Scenario: Spots available shown
- **WHEN** guest views the RSVP form
- **THEN** system displays the current number of remaining spots

#### Scenario: Event is full
- **WHEN** remaining capacity is zero
- **THEN** system displays a "This event is full" message and disables the RSVP submission form

### Requirement: Capacity counts include all household members
The system SHALL calculate headcount as: 1 (invited child) + (1 if parent attending) + (sibling count).

#### Scenario: Child only
- **WHEN** RSVP includes only the child with no parent and no siblings
- **THEN** headcount contribution is 1

#### Scenario: Full household
- **WHEN** RSVP includes child + 1 parent + 2 siblings
- **THEN** headcount contribution is 4
