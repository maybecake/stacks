### Requirement: Host can create a household and assign invitees to it
The system SHALL allow a host to create a named household and assign one or more existing invitees to it. A household groups persons who belong to the same family unit and will RSVP together.

#### Scenario: Host creates a new household
- **WHEN** host submits a household name via the household picker
- **THEN** system calls `CreateHousehold` with the given name and returns the new household

#### Scenario: Host assigns an invitee to a household
- **WHEN** host selects a household for an unassigned invitee
- **THEN** system calls `AddHouseholdMember` with the person ID and household ID
- **THEN** the invitee moves from the Unassigned section into the selected household card

#### Scenario: Host assigns an invitee to a new household in one action
- **WHEN** host selects "Create new household" in the household picker and provides a name
- **THEN** system calls `CreateHousehold` then `AddHouseholdMember` in sequence
- **THEN** the invitee appears in the newly created household card

### Requirement: Guest list is displayed grouped by household
The system SHALL display the event guest list as a set of household cards, each showing the household name and its member persons. Persons not yet assigned to any household SHALL appear in a distinct "Unassigned" section.

#### Scenario: Host views guest list with households
- **WHEN** host opens the invite management page with an existing event
- **THEN** system calls `ListHouseholds` to retrieve household groups
- **THEN** system calls `ListInvitees` to retrieve any unassigned invitees
- **THEN** right panel displays one card per household with member names and types
- **THEN** persons not present in any household card appear in an "Unassigned" section

#### Scenario: All invitees are unassigned
- **WHEN** no households exist for the event
- **THEN** right panel shows all invitees in the "Unassigned" section and no household cards

#### Scenario: No invitees at all
- **WHEN** event has no invitees
- **THEN** right panel shows an empty-state message

### Requirement: HouseholdPicker component is standalone and reusable
The `HouseholdPicker` component SHALL accept households as a prop, emit a selection event, and have no direct dependency on RPC clients or event state. It SHALL be usable in any flow that needs household selection or creation.

#### Scenario: HouseholdPicker renders existing households
- **WHEN** HouseholdPicker receives a list of households as a prop
- **THEN** it renders each household as a selectable option plus a "Create new household" option

#### Scenario: HouseholdPicker emits selection
- **WHEN** host selects an existing household
- **THEN** HouseholdPicker calls its `onSelect` callback with the household ID

#### Scenario: HouseholdPicker emits new household name
- **WHEN** host selects "Create new household" and provides a name
- **THEN** HouseholdPicker calls its `onCreate` callback with the provided name

### Requirement: PersonCreationForm component is standalone and reusable
The `PersonCreationForm` component SHALL accept only a submit callback and have no direct dependency on household state, RPC clients, or event state. It SHALL be usable in any flow that needs to collect a person's name and type.

#### Scenario: PersonCreationForm renders independently
- **WHEN** PersonCreationForm is mounted with an `onSubmit` callback
- **THEN** it renders a name field, a type selector (child/adult), and a submit button with no household-related fields

#### Scenario: PersonCreationForm emits person data on submit
- **WHEN** host fills in name and type and submits
- **THEN** PersonCreationForm calls its `onSubmit` callback with `{ name, type }`
