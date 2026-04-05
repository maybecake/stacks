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

### 3. Connect RPC as browser bridge

**Decision:** Use [Connect RPC](https://connectrpc.com) — already the project's RPC framework — to expose the new methods over HTTP/JSON. No gateway annotations needed; Connect handlers natively serve both the Connect protocol (JSON over HTTP/1.1) and gRPC from the same handler registration.

**Why:** The project already uses `connectrpc.com/connect` (Go), `@connectrpc/connect` (TypeScript), and `buf generate` for stub generation. Adding grpc-gateway would introduce a separate dependency, proto annotations, generated gateway shim code, and a second HTTP mux — none of which are needed when Connect already does the same thing. The frontend calls the methods using plain `fetch` with the Connect JSON protocol (POST with `Content-Type: application/json`).

**Alternative considered and rejected:** grpc-gateway — originally specified in this design, but superseded once the existing Connect RPC setup was identified. Would have required `google/api/annotations.proto` imports, a googleapis Bazel dependency, and a second HTTP listener alongside gRPC.

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
