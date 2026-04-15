## Context

`InviteService` has four List RPCs — `ListInvitees`, `ListHouseholds`, `ListPersons`, and the forthcoming `ListEvents` — that all return unbounded `repeated` fields. A party with 60 invited children, each with a household and multiple persons, could already produce payloads in the hundreds of rows. The frontend change (`invite-system-frontend`) is the first consumer of these APIs; adding pagination now avoids a breaking change later.

The backend stack is: protobuf / Connect-RPC, Go handlers in `api/invite/invite.go`, domain layer in `lib/domain/invite_service.go`, postgres adapter in `lib/adapters/postgres/invite_store.go`, and sqlc-generated queries in `lib/adapters/postgres/db/`.

## Goals / Non-Goals

**Goals:**
- AIP-158 compliant pagination on `ListInvitees`, `ListHouseholds`, `ListPersons`, and `ListEvents`
- Opaque, stable page tokens that survive concurrent writes
- Server-enforced page size cap (max 1000)
- Reasonable default page size (50) when client omits `page_size`
- `ListEvents` RPC added with pagination from the start

**Non-Goals:**
- Total result count in responses (AIP-158 does not require it; expensive on large tables)
- Filtering or sorting beyond the existing event/host scoping
- Bi-directional cursors (prev-page token)
- Changing the Connect-RPC transport or auth scheme

## Decisions

### 1. Keyset (cursor) pagination, not offset

Each page token encodes the ID of the last record returned: `base64url({"after_id":"<uuid>"})`. The query becomes `WHERE id > $after_id ORDER BY id LIMIT $page_size`. This is stable under concurrent inserts and deletes and O(1) regardless of page depth.

*Alternative:* Offset (`LIMIT n OFFSET n*page`). Simpler to implement but produces skipped/duplicated rows when rows are inserted or deleted between pages. Rejected.

### 2. Token encoding: base64url(JSON)

Simple JSON payload, base64url-encoded, making the token opaque to clients. The JSON key `after_id` is intentionally generic — the structure can be extended (e.g. add `after_created_at` for composite cursors) without breaking existing tokens.

Example: `{"after_id":"01940a3b-..."}` → `eyJhZnRlcl9pZCI6IjAxOTQwYTNiLSJ9`

### 3. Ordering by primary key (UUID v4 ascending)

All list queries use `ORDER BY id ASC`. UUIDs are not time-ordered but they are stable and unique — sufficient for keyset correctness. The domain does not require time-ordered results for any list.

*Alternative:* Order by `created_at`. Requires a composite cursor (`after_created_at` + `after_id`) to handle ties. Deferred until there's a user-visible need for time-ordered results.

### 4. Default page size 50, max 1000

- Server uses 50 when `page_size` is 0 or omitted (AIP-158: server picks a reasonable default).
- Server caps any requested `page_size` at 1000 and silently clamps (AIP-158: server may return fewer than requested, never more).
- These constants live in a shared `pagination` helper package to stay DRY across handlers.

### 5. Proto field numbers appended, not changed

Existing field numbers in request/response messages are never reused. New `page_size`, `page_token`, and `next_page_token` fields use the next available field numbers in each message. This keeps the change wire-compatible with any existing clients that omit the new fields (they get page 1 with default size).

### 6. ListEvents added with host-scoped auth

`ListEventsRequest` carries no filter fields — the host identity comes from the Clerk JWT, validated server-side. Response is `ListEventsResponse { repeated Event events; string next_page_token; }`. The handler queries `WHERE host_user_id = $caller_user_id ORDER BY id ASC LIMIT $page_size`.

### 7. sqlc queries: new paginated variants, old queries removed

Each existing list query (`ListInviteesWithStatus`, `ListPersonsForEvent`, etc.) is replaced with a paginated variant accepting `after_id UUID` and `limit INT` params. The old unbounded queries are removed to prevent accidental use.

## Risks / Trade-offs

- **UUID v4 ordering is not time-sequential**: Clients cannot infer creation order from page order. Acceptable for the current use cases (host sees all invitees; order within a page is not meaningful to the UI).
- **Token decode errors**: A malformed or tampered token will fail to decode. Handler should return `INVALID_ARGUMENT` with a clear message rather than a 500.
- **ListEvents is a new RPC**: Frontend is blocked until both this change and the proto regen are shipped. The `invite-system-frontend` tasks already flag this as a prerequisite.
- **Breaking change on existing List RPCs**: Wire-compatible (new fields are optional) but Go call sites that pass `ListInviteesWithStatus` directly must be updated to the new paginated query signature.
