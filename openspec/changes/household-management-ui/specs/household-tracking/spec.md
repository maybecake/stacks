## ADDED Requirements

### Requirement: RemoveHouseholdMember RPC exists in InviteService
`InviteService` SHALL expose a `RemoveHouseholdMember` RPC. The request message SHALL carry a `household_id` and `person_id`. The response SHALL be empty on success. The RPC is host-only and requires a valid Clerk JWT.

#### Scenario: Proto defines RemoveHouseholdMember
- **WHEN** the proto is compiled
- **THEN** `RemoveHouseholdMemberRequest` contains `household_id` (string) and `person_id` (string)
- **THEN** `InviteService` includes `rpc RemoveHouseholdMember(RemoveHouseholdMemberRequest) returns (RemoveHouseholdMemberResponse)`

#### Scenario: Handler deletes membership row
- **WHEN** a host calls `RemoveHouseholdMember` with a valid (household_id, person_id) pair
- **THEN** the handler deletes the matching row from `household_members`
- **THEN** neither the `persons` record nor the `households` record is modified
