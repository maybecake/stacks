## MODIFIED Requirements

### Requirement: Host can add a new invitee by name
The guest list panel SHALL include an "Add guest" form implemented by the standalone `PersonCreationForm` component. Submitting it SHALL call `CreatePerson` then `AddInvitee` and refresh the guest list on success. The form SHALL NOT create a household; the newly added person appears in the "Unassigned" section until the host assigns them.

#### Scenario: Host adds a new child invitee
- **WHEN** an authenticated host enters a name, selects type "child", and submits the add-guest form
- **THEN** the page SHALL call `CreatePerson` with the name and type
- **THEN** on success the page SHALL call `AddInvitee` with the new person's ID and the event ID
- **THEN** on success the guest list SHALL refresh and display the newly added person in the "Unassigned" section

#### Scenario: Add invitee fails
- **WHEN** either `CreatePerson` or `AddInvitee` returns an error
- **THEN** the add-guest form SHALL display a user-facing error message and the guest list SHALL NOT change

## MODIFIED Requirements

### Requirement: Host can view the guest list
The page SHALL display the list of current invitees for the host's event grouped by household. The right panel SHALL use the `HouseholdGuestList` component, which calls `ListHouseholds` and `ListInvitees` to build the grouped view.

#### Scenario: Guest list loads on manage mode entry
- **WHEN** the page enters manage mode (event exists or was just created)
- **THEN** the page SHALL call `ListHouseholds` and `ListInvitees` with the event ID
- **THEN** the right panel SHALL display household cards and an "Unassigned" section

#### Scenario: Guest list is empty
- **WHEN** both `ListHouseholds` and `ListInvitees` return empty results
- **THEN** the right panel SHALL display an empty-state message indicating no guests have been added yet

#### Scenario: ListHouseholds or ListInvitees fails
- **WHEN** either RPC returns an error
- **THEN** the right panel SHALL display a user-facing error message
