# Project Context

## Purpose

A polyglot monorepo demonstrating a gRPC-first backend with a React frontend. The primary service is a greeting API (`HelloService`) that records greetings and exposes stats. The stack is intentionally polyglot — the same domain logic is implemented in Go, TypeScript, and Python — to exercise the hexagonal architecture pattern across runtimes.

## Tech Stack

### Frontend
- **React + TypeScript** — strict mode, function components only
- **React Router v5** — three routes: `/`, `/samples`, `/learner`
- **Vite** — dev server on `:5173`; proxies `/api/*` to `:8080` (grpc-gateway)
- **Radix UI** — primitive component library
- **Prettier** — 2-space indent, 100-char line width

### Backend
- **Go** — primary gRPC service (`service/simple/`); Bazel build
- **Python** — alternative gRPC service (`service/simple/server.py`)
- **Protobuf / gRPC** — all backend API surface defined in `api/protos/hello.proto`
- **grpc-gateway** — HTTP/JSON reverse proxy from proto annotations; runs on `:8080`

### Domain / Persistence
- **Hexagonal architecture** — `api/domain/` for logic + port interfaces; `api/adapters/` for concrete implementations
- **Drizzle ORM** (TypeScript) — schema management and migrations; schema in `api/db/schema.ts`
- **sqlc** (Go) — type-safe Go structs generated from Drizzle migration SQL
- **psycopg v3** (Python) — parameterised queries directly

### Build
- **Bazel** — builds Go service and proto stubs
- **pnpm** — frontend package manager

## Architecture Patterns

### Hexagonal Architecture (Ports and Adapters)
All persistence and external I/O is accessed through port interfaces defined in `api/domain/`. Each language defines its own idiomatic interface (`GreetingStore` in Go, TypeScript, and Python). Concrete adapters live in `api/adapters/` — currently `mock/` (no-op) and `postgres/`. Handlers (`api/hello.ts`, `service/simple/simple.go`, `service/simple/server.py`) are the composition root: they construct the adapter and inject it into the domain function.

```
api/
  domain/         # Pure logic + port interfaces (no transport, no persistence imports)
  adapters/
    mock/         # No-op implementations (default)
    postgres/     # Neon Postgres implementations (TypeScript: Drizzle, Go: sqlc, Python: psycopg)
  db/             # Drizzle schema + client (TypeScript only)
```

### gRPC-Only Backend API
All backend API endpoints are gRPC methods defined in `.proto` files. Plain HTTP handlers (`net/http`, `http.HandleFunc`, REST routes) are not used as the API transport. The Vite dev proxy and grpc-gateway are thin translation layers over gRPC, not standalone HTTP services.

## Architecture Decision Records

### ADR-001: Port interface per language, not a shared contract
**Status:** Accepted (hexagonal-api-refactor)

Each language defines its own `GreetingStore` interface in its domain package. There is no cross-language contract because there is no cross-language runtime.

**Rejected:** Proto-defined storage interface — overengineered; storage is internal to each service, not a network boundary.

---

### ADR-002: All new backend API endpoints are gRPC
**Status:** Accepted

New backend API surface is defined as gRPC RPC methods in `hello.proto` and implemented via generated stubs. The grpc-gateway translates these to HTTP/JSON for the frontend. No plain HTTP endpoints are added as API transport.

**Rejected:** Plain `net/http` handlers or REST routes — these bypass the proto contract and don't integrate with the service mesh.

---

### ADR-003: grpc-gateway as the frontend bridge
**Status:** Accepted (greeting-stats-api)

grpc-gateway generates an HTTP/JSON reverse proxy from proto annotations. It runs on port `:8080` in the same binary as the gRPC server (`:50051`) via `http.ListenAndServe` in a goroutine. The Vite dev proxy forwards `/api/*` to `:8080`.

**Rejected:** Envoy + grpc-web — requires a separate process and more ops complexity.
**Rejected:** gRPC-Web client in React — requires a client library and browser compatibility shim.

---

### ADR-004: Drizzle ORM (TS) + sqlc (Go) + psycopg (Python) for persistence
**Status:** Accepted (greeting-counter-db)

Drizzle defines the canonical schema in `api/db/schema.ts` and generates migration SQL. sqlc points at Drizzle's generated migrations to auto-generate type-safe Go structs, eliminating manual schema drift. Python uses psycopg v3 with parameterised queries.

Migrations run at Vercel build time (`pnpm db:migrate` prepended to `buildCommand`) — a failed migration blocks the deploy rather than deploying against a wrong schema.

**Rejected (Go):** Raw pgx — requires manually maintaining Go structs that mirror the DB schema.
**Rejected (Python):** psycopg2-binary — legacy adapter; psycopg v3 is the maintained successor.
**Rejected (Python):** SQLAlchemy — full ORM is overkill for two queries in an adapter.

---

### ADR-005: AIP-132 cursor-based pagination for list RPCs
**Status:** Accepted (greeting-stats-api)

List RPC request messages include `int32 page_size` and `string page_token`. Response messages include the result list and `string next_page_token`. The server encodes the cursor as base64 of `{"offset":N}` — opaque to callers. Default page size: 20. Maximum: 100 (clamped server-side).

**Rejected:** `int32 page` (page number) — AIP explicitly discourages page numbers because they break under inserts.
**Rejected:** Unpaginated `GetStats` bundling both lists — names can grow unbounded; pagination is required from the start.

---

### ADR-006: Two separate list RPCs, not one aggregate
**Status:** Accepted (greeting-stats-api)

`ListGreetingTypeStats` and `ListGreetedNames` are independent RPC methods with their own request/response message pairs. Each list is independently pageable.

**Rejected:** Single `GetStats` RPC returning both arrays — pagination becomes ambiguous when cursors for greeting types and names are independent.

---

### ADR-007: GreetingStore interface extended, not split
**Status:** Accepted (greeting-stats-api)

Stats query methods (`ListGreetingTypeStats`, `ListGreetedNames`) are added directly to the existing `GreetingStore` interface rather than introducing a separate `StatsReader` interface.

**Rejected:** Separate `StatsReader` port — premature CQRS split at this scale; adds interface proliferation for two read methods.

---

### ADR-008: Handlers are the composition root
**Status:** Accepted (hexagonal-api-refactor)

Each handler file constructs the concrete adapter and injects it into the domain function. No global registry or DI container is used. Swapping from mock to Postgres adapter is a single constructor change in the handler.

**Rejected:** Global DB singleton imported by adapter — hides the dependency and makes testing harder.
