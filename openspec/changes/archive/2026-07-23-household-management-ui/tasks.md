## 1. Proto + Backend

- [x] 1.1 Add `RemoveHouseholdMemberRequest` and `RemoveHouseholdMemberResponse` messages to `api/protos/invite/invite.proto`
- [x] 1.2 Add `rpc RemoveHouseholdMember(RemoveHouseholdMemberRequest) returns (RemoveHouseholdMemberResponse)` to `InviteService` in the proto
- [x] 1.3 Add optional `Household household = 4` field to `InviteeWithStatus` in the proto so the frontend gets household name alongside each invitee
- [x] 1.4 Run `buf generate` from repo root to regenerate Go and TypeScript stubs
- [x] 1.5 Add DB migration: `ALTER TABLE invite__invitees ALTER COLUMN household_id DROP NOT NULL` (new file in `drizzle/migrations/`)
- [x] 1.6 Add SQL queries to `lib/adapters/postgres/queries/invite.sql`: `DeleteHouseholdMember`, `UpdateInviteeHouseholdByPerson`, `ClearInviteeHouseholdByPersonAndHousehold`; modify `ListInviteesWithStatus` to LEFT JOIN households and return `household_name` and `household_id`; modify `InsertInvitee` params to accept nullable `household_id`
- [x] 1.7 Run `sqlc generate` from repo root to regenerate `lib/adapters/postgres/db/`
- [x] 1.8 Add `RemoveHouseholdMember(ctx, householdID, personID string) error` to `domain.InviteStore` interface in `lib/domain/invite.go`
- [x] 1.9 Implement `RemoveHouseholdMember` in `lib/domain/invite_service.go`: call `store.RemoveHouseholdMember`; return `ErrNotFound` if absent
- [x] 1.10 Implement `RemoveHouseholdMember` in `lib/adapters/postgres/invite_store.go`: in a transaction, delete the `household_members` row and run `ClearInviteeHouseholdByPersonAndHousehold`
- [x] 1.11 Update `AddHouseholdMember` in `lib/adapters/postgres/invite_store.go`: in a transaction, insert `household_members` row and run `UpdateInviteeHouseholdByPerson`
- [x] 1.12 Update `AddInvitee` in `lib/adapters/postgres/invite_store.go`: remove `personHousehold` lookup; pass null UUID when person has no household
- [x] 1.13 Update `ListInvitees` in `lib/adapters/postgres/invite_store.go` and `api/invite/index.go` to populate the new `Household` field in `InviteeWithStatus`
- [x] 1.14 Add `RemoveHouseholdMember` handler to `api/invite/index.go`

## 2. Frontend — Standalone Components

- [x] 2.1 Create `frontend/src/features/invite/PersonCreationForm.tsx`: name input + type selector (child/adult) + submit button; accepts `onSubmit({ name, type })` callback; no RPC calls; no household fields
- [x] 2.2 Create `frontend/src/features/invite/HouseholdPicker.tsx`: receives `households: Household[]` prop; renders selectable list + "Create new household" option; calls `onSelect(householdId)` or `onCreate(householdName)`; no RPC calls
- [x] 2.3 Export both components from `frontend/src/features/invite/index.ts`

## 3. Frontend — Household Guest List

- [x] 3.1 Create `frontend/src/features/invite/HouseholdCard.tsx`: renders household name + member rows; each row has a "reassign" button that opens inline `HouseholdPicker`; accepts `household`, `members`, `allHouseholds`, and `onReassign(personId, targetHouseholdId | null, newHouseholdName?)` callbacks
- [x] 3.2 Create `frontend/src/features/invite/UnassignedSection.tsx`: renders list of unassigned persons; each row has an "assign" button that opens inline `HouseholdPicker`; accepts `persons`, `allHouseholds`, and `onAssign(personId, householdId | null, newHouseholdName?)` callbacks
- [x] 3.3 Create `frontend/src/features/invite/HouseholdGuestList.tsx`: calls `ListInvitees` on mount and after each mutation; groups invitees by `invitee.household_id` (null → Unassigned); handles `RemoveHouseholdMember` + `AddHouseholdMember` (and optionally `CreateHousehold`) sequences for reassign/assign actions; re-fetches on any error and surfaces error message
- [x] 3.4 Add `PersonCreationForm` inside `HouseholdGuestList` as the "Add guest" entry point; on submit call `CreatePerson` + `AddInvitee` then re-fetch

## 4. Frontend — InviteManager Wiring

- [x] 4.1 Remove household-creation logic from `InviteManager.handleAddGuest` (the `createHousehold` + `addHouseholdMember` calls)
- [x] 4.2 Replace the right panel's flat invitee list and inline add-guest form with `HouseholdGuestList`
- [x] 4.3 Remove now-unused state: `guestName`, `guestType`, `addGuestLoading`, `addGuestError`, `invitees`, `inviteesLoading`, `inviteesError` from `InviteManager` (all moved into `HouseholdGuestList`)
- [x] 4.4 Verify `pnpm build` passes with no TypeScript errors
