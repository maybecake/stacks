## 1. Pagination Helper

- [x] 1.1 Create `lib/pagination/page.go` with constants (`DefaultPageSize = 50`, `MaxPageSize = 1000`) and helpers: `EffectivePageSize(requested int32) int`, `EncodeToken(afterID uuid.UUID) string`, `DecodeToken(token string) (uuid.UUID, error)`
- [x] 1.2 Token encode: `base64url(json({"after_id":"<uuid>"}))`. Token decode: reverse; return `INVALID_ARGUMENT` error on malformed input
- [x] 1.3 Write unit tests for encode/decode round-trip and malformed token error

## 2. Proto Changes

- [x] 2.1 Add `int32 page_size = 2` and `string page_token = 3` to `ListInviteesRequest` in `api/protos/invite/invite.proto`
- [x] 2.2 Add `string next_page_token = 2` to `ListInviteesResponse`
- [x] 2.3 Add `int32 page_size = 2` and `string page_token = 3` to `ListHouseholdsRequest`
- [x] 2.4 Add `string next_page_token = 2` to `ListHouseholdsResponse`
- [x] 2.5 Add `int32 page_size = 2` and `string page_token = 3` to `ListPersonsRequest`
- [x] 2.6 Add `string next_page_token = 2` to `ListPersonsResponse`
- [x] 2.7 Add `ListEventsRequest { int32 page_size = 1; string page_token = 2; }` and `ListEventsResponse { repeated Event events = 1; string next_page_token = 2; }` messages
- [x] 2.8 Add `rpc ListEvents(ListEventsRequest) returns (ListEventsResponse)` to `InviteService`

## 3. Regenerate Stubs

- [x] 3.1 Regenerate Go stubs: `buf generate` (or equivalent Bazel target) — verify `gen/go/invite/invite.pb.go` reflects all new fields and `ListEvents`
- [x] 3.2 Regenerate gRPC-Web stubs for frontend: verify `frontend/src/gen/invite/invite_pb.d.ts` includes new fields and `listEvents` method on `InviteService`

## 4. sqlc Query Updates

- [x] 4.1 Replace `ListInviteesWithStatus` query in `lib/adapters/postgres/queries/invite.sql` with a paginated variant: `WHERE ii.event_id = $event_id AND ii.id > $after_id ORDER BY ii.id ASC LIMIT $limit`; use `uuid_nil()` as the zero cursor
- [x] 4.2 Add `ListHouseholdGroups` paginated query: join `households → invite__rsvps → rsvp_attendees` scoped by `event_id`, keyset on `household_id`, `LIMIT $limit`
- [x] 4.3 Update person list queries (`ListPersonsForEvent`, `ListPersonsForHost`, `ListPersonsForOwner`) to accept `after_id UUID` and `limit INT` params
- [x] 4.4 Add `ListEventsForHost` query: `SELECT * FROM invite__events WHERE host_user_id = $host_user_id AND id > $after_id ORDER BY id ASC LIMIT $limit`
- [x] 4.5 Run `sqlc generate` to regenerate `lib/adapters/postgres/db/invite.sql.go`; remove old unbounded function signatures

## 5. Domain Layer

- [x] 5.1 Update `InviteStore` interface in `lib/domain/invite.go`: add `afterID uuid.UUID` and `limit int` params to `ListInvitees`, `ListHouseholds`, `ListPersons`; add `ListEvents(ctx, hostUserID string, afterID uuid.UUID, limit int) ([]*Event, error)`
- [x] 5.2 Update `PostgresInviteStore` adapter in `lib/adapters/postgres/invite_store.go` to call the new paginated sqlc functions

## 6. Handler Updates

- [x] 6.1 Update `ListInvitees` handler in `api/invite/invite.go`: call `pagination.EffectivePageSize`, `pagination.DecodeToken`, pass to store, encode `next_page_token` from last result ID if `len(results) == pageSize`
- [x] 6.2 Update `ListHouseholds` handler: same pattern
- [x] 6.3 Update `ListPersons` handler: same pattern
- [x] 6.4 Add `ListEvents` handler: extract `host_user_id` from Clerk JWT, call store, encode `next_page_token`, return `UNAUTHENTICATED` if no valid JWT

## 7. Verification

- [x] 7.1 Confirm `next_page_token` is empty when all results fit in one page
- [x] 7.2 Confirm fetching page 1 then page 2 with the returned token yields no gaps or duplicates
- [x] 7.3 Confirm a malformed token returns `INVALID_ARGUMENT`
- [x] 7.4 Confirm `ListEvents` returns `UNAUTHENTICATED` for requests without a valid JWT
- [x] 7.5 Update `invite-system-frontend` tasks 5.2 to call `InviteService.ListEvents` (now available) — this change unblocks that prerequisite
