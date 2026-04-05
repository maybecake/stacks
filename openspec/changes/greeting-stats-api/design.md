## Context

The `StatsCard` React component needs stats data from the backend. All backend API endpoints in this project are gRPC — there is no plain HTTP REST layer. The existing `HelloService` in `hello.proto` only defines `SayHello`. The `GreetingStore` port interface records greetings but has no read/query methods. The frontend must reach gRPC via a browser-compatible bridge (gRPC-Web or grpc-gateway).

## Goals / Non-Goals

**Goals:**
- Add `ListGreetingTypeStats` and `ListGreetedNames` RPC methods to `HelloService` in `hello.proto`
- Implement both methods in Go with AIP-compliant cursor-based pagination
- Extend the `GreetingStore` domain interface with corresponding query methods
- Provide a browser-accessible bridge (grpc-gateway or Envoy/grpc-web) so `StatsCard` can call the methods

**Non-Goals:**
- Implementing a real persistence adapter (mock returns empty results; sufficient for wiring)
- Plain HTTP REST endpoints — all new backend API surface is gRPC
- Server-side caching or aggregation pipelines
- Authentication / authorization on the stats methods

## Decisions

### 1. Two separate RPC methods, not one aggregate

**Decision:** Define `ListGreetingTypeStats` and `ListGreetedNames` as independent RPC methods, each with their own request/response message pair.

**Why:** Each list is independently pageable. A single `GetStats` RPC that bundles both arrays makes pagination ambiguous — you can't independently advance the cursor for greeting types vs. names. Separate methods follow AIP-132 cleanly.

**Alternative considered:** Single `GetStats` RPC returning both arrays unpaginated. Rejected — names can grow unbounded; pagination is required from the start.

### 2. AIP-132 cursor-based pagination in proto messages

**Decision:** Request messages include `int32 page_size` and `string page_token`. Response messages include the result list and `string next_page_token`. Server encodes cursor as base64 of `{"offset":N}` — opaque to callers.

**Why:** Offset cursors are simple to implement against an in-memory mock, correct under append-only writes, and keep the option open to swap to keyset cursors when a real store is added. The opaque token format hides this detail from clients.

**Alternative considered:** `int32 page` (page number). Rejected — AIP explicitly discourages page numbers because they break under inserts.

### 3. grpc-gateway as browser bridge

**Decision:** Use [grpc-gateway](https://github.com/grpc-ecosystem/grpc-gateway) to expose the gRPC methods as JSON/HTTP endpoints that the frontend `fetch` calls can reach. Add gateway annotations to `hello.proto`.

**Why:** grpc-gateway is the lightest-weight option: it generates an HTTP/JSON reverse proxy from proto annotations with no separate proxy process. The frontend continues to use `fetch` (no gRPC-Web client library needed in React). The Vite proxy forwards `/api/*` to the gateway port.

**Alternative considered:** Envoy + grpc-web. Rejected for now — requires a separate process and more ops complexity than grpc-gateway for a dev-stage project.

### 4. `GreetingStore` interface extended, not split

**Decision:** Add `ListGreetingTypeStats` and `ListGreetedNames` directly to the existing `GreetingStore` interface.

**Why:** Stats queries are a natural read-side concern of the same store that records greetings. A separate `StatsStore` interface or CQRS split is premature at this scale.

## Risks / Trade-offs

- **Mock returns empty data** → Acceptable; wire the plumbing first, test with real data when a persistence adapter exists
- **grpc-gateway adds a build step** → Proto annotations and generated gateway code must be kept in sync with the `.proto` file; Bazel `gazelle` handles regeneration
- **Offset cursor breaks under deletes** → No delete operations on greetings; risk is negligible until a real store lands

## Open Questions

- Should the grpc-gateway run on port 8080 in the same binary as gRPC (port 50051), or as a separate process? (Recommendation: same binary, `http.ListenAndServe(":8080", gwMux)` in a goroutine)
- What `max_page_size` should the server enforce? (Recommendation: 100, default 20)
