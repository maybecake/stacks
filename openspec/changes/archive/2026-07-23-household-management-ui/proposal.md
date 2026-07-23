## Why

The invite page's "Add Guest" form silently creates a 1:1 household per person, making it impossible for hosts to express that multiple guests belong to the same family. There is no UI to group persons into households, view the guest list by household, or reassign a person to a different household once added.

## What Changes

- **Add guest form** stops silently creating households; it only creates a person and adds them as an invitee
- **Guest list** switches from a flat person list to a household-grouped view, with an "Unassigned" section for persons not yet in any household
- **Household picker component** (standalone, reusable) lets the host select an existing household or name a new one
- **Person creation form component** (standalone, reusable) decoupled from household assignment so either can be used independently in future flows
- **Reassign UI** on each household member row lets the host move a person to a different household
- **`RemoveHouseholdMember` RPC** added to proto and backend to support reassignment

## Capabilities

### New Capabilities
- `household-grouping`: Host can create households, assign invitees to them, and view the guest list grouped by household with an unassigned section
- `household-member-reassignment`: Host can move a person from one household to another (or to unassigned) via a reassign action on each member row

### Modified Capabilities
- `invite-management-page`: Add-guest flow changes — form no longer creates a household; it creates a person + invitee only. Guest list panel changes from flat list to household-grouped view.
- `household-tracking`: Adds `RemoveHouseholdMember` RPC to the service contract.

## Impact

- `api/protos/invite/invite.proto` — new `RemoveHouseholdMemberRequest/Response` messages and RPC
- `service/simple/` — new handler for `RemoveHouseholdMember`
- `frontend/src/features/invite/InviteManager.tsx` — refactored; household creation removed from add-guest path
- `frontend/src/features/invite/` — new components: `PersonCreationForm`, `HouseholdPicker`, `HouseholdCard`, `HouseholdGuestList`
- Generated Connect-RPC stubs must be regenerated after proto change (`buf generate`)
