## ADDED Requirements

### Requirement: Host creates an event
The system SHALL allow a host to create an event by providing logistics and rules configuration. The event SHALL be persisted and assigned a unique public token for sharing.

#### Scenario: Successful event creation
- **WHEN** host submits a valid event form with venue, date/time, capacity, sibling policy, and parent-stay policy
- **THEN** system persists the event and returns a shareable invite URL containing the event's public token

#### Scenario: Missing required field
- **WHEN** host submits the event form without a required field (venue, date, or capacity)
- **THEN** system rejects the request and returns a validation error identifying the missing field

### Requirement: Event has rules configuration
The system SHALL store host-defined attendance rules as part of the event record. Rules SHALL include: maximum headcount (venue capacity), whether siblings are allowed, and whether parents are expected to stay.

#### Scenario: Siblings not allowed
- **WHEN** host sets sibling policy to "not allowed"
- **THEN** the RSVP flow SHALL present a message that siblings cannot attend and SHALL not offer a sibling count input

#### Scenario: Parent stay required
- **WHEN** host sets parent-stay policy to "required"
- **THEN** the RSVP flow SHALL inform guests that a parent must remain for the duration

### Requirement: Event has host contact information
The system SHALL store at least one host contact (name and phone or email) on the event record.

#### Scenario: Contact info displayed to guest
- **WHEN** a guest views the event invite page
- **THEN** host contact information SHALL be visible on the page
