## ADDED Requirements

### Requirement: Guest accesses event via invite link
The system SHALL allow any visitor with a valid invite URL to view the event details and begin an RSVP.

#### Scenario: Valid invite link
- **WHEN** a guest navigates to an invite URL containing a valid event token
- **THEN** system displays event details (name, date, time, venue, description, host contact, rules summary)

#### Scenario: Invalid or expired event token
- **WHEN** a guest navigates to an invite URL with an invalid or unknown token
- **THEN** system displays a clear error message and does not render event details

### Requirement: Guest identifies which child they are RSVPing for
The system SHALL prompt the guest to select the invited child they are RSVPing for from the event's invitee list, or to identify themselves if the child is not pre-listed.

#### Scenario: Select pre-listed invitee
- **WHEN** guest selects a child from the invitee list
- **THEN** system advances to the household composition step for that invitee

#### Scenario: Child already has confirmed RSVP
- **WHEN** guest selects a child who already has a confirmed RSVP
- **THEN** system displays a message indicating the child is already registered and shows the confirming household details

### Requirement: RSVP form is conditional on event rules
The system SHALL render RSVP form fields based on the event's rules configuration. Fields not applicable under the current rules SHALL be hidden or disabled with an explanation.

#### Scenario: Siblings not allowed — no sibling input shown
- **WHEN** event rules disallow siblings and guest is filling out RSVP
- **THEN** system does not display a sibling count field and SHALL display a note that siblings are not permitted

#### Scenario: Siblings allowed — sibling count input shown
- **WHEN** event rules allow siblings
- **THEN** system displays a numeric input for number of siblings attending

#### Scenario: Parent stay required — parent attending locked to true
- **WHEN** event rules require a parent to stay
- **THEN** system displays a read-only indicator that a parent must stay and counts one adult in the household footprint

### Requirement: Guest submits RSVP for full household
The system SHALL accept a single RSVP submission covering the invited child, optionally one accompanying parent, and optionally a sibling count (if allowed). The system SHALL calculate total headcount from this submission.

#### Scenario: Successful RSVP submission
- **WHEN** guest submits a complete, valid RSVP within available capacity
- **THEN** system confirms the RSVP, associates the household with the invitee, and updates the event's confirmed headcount

#### Scenario: Guest declines
- **WHEN** guest selects "Cannot attend" and submits
- **THEN** system records a declined RSVP for the invitee and does not affect headcount
