## ADDED Requirements

### Requirement: Host can reassign a person to a different household
The system SHALL allow a host to move a person from their current household to a different existing household, or to a newly created household, via a reassign action on each member row.

#### Scenario: Host reassigns person to existing household
- **WHEN** host triggers the reassign action on a person row and selects a different household
- **THEN** system calls `RemoveHouseholdMember` with the current household ID and person ID
- **THEN** system calls `AddHouseholdMember` with the target household ID and person ID
- **THEN** guest list refreshes showing the person in the target household

#### Scenario: Host reassigns person to a new household
- **WHEN** host triggers the reassign action and selects "Create new household" with a name
- **THEN** system calls `RemoveHouseholdMember` to remove from the current household
- **THEN** system calls `CreateHousehold` with the new name
- **THEN** system calls `AddHouseholdMember` with the new household and person
- **THEN** guest list refreshes showing the person in the new household card

#### Scenario: Host moves person to unassigned
- **WHEN** host triggers the reassign action and selects "Remove from household"
- **THEN** system calls `RemoveHouseholdMember` with the current household ID and person ID
- **THEN** person moves to the "Unassigned" section in the guest list

#### Scenario: Reassign fails mid-sequence
- **WHEN** any RPC in the reassign sequence returns an error
- **THEN** system displays a user-facing error message
- **THEN** guest list is refreshed to reflect actual server state (no partial UI update left in place)

### Requirement: RemoveHouseholdMember RPC removes a single member from a household
The system SHALL expose a `RemoveHouseholdMember` RPC that removes a person from a specific household without deleting the person or the household. The person becomes unassigned (no household membership) after removal.

#### Scenario: Successful member removal
- **WHEN** host calls `RemoveHouseholdMember` with a valid household_id and person_id
- **THEN** system deletes the `household_members` row for that (household_id, person_id) pair
- **THEN** the person record and household record are unaffected

#### Scenario: Member not found
- **WHEN** `RemoveHouseholdMember` is called with a person_id not in the given household
- **THEN** system returns NotFound

#### Scenario: Unauthorized caller
- **WHEN** a non-host caller attempts `RemoveHouseholdMember`
- **THEN** system returns PermissionDenied
