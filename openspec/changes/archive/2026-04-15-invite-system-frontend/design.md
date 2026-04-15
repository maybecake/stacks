## Context

The backend invitation system is complete: gRPC service methods, Postgres migrations, sqlc adapters, and Vercel serverless handlers are all deployed. The generated gRPC-Web client stubs already exist at `frontend/src/gen/invite/invite_pb.d.ts` and expose `InviteService` with `CreateEvent`, `GetEvent`, `AddInvitee`, `RemoveInvitee`, `ListInvitees`, and `CreatePerson` RPCs.

The frontend currently has no route or feature component for invites. Existing patterns to follow: `frontend/src/features/greetings/` (gRPC client creation, Clerk auth, Connect transport), `frontend/src/components/layout/TwoColumnLayout` (page layout), and `frontend/src/lib/authInterceptor.ts` (JWT injection).

For this demo, one event per host is a deliberate simplification — not a technical constraint. The backend has no uniqueness check on `host_user_id`; multiple events are possible at the DB level. The single-event UX will be replaced by a proper event list + selector once the demo phase is complete.

## Goals / Non-Goals

**Goals:**
- New authenticated `/invite` route rendered by a `InviteManager` feature component
- Host can create an event via a form (name, venue, datetime, capacity, allow_siblings, require_parent_stay)
- Host whose event already exists sees event details instead of the creation form
- Host can view the guest list for their event (calls `ListInvitees`)
- Host can add a new invitee by name and type (calls `CreatePerson` then `AddInvitee`)
- Navigation entry in Header for the invite page
- Auth gate: unauthenticated users see a sign-in prompt (same Clerk `Show` pattern as greetings)

**Non-Goals:**
- Guest-facing RSVP flow (separate future change)
- Household-grouped attendee dashboard (`ListHouseholdsResponse` view)
- Capacity enforcement visualization
- Duplicate RSVP detection UI
- Remove invitee UI (can be added later; `RemoveInvitee` RPC exists)
- Email / link sharing for the invite URL

## Decisions

### 1. Two-panel layout using TwoColumnLayout

The page uses the existing `TwoColumnLayout` component: left panel = event configuration (create form or event detail view), right panel = guest list. This mirrors how the rest of the app structures multi-section pages.

*Alternative:* Single vertical stack. Rejected — creates excessive scrolling when both panels are populated.

### 2. Local React state, no global store

State (event data, invitee list, loading/error flags) lives in `InviteManager` and is passed down as props. Consistent with greetings feature which uses no external state manager.

*Alternative:* Zustand or Context. Rejected as over-engineering for a single-feature page.

### 3. gRPC client created per-operation, sharing transport config

Follow the exact pattern in `HelloCard.tsx`: `createConnectTransport({ baseUrl: "", interceptors: [makeAuthInterceptor(getToken)] })` + `createClient(InviteService, transport)` inside each handler. No singleton client — avoids stale auth token issues.

### 4. Event ownership check via ListEvents RPC on mount

On mount, `InviteManager` calls `ListEvents` (filtered to the authenticated caller's `host_user_id` server-side via JWT). If at least one event is returned, the component enters manage mode using the first result. If the list is empty, the creation form is shown.

This requires a `ListEvents` RPC to be added to the backend `InviteService` — it takes no parameters beyond the JWT and returns all events owned by the caller. This is a small backend task that unblocks clean frontend ownership lookup with no client-side state.

`localStorage` was considered as a workaround (store event ID after `CreateEvent`, read on next visit) but rejected: it breaks across browsers/devices and is cleared by users, making it unreliable as the source of truth for event ownership.

### 5. Add invitee: two-step RPC (CreatePerson → AddInvitee)

The `AddInvitee` RPC takes `person_id` (not a name). To add a new guest by name, the UI calls `CreatePerson` first to get the ID, then `AddInvitee`. Both calls happen in one handler; error from either surfaces as a single user-facing error message.

*Alternative:* Require host to first create persons in a separate form. Rejected — too much friction for the common case of typing a new child's name to add them.

### 6. Auth gate at route level via Clerk Show component

The `InviteManager` wraps its content in `<Show when="signed-in">` and renders a sign-in prompt for `"signed-out"`. Same approach as all greeting cards. No higher-order route wrapper needed.

## Risks / Trade-offs

- **ListEvents RPC does not exist yet**: Backend must add `ListEvents` before the frontend ownership check can be implemented. Frontend is blocked on this. → Track as a backend prerequisite task.
- **CreatePerson + AddInvitee not atomic**: If `CreatePerson` succeeds but `AddInvitee` fails, an orphaned person record exists. → Surface clear error and allow retry; orphaned persons are a known accepted trade-off in the backend design.
- **No invitee removal UI in demo**: Host cannot remove a guest from the list via the UI even though the RPC exists. → Acceptable; removal can be added in a follow-up.
- **Single event per host is demo-only scope**: Backend allows multiple events per host. `ListEvents` returns all host events; the UI uses only the first for the demo. When multi-event support is built, replace with an event list and selector.

## Open Questions

- Should the Header nav item be visible only when authenticated, or always visible (redirecting to sign-in)?
