## ADDED Requirements

### Requirement: System detects when an invitee is already registered
The system SHALL check whether an invitee already has a confirmed RSVP before allowing a new RSVP submission for that invitee.

#### Scenario: Second parent attempts RSVP for already-registered child
- **WHEN** a guest selects an invitee who already has a confirmed RSVP and attempts to submit
- **THEN** system displays a clear message that the child is already registered, shows the name of the household that registered them, and prevents a duplicate submission

#### Scenario: First parent RSVPs successfully
- **WHEN** no RSVP exists for an invitee
- **THEN** system allows the RSVP to proceed normally with no duplicate warning

### Requirement: Duplicate detection is shown before form completion
The system SHALL surface duplicate RSVP status at invitee selection time, not at form submission, so the guest does not fill out the full form unnecessarily.

#### Scenario: Early duplicate signal at invitee selection
- **WHEN** guest selects an invitee who already has a confirmed RSVP
- **THEN** system immediately displays the already-registered message and does not advance to the household composition step

### Requirement: Host sees which parent registered each invitee
The system SHALL record the registering parent's name on the RSVP and display it on the host dashboard alongside the invitee.

#### Scenario: Host views registering parent
- **WHEN** host views the guest list or attendee dashboard for a confirmed invitee
- **THEN** the display shows which parent/guardian submitted the RSVP
