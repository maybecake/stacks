## Why

The three greeting endpoints (`hello.ts`, `yo.go`, `sup.py`) mix transport concerns (Connect-RPC / HTTP handling) directly with business logic, making it impossible to test the logic in isolation or swap storage backends without touching the handler code. Adopting hexagonal architecture now — before wiring in Postgres from the `greeting-counter-db` change — creates the clean seams needed for both testability and the upcoming storage layer.

## What Changes

- Introduce a **domain layer** (`api/domain/`) with pure greeting logic and storage port interfaces, shared across all three endpoints
- Introduce an **adapters layer** (`api/adapters/`) with concrete implementations of storage ports: an in-memory mock (default) and a future Postgres adapter
- Refactor `hello.ts` so the Connect-RPC handler delegates to the domain layer via the storage port
- Refactor `yo.go` so the Connect-RPC handler delegates to the domain layer via the storage port interface
- Refactor `sup.py` so the HTTP handler delegates to the domain layer via the storage port interface
- No behaviour changes to existing endpoints — responses remain identical
- No database connections wired yet — the mock adapter is the active storage implementation

## Capabilities

### New Capabilities
- `greeting-domain`: Pure greeting business logic and storage port interface, independent of transport and persistence
- `greeting-storage-mock`: In-memory storage adapter implementing the storage port for use in development and tests

### Modified Capabilities

## Impact

- **New directories**: `api/domain/`, `api/adapters/mock/`
- **Modified files**: `api/hello.ts`, `api/yo.go`, `api/sup.py`
- **New files**: `api/domain/greeting.ts` (domain logic + port interface), `api/adapters/mock/greeting_store.ts` (TS mock), `api/domain/greeting.go` (Go port interface), `api/adapters/mock/greeting_store.go` (Go mock), `api/domain/greeting.py` (Python port interface), `api/adapters/mock/greeting_store.py` (Python mock)
- **No new dependencies** — mock adapters use only stdlib
- **No API or proto changes** — transport contracts are unchanged
