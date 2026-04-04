## Context

The project has three Connect-RPC/HTTP greeting endpoints in different languages (TypeScript `hello.ts`, Go `yo.go`, Python `sup.py`) deployed as Vercel serverless functions. Each handler currently handles both transport and domain concerns inline. The upcoming `greeting-counter-db` change needs to write greeting events to Postgres — without hexagonal architecture this would require tangling DB calls directly into handler code, making the logic untestable and the storage backend non-swappable.

Each language is a separate runtime; there is no shared code between them. The "ports and adapters" pattern must be applied independently per language, but with a consistent conceptual structure.

## Goals / Non-Goals

**Goals:**
- Define a `GreetingStore` port interface in each language that all storage adapters must satisfy
- Implement an in-memory mock adapter per language (no-op writes, no-op reads) as the default
- Refactor each handler to depend on the port interface rather than concrete storage
- Keep file layout consistent across languages so the Postgres adapter (from `greeting-counter-db`) slots in by replacing the mock

**Non-Goals:**
- Dependency injection frameworks — constructor injection is sufficient
- Shared proto-generated types between languages for the domain layer — each language uses its own idiomatic types
- Any real persistence — the mock adapter is the only implementation in this change
- Changing handler behaviour, response format, or proto contracts

## Decisions

### Decision: Port interface per language, not a shared contract

Each language defines its own `GreetingStore` interface in its domain package. There is no cross-language contract because there is no cross-language runtime; Go interfaces, TypeScript interfaces, and Python abstract base classes each serve the same role idiomatically.

**Alternatives considered:**
- *Proto-defined storage interface*: Overengineered — storage is internal to each service, not a network boundary.

### Decision: Directory layout mirrors the hexagonal layers

```
api/
  domain/
    greeting.ts          # TS domain logic + GreetingStore interface
    greeting.go          # Go domain logic + GreetingStore interface
    greeting.py          # Python domain logic + GreetingStore interface
  adapters/
    mock/
      greeting_store.ts  # TS in-memory mock
      greeting_store.go  # Go in-memory mock
      greeting_store.py  # Python in-memory mock
    postgres/            # (empty placeholder — filled by greeting-counter-db)
  hello.ts               # wires TS domain + mock adapter
  yo.go                  # wires Go domain + mock adapter
  sup.py                 # wires Python domain + mock adapter
```

The `domain/` package contains pure logic and port definitions. The `adapters/` subtree contains all concrete implementations. Handlers in `api/` are the composition root — they instantiate the adapter and inject it into the domain.

**Alternatives considered:**
- *`api/ports/` and `api/adapters/` as siblings*: Cleaner naming in some hex-arch literature, but `domain/` is more self-documenting for this codebase where "ports" could be confused with network ports.
- *Inline mock in handler file*: Simpler short-term but defeats the purpose — swapping to Postgres would still require editing the handler.

### Decision: Mock adapter is a stateless no-op, not an in-memory store

The mock `GreetingStore` records nothing and returns zero counts. Its purpose is structural (satisfying the interface) not behavioural (simulating persistence). Real in-memory state would give false confidence in tests that expect persistence across calls.

**Alternatives considered:**
- *Stateful in-memory map*: More useful for integration tests but not needed at this stage; the `greeting-counter-db` change will add a real adapter immediately after.

### Decision: Handlers are the composition root

Each handler file (`hello.ts`, `yo.go`, `sup.py`) is responsible for constructing the concrete adapter and passing it to the domain function. No global registry or DI container is used.

This keeps the wiring explicit, readable, and easy to change when the Postgres adapter is introduced — the only edit needed is swapping the adapter constructor call in the handler.

### Decision: TypeScript `api/tsconfig.json` scope covers `domain/` and `adapters/`

Both new subdirectories live under `api/`, so they are already within the existing `api/tsconfig.json` include scope. No tsconfig changes are needed. This was a motivating constraint noted in the `greeting-counter-db` design doc.

## Risks / Trade-offs

- **Go package naming** → `api/domain/` and `api/adapters/mock/` need `package` declarations compatible with how Vercel/Go resolves handler packages. `yo.go` uses `package handler`; the new packages will use `package domain` and `package mock` respectively. Go module path is `github.com/maybecake/stacks`; imports will be `github.com/maybecake/stacks/api/domain` etc. Verify Vercel Go runtime handles multi-package `api/` trees correctly — each handler file remains `package handler` in `api/`.
- **Python import path fragility** → `sup.py` already patches `sys.path` for proto stubs. The new `api/domain/greeting.py` and `api/adapters/mock/greeting_store.py` must be importable without additional path manipulation; placing them under `api/` sub-packages (with `__init__.py`) should suffice.
- **Stateless mock hides persistence bugs** → Until the Postgres adapter is wired, greeting counts will always return zero. The UI stats card (from `greeting-counter-db`) will show empty data in dev until the real adapter is active.

## Migration Plan

1. Create `api/domain/` and `api/adapters/mock/` with all interface and mock files
2. Refactor `hello.ts` — import domain + mock, delegate handler logic
3. Refactor `yo.go` — import domain + mock, delegate handler logic
4. Refactor `sup.py` — import domain + mock, delegate handler logic
5. Verify locally that all three endpoints still return correct greeting responses
6. `greeting-counter-db` change then adds `api/adapters/postgres/` and swaps the adapter in each handler

**Rollback:** Revert the three handler files to their pre-refactor state; delete `api/domain/` and `api/adapters/`.

## Open Questions

- Does the Vercel Go runtime support importing sibling packages under `api/` (e.g. `api/domain`)? Needs a quick deploy test or review of Vercel Go runtime docs.
- Should `api/adapters/postgres/` placeholder directories be created (empty, with a README) as part of this change to signal intent, or left entirely to `greeting-counter-db`?
