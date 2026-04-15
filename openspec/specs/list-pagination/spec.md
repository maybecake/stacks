### Requirement: All List RPCs accept page_size and page_token
Every List RPC in `InviteService` (`ListInvitees`, `ListHouseholds`, `ListPersons`, `ListEvents`) SHALL accept an optional `page_size` (int32) and an optional `page_token` (string) in its request message, following AIP-158.

#### Scenario: Client omits page_size
- **WHEN** a client calls a List RPC without setting `page_size` (or sets it to 0)
- **THEN** the server SHALL return at most 50 results (the default page size)

#### Scenario: Client requests a specific page size
- **WHEN** a client calls a List RPC with `page_size = N` where `0 < N <= 1000`
- **THEN** the server SHALL return at most N results

#### Scenario: Client requests page_size above the maximum
- **WHEN** a client calls a List RPC with `page_size > 1000`
- **THEN** the server SHALL silently clamp to 1000 and return at most 1000 results

#### Scenario: Client omits page_token
- **WHEN** a client calls a List RPC without `page_token`
- **THEN** the server SHALL return results from the beginning of the collection

### Requirement: All List responses include next_page_token
Every List RPC response SHALL include a `next_page_token` (string) field. When the field is non-empty, more results exist. When it is empty, the current page is the last.

#### Scenario: More results exist after the current page
- **WHEN** the total number of matching results exceeds the effective page size
- **THEN** the response `next_page_token` SHALL be a non-empty opaque string

#### Scenario: Current page is the last page
- **WHEN** the total number of matching results fits within the effective page size, or the cursor is at the end of the collection
- **THEN** the response `next_page_token` SHALL be an empty string

#### Scenario: Client uses next_page_token to fetch the next page
- **WHEN** a client sends a follow-up request with `page_token` set to the `next_page_token` from the previous response
- **THEN** the server SHALL return the next page of results immediately following the last result of the previous page, with no gaps or duplicates

### Requirement: Page tokens are opaque and stable under concurrent writes
The `page_token` value SHALL be treated as opaque by clients. Its internal format is base64url-encoded JSON containing the ID of the last record returned. Token-based navigation SHALL NOT skip or duplicate records that existed at the time the token was issued, regardless of concurrent inserts or deletes.

#### Scenario: Record inserted between pages
- **WHEN** a new record is inserted after page 1 is fetched and before page 2 is requested
- **THEN** the new record SHALL appear in the appropriate position when page 2 is fetched (i.e., it will appear on a subsequent page if its ID is after the cursor, or not at all if before)
- **THEN** records on page 1 SHALL NOT be duplicated on page 2

#### Scenario: Record deleted between pages
- **WHEN** a record from page 2 is deleted after page 1 is fetched
- **THEN** the deleted record SHALL NOT appear on page 2 (the cursor skips over its former position)
- **THEN** no other records are skipped or duplicated as a result

#### Scenario: Malformed page token
- **WHEN** a client sends a `page_token` that cannot be decoded or parsed
- **THEN** the server SHALL return an `INVALID_ARGUMENT` error

### Requirement: ListEvents RPC returns events owned by the authenticated caller
A new `ListEvents` RPC SHALL be added to `InviteService`. It SHALL return all events where `host_user_id` matches the authenticated caller's user ID (from the Clerk JWT). The RPC SHALL support pagination from the start.

#### Scenario: Authenticated host with one event
- **WHEN** an authenticated host calls `ListEvents` and has created one event
- **THEN** the response SHALL contain that event and `next_page_token` SHALL be empty

#### Scenario: Authenticated host with no events
- **WHEN** an authenticated host calls `ListEvents` and has created no events
- **THEN** the response `events` list SHALL be empty and `next_page_token` SHALL be empty

#### Scenario: Unauthenticated caller invokes ListEvents
- **WHEN** a request to `ListEvents` carries no valid Clerk JWT
- **THEN** the server SHALL return an `UNAUTHENTICATED` error

### Requirement: Server enforces page size cap regardless of client value
The server SHALL never return more than 1000 results from any single List RPC call, regardless of the `page_size` value supplied by the client.

#### Scenario: Server-side cap applied
- **WHEN** a client passes `page_size = 9999`
- **THEN** the server SHALL return at most 1000 results and set `next_page_token` if more remain
