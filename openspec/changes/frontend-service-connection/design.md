## Context

The Go service (`service/simple/simple.go`) runs a raw gRPC server on `:50051` implementing `HelloService.SayHello`. Browsers cannot speak native gRPC. The Vite dev server already proxies `/api` → `localhost:8080`, but nothing is listening on 8080 yet. The frontend has no API client code.

Connect is a modern protocol layer (from Buf) that makes a gRPC service natively speak gRPC-Web, allowing browsers to call it directly without a separate proxy or REST translation layer. It also drives TypeScript codegen from the proto, closing the type-safety gap.

## Goals / Non-Goals

**Goals:**
- Serve `HelloService.SayHello` over the Connect/gRPC-Web protocol on `:8080`
- Generate Go service interfaces and TypeScript client types from `hello.proto` via buf
- Integrate buf codegen into the Bazel build
- Add a typed frontend Connect client with proto-derived types
- Add a `useHello` React hook with loading/error/data state
- Demonstrate the full connection in the existing UI

**Non-Goals:**
- Authentication or authorization
- Production deployment configuration
- Exposing any endpoint other than `SayHello`
- Streaming RPCs

## Decisions

### 1. Connect over grpc-web

**Decision:** Use `connectrpc.com/connect` on the Go server and `@connectrpc/connect-web` on the frontend, rather than `improbable-eng/grpc-web` middleware + `@grpc/grpc-web`.

**Rationale:** `@grpc/grpc-web` uses the older `protoc-gen-js` codegen with callback-based APIs and bolted-on TypeScript support. Connect is purpose-built for browser clients: it produces modern Promise-based TypeScript clients from `buf generate`, supports gRPC, gRPC-Web, and the Connect protocol from a single handler, and requires no separate proxy process. `improbable-eng/grpc-web` wraps an existing gRPC server; Connect replaces the handler registration but keeps the service logic untouched.

**Alternative considered:** `improbable-eng/grpc-web` + `@grpc/grpc-web` — rejected due to dated TS codegen and callback-based API.

### 2. buf for codegen, replacing rules_proto_grpc_go

**Decision:** Use `buf generate` (via `rules_buf` in Bazel) to produce both Go Connect service interfaces and TypeScript protobuf types + Connect client from `hello.proto`. Remove `rules_proto_grpc_go`.

**Rationale:** `rules_proto_grpc_go` generates standard gRPC Go stubs which are no longer needed once Connect is the handler. buf is the modern standard for proto tooling: it handles dependencies, linting, breaking change detection, and codegen in one tool. The Connect plugins (`buf.build/connectrpc/go`, `buf.build/bufbuild/es`, `buf.build/connectrpc/es`) are first-class buf plugins with no protoc setup required.

**Alternative considered:** Keep `rules_proto_grpc_go` and add Connect on top — rejected because it would generate two sets of Go stubs for the same proto, and the grpc stubs would be unused.

### 3. Drop the standalone gRPC port (:50051)

**Decision:** Remove the gRPC-only server on `:50051`. The Connect handler on `:8080` speaks the gRPC protocol natively in addition to gRPC-Web and the Connect protocol — any gRPC client can still connect to `:8080`.

**Rationale:** Connect's HTTP handler serves all three protocols from a single port. Keeping `:50051` open adds operational complexity with no benefit for this codebase. There are no existing external gRPC clients targeting `:50051`.

**Alternative considered:** Keep both ports — rejected as unnecessary complexity.

### 4. h2c (HTTP/2 cleartext) for the HTTP server

**Decision:** Wrap the Connect HTTP mux with `golang.org/x/net/http2/h2c` so it can serve HTTP/2 without TLS in the dev environment.

**Rationale:** gRPC-Web works over HTTP/1.1, but full gRPC (which Connect also supports) requires HTTP/2. h2c enables HTTP/2 cleartext, which is standard for local dev and internal service-to-service calls. The Vite proxy forwards to `localhost:8080`; h2c is transparent to it.

### 5. Generated TypeScript types checked in to api/gen/ts/

**Decision:** Commit the buf-generated TypeScript files to `api/gen/ts/`. Go generated files go to `api/gen/go/`.

**Rationale:** Checked-in generated files make the frontend importable without running buf as a prerequisite. The Bazel `rules_buf` integration will keep them in sync during builds. This matches common practice for buf-managed repos.

### 6. Frontend: generated Connect client, no raw fetch

**Decision:** `frontend/src/api/hello.ts` creates a Connect transport pointed at `/api` and exports a typed `sayHello` function using the generated `HelloService` client. No `fetch` calls, no hand-written request/response types.

**Rationale:** The generated client handles serialization, error mapping, and type safety derived directly from the proto. This eliminates the class of bugs where hand-rolled JSON shapes drift from the proto definition.

## Risks / Trade-offs

- **buf tooling setup** → Adds `buf` CLI as a dev dependency. Mitigated by `rules_buf` in Bazel and documenting `buf generate` as the codegen step.
- **h2c and Vite proxy** → Vite's proxy (http-proxy) speaks HTTP/1.1 to the backend by default; gRPC-Web over HTTP/1.1 is sufficient for the browser use case. Full gRPC (HTTP/2) clients can connect directly to `:8080`.
- **Generated files in source control** → Generated files can get out of sync. Mitigated by Bazel `rules_buf` enforcing consistency in CI.
- **Removing :50051** → Any tooling using grpc reflection on `:50051` (e.g., grpcurl, Postman) will need to target `:8080` instead. Connect supports gRPC reflection on the same port.

## Open Questions

- Should generated files be committed (`api/gen/`) or only produced by Bazel at build time? (Preference: commit for frontend discoverability, gate on Bazel for correctness.)
- Which page should demonstrate the connection? Home (`/`) or a new section on `/samples`?
