## Why

The backend invitation system (gRPC service, DB migrations, serverless handlers) is fully implemented but has no frontend. Hosts have no UI to create events or manage their guest list, and there is no page where the invite features live.

## What Changes

- New `/invite` route added to the React app with a dedicated page for host-facing invite management
- New `InviteManager` feature component under `frontend/src/features/invite/`
- Event creation form: host can fill in event details (name, venue, datetime, capacity, rules)
- Guest list panel: host can view invited persons and add new invitees
- Frontend gRPC-Web client wiring to call the existing `InviteService` methods
- Navigation entry in the Header linking to the new route

## Capabilities

### New Capabilities

- `invite-management-page`: Host-facing page at `/invite` with an event creation form and a guest list management panel; wires to `InviteService` RPCs via the generated gRPC-Web client

### Modified Capabilities

- `greeting-auth-gate`: The invite route must also require authentication (same Clerk auth gate pattern already used for greetings)

## Impact

- New files under `frontend/src/features/invite/`
- New route in `frontend/src/App.tsx`
- New nav link in `frontend/src/components/Header.tsx`
- Depends on existing generated gRPC-Web stubs in `frontend/src/gen/`
- No backend changes — all service methods already exist
- No schema or proto changes
