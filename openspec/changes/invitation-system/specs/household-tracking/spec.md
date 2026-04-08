## ADDED Requirements

### Requirement: Attendees are grouped by household on the host dashboard
The system SHALL present the host with a view of confirmed RSVPs organized by household (family unit), not as a flat list of individuals.

#### Scenario: Host views attendees by household
- **WHEN** host opens the event attendee dashboard
- **THEN** system displays each confirmed household as a group showing: parent name, child name, sibling count, and total headcount for that household

### Requirement: Emergency contact is captured per RSVP
The system SHALL collect at least one emergency contact (name and phone number) from the RSVPing parent as part of the RSVP submission.

#### Scenario: Emergency contact required at RSVP
- **WHEN** guest submits an RSVP
- **THEN** system SHALL reject the submission if emergency contact name or phone is missing

#### Scenario: Emergency contact visible to host
- **WHEN** host views a confirmed household on the attendee dashboard
- **THEN** emergency contact name and phone SHALL be displayed

### Requirement: Host can view total confirmed headcount
The system SHALL show the host a running total of confirmed attendees vs. venue capacity at all times on the event management page.

#### Scenario: Headcount summary
- **WHEN** host views the event management page
- **THEN** system displays "X of Y spots filled" where X is confirmed headcount and Y is venue capacity
