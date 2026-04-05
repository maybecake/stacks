## ADDED Requirements

### Requirement: ListGreetingTypeStats RPC method defined in hello.proto
`hello.proto` SHALL define a `ListGreetingTypeStats` RPC on `HelloService` with an AIP-132-compliant request/response message pair.

#### Scenario: Proto compiles with new method
- **WHEN** `bazel build //api/protos:hello_go_proto` is run after adding the method
- **THEN** the build exits with code 0

#### Scenario: Request message includes page_size and page_token
- **WHEN** `ListGreetingTypeStatsRequest` is inspected
- **THEN** it SHALL contain `int32 page_size` and `string page_token` fields

#### Scenario: Response message includes results and next_page_token
- **WHEN** `ListGreetingTypeStatsResponse` is inspected
- **THEN** it SHALL contain a repeated `GreetingTypeStat` field and a `string next_page_token` field

### Requirement: ListGreetedNames RPC method defined in hello.proto
`hello.proto` SHALL define a `ListGreetedNames` RPC on `HelloService` with an AIP-132-compliant request/response message pair.

#### Scenario: Proto compiles with new method
- **WHEN** `bazel build //api/protos:hello_go_proto` is run after adding the method
- **THEN** the build exits with code 0

#### Scenario: Request message includes page_size and page_token
- **WHEN** `ListGreetedNamesRequest` is inspected
- **THEN** it SHALL contain `int32 page_size` and `string page_token` fields

#### Scenario: Response message includes results and next_page_token
- **WHEN** `ListGreetedNamesResponse` is inspected
- **THEN** it SHALL contain a repeated `NameFrequency` field and a `string next_page_token` field

### Requirement: Go server implements both list RPC methods
The Go `HelloService` implementation SHALL implement `ListGreetingTypeStats` and `ListGreetedNames`, delegating to the `GreetingStore` interface and applying cursor-based pagination.

#### Scenario: Returns empty list when store has no data
- **WHEN** `ListGreetingTypeStats` or `ListGreetedNames` is called against a mock store
- **THEN** the response SHALL contain an empty list and an empty `next_page_token`

#### Scenario: page_size is clamped to maximum of 100
- **WHEN** a request arrives with `page_size` greater than 100
- **THEN** the server SHALL return at most 100 items and SHALL NOT return an error

#### Scenario: Missing page_size uses default of 20
- **WHEN** `page_size` is 0 or not set in the request
- **THEN** the server SHALL return at most 20 items

#### Scenario: next_page_token is non-empty when more results exist
- **WHEN** the result set has more items than page_size
- **THEN** `next_page_token` SHALL be a non-empty opaque string

#### Scenario: next_page_token is empty on last page
- **WHEN** the response contains the final page of results
- **THEN** `next_page_token` SHALL be an empty string

#### Scenario: Valid page_token navigates to next page
- **WHEN** a request includes a valid `page_token` from a prior response
- **THEN** the server SHALL return the next set of items starting after the prior page

#### Scenario: Invalid page_token returns gRPC InvalidArgument
- **WHEN** a request includes a malformed or unrecognizable `page_token`
- **THEN** the server SHALL return a gRPC `INVALID_ARGUMENT` status error

### Requirement: Names list is ordered by count descending
`ListGreetedNames` SHALL return names ordered by frequency count, highest first.

#### Scenario: Higher count appears first
- **WHEN** multiple names have been greeted different numbers of times
- **THEN** names with higher counts SHALL appear before names with lower counts

### Requirement: grpc-gateway exposes list methods over HTTP/JSON
grpc-gateway annotations SHALL be added to both list RPC methods so they are accessible as JSON/HTTP endpoints for the React frontend.

#### Scenario: GET /api/stats/greeting-types returns JSON
- **WHEN** `GET /api/stats/greeting-types` is sent to the gateway port
- **THEN** the response SHALL be 200 with `Content-Type: application/json` and the gateway-transcoded response body

#### Scenario: GET /api/stats/names returns JSON
- **WHEN** `GET /api/stats/names` is sent to the gateway port
- **THEN** the response SHALL be 200 with `Content-Type: application/json` and the gateway-transcoded response body

#### Scenario: page_size and page_token passed as query parameters
- **WHEN** `GET /api/stats/names?page_size=5&page_token=<token>` is sent
- **THEN** the gateway SHALL forward `page_size` and `page_token` to the gRPC method
