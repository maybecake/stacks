## Why

The `StatsCard` UI component exists and expects a stats endpoint, but the backend has no stats methods — the existing gRPC service only implements `SayHello`. This change adds `ListGreetingTypeStats` and `ListGreetedNames` gRPC methods to the `HelloService`, with a frontend gRPC-Web (or grpc-gateway) bridge so `StatsCard` can consume them.

## What Changes

- Add `ListGreetingTypeStats` and `ListGreetedNames` RPC methods to `hello.proto`
- Implement both methods in the Go gRPC server
- Expose paginated list responses following Google AIP standards (cursor-based pagination via `page_token` / `next_page_token`)
- Add a gRPC-Web or grpc-gateway translation layer so the React frontend can call the gRPC methods over HTTP/1.1
- Update `StatsCard` to call the new endpoints

## Capabilities

### New Capabilities
- `greeting-stats`: gRPC list methods returning greeting type counts and greeted name frequencies, with AIP-compliant cursor-based pagination

### Modified Capabilities
- `greeting-domain`: The `GreetingStore` interface gains `ListGreetingTypeStats` and `ListGreetedNames` query methods — a requirement change on the existing port interface

## Impact

- `api/protos/hello.proto` — new RPC methods and message types added
- `service/simple/` — Go implementation of the two new RPC methods
- `api/domain/` — `GreetingStore` interface extended with stats query methods
- `api/adapters/mock/` — mock adapter updated to satisfy expanded interface
- Frontend — `StatsCard` updated to call the new endpoints via the bridge layer
- New or updated Bazel targets for regenerated proto stubs
