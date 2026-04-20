## 1. Proto Definition

- [x] 1.1 Create `api/protos/invite/invite.proto` — define messages: `Person`, `Household`, `HouseholdMember`, `Event`, `Invitee`, `RSVP`, `RSVPAttendee`
- [x] 1.2 Add `InviteService` RPC methods:
  - `CreateEvent`, `GetEvent`
  - `AddInvitee`, `AddHouseholdInvitees`, `RemoveInvitee`, `ListInvitees`
  - `SubmitRSVP`, `ListHouseholds`
  - `GetPerson`, `CreatePerson`, `CreateHousehold`, `AddHouseholdMember`
  - `ClaimHousehold`
- [x] 1.3 Add `BUILD.bazel` target for `invite_go_proto` and run Gazelle (`bazel run //:gazelle`)
- [x] 1.4 Generate Go stubs and confirm `gen/go/invite/` and `gen/go/invite/inviteconnect/` are produced

## 2. Data Models & Persistence

- [x] 2.1 Define Go structs in `lib/domain/invite.go`: `Person`, `Household`, `HouseholdMember`, `UserHousehold`, `HouseholdClaim`, `Event`, `Invitee`, `RSVP`, `RSVPAttendee`
- [x] 2.2 Define `InviteStore` interface in `lib/domain/invite.go` with methods matching the service RPCs
- [x] 2.3 Implement `lib/adapters/postgres/invite_store.go` satisfying `InviteStore`
- [x] 2.4 Write DB migrations:

  **Migration 1 — core identity tables:**
  ```
  persons (id, name, type, phone, email, created_at)
  households (id, name, created_at)
  household_members (household_id, person_id, role, PK)
  user_households (user_id, household_id, PK)
  household_claims (id, household_id, event_id, claim_token UNIQUE, claimed_at, created_at)
  ```

  **Migration 2 — invitation tables:**
  ```
  invite__events (id, public_token, host_user_id, name, venue, description, datetime, capacity, allow_siblings, require_parent_stay, created_at)
  invite__invitees (id, event_id, person_id, household_id, created_at)
  invite__rsvps (id, event_id, household_id, status, emergency_contact_name, emergency_contact_phone, created_at, UNIQUE(event_id, household_id))
  invite__rsvp_attendees (rsvp_id, person_id, PK)
  ```

## 3. Business Logic (domain layer — no server, no `ListenAndServe`)

- [x] 3.1 Implement `lib/domain/invite_service.go` (pure domain logic struct, not a server):
  - `CreateEvent`, `GetEvent`
  - `AddInvitee`: accepts person_id; validates person exists; records household_id from household_members
  - `AddHouseholdInvitees`: queries `household_members WHERE role='child'`, calls AddInvitee for each
  - `RemoveInvitee`: reject if confirmed RSVP exists for the household
  - `ListInvitees`: return persons with RSVP status per household
- [x] 3.2 Implement `SubmitRSVP`:
  - Validate household has at least one invitee in this event
  - Duplicate guard: `UNIQUE(event_id, household_id)` — return `AlreadyExists` with household name on conflict
  - Write `invite__rsvps` + `invite__rsvp_attendees` rows atomically
  - Generate `household_claims` row with random `claim_token` if household has no `user_households` entry
- [x] 3.3 Implement capacity check in `SubmitRSVP`: `SUM(attendee count per confirmed RSVP) + len(incoming attendees) <= capacity`; return `ResourceExhausted` if over
- [x] 3.4 Implement `ListHouseholds`: JOIN `invite__rsvps → households → household_members → persons + rsvp_attendees`; return one group per household with attendee list and emergency contact
- [x] 3.5 Implement `ClaimHousehold`: validate `claim_token` exists and `claimed_at IS NULL`; create `user_households` row; set `claimed_at`
- [x] 3.6 Implement `GetPerson` / `ListPersons` with invite-relationship scoping:
  - Authenticated owner: return persons in any household linked via `user_households`
  - Authenticated host: return persons who are (or were) invitees in any of the caller's events — JOIN `invite__invitees` ON `host_user_id = caller`; do NOT return persons from claimed households without this prior relationship
  - Unauthenticated RSVP caller: return persons who are invitees on the specific event being RSVPed (event token required in request context)
  - Default: return `NotFound` if no relationship exists

## 4. Vercel Serverless Function Handler

- [x] 4.1 Create `api/invite/invite.go` with `package handler` — follow same structure as `api/yo.go`; this is a Vercel serverless function, NOT a long-running server (`Handler` func, no `ListenAndServe`)
- [x] 4.2 Instantiate `postgres.NewPostgresInviteStore()` inside `Handler`; return 500 on failure
- [x] 4.3 Register `InviteService` with ConnectRPC: `inviteconnect.NewInviteServiceHandler(server)`
- [x] 4.4 Apply `requireAuth` to host-only RPCs: `CreateEvent`, `AddInvitee`, `AddHouseholdInvitees`, `RemoveInvitee`, `ListInvitees`, `ListHouseholds`
- [x] 4.5 Apply `requireAuth` to `ClaimHousehold` (must be authenticated to claim)
- [x] 4.6 Leave `GetEvent`, `SubmitRSVP`, `GetPerson`, `CreatePerson`, `CreateHousehold`, `AddHouseholdMember` unauthenticated (guest RSVP flow)
- [x] 4.7 Add `api/invite.go` to `vercel.json` (or confirm auto-discovery)

## 5. Validation & Error Handling

- [x] 5.1 Return `connect.CodeInvalidArgument` for missing required fields (venue, datetime, capacity on CreateEvent; emergency contact on SubmitRSVP; name on CreatePerson)
- [x] 5.2 Return `connect.CodeAlreadyExists` when `UNIQUE(event_id, household_id)` violated — include household name in error details
- [x] 5.3 Return `connect.CodeResourceExhausted` when RSVP would exceed capacity
- [x] 5.4 Return `connect.CodeNotFound` for unknown event token in `GetEvent`
- [x] 5.5 Return `connect.CodeFailedPrecondition` when host attempts to remove an invitee whose household has a confirmed RSVP
- [x] 5.6 Return `connect.CodeNotFound` or `connect.CodePermissionDenied` when `ClaimHousehold` token is invalid or already claimed
- [x] 5.7 Return `connect.CodeNotFound` (not `PermissionDenied`) when `GetPerson` caller has no invite relationship to the requested person — do not reveal the person exists

## 6. Verification

- [x] 6.1 Confirm `Handler` func signature matches Vercel Go runtime (same as `api/yo.go`)
- [x] 6.2 Smoke test full host flow: `CreateEvent` → `CreateHousehold` → `AddHouseholdInvitees` → `GetEvent`
- [x] 6.3 Smoke test guest flow: `GetEvent` → `SubmitRSVP` (with attendee list) → confirm `household_claims` row created
- [x] 6.4 Verify duplicate guard: second `SubmitRSVP` for same household+event returns `AlreadyExists`
- [x] 6.5 Verify capacity guard: RSVP that would exceed capacity returns `ResourceExhausted`
- [x] 6.6 Verify `ClaimHousehold`: valid token links household to user; second claim attempt returns error
- [x] 6.7 Verify unauthenticated calls to host-only RPCs return `Unauthenticated`
