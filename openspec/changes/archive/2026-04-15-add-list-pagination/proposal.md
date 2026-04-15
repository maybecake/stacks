## Why

All List RPCs in `InviteService` return unbounded result sets — no page size limit, no continuation token. Before the frontend consumes these APIs, pagination must be in place to prevent oversized payloads and to give the frontend a stable contract to build against.

## What Changes

- **BREAKING**: `ListInviteesRequest` gains `page_size` (int32) and `page_token` (string) fields; `ListInviteesResponse` gains `next_page_token` (string)
- **BREAKING**: `ListHouseholdsRequest` gains `page_size` and `page_token`; `ListHouseholdsResponse` gains `next_page_token`
- **BREAKING**: `ListPersonsRequest` gains `page_size` and `page_token`; `ListPersonsResponse` gains `next_page_token`
- New `ListEventsRequest` / `ListEventsResponse` messages added (required by `invite-system-frontend`), with `page_size` and `next_page_token` from the start
- New `rpc ListEvents(ListEventsRequest) returns (ListEventsResponse)` added to `InviteService`
- Go service handlers updated to honour `page_size` and decode/encode `page_token`
- sqlc queries updated with `LIMIT` / `OFFSET` (or keyset cursor) clauses
- Generated gRPC-Web stubs regenerated for the frontend

## Capabilities

### New Capabilities

- `list-pagination`: AIP-158 compliant page-token pagination on all `InviteService` List RPCs — `ListInvitees`, `ListHouseholds`, `ListPersons`, and the new `ListEvents`

### Modified Capabilities

## Impact

- `api/protos/invite/invite.proto` — request/response message changes for all List RPCs; new ListEvents messages and RPC
- `gen/go/invite/` — regenerated Go stubs
- `frontend/src/gen/invite/` — regenerated gRPC-Web stubs
- Go service implementation files for each List handler
- sqlc query files for each list query
- `invite-system-frontend` change specs — `ListInvitees` and `ListEvents` calls must now handle `next_page_token`
- Existing callers of List RPCs (currently none in production frontend) — breaking changes are safe to ship now before any frontend is built
