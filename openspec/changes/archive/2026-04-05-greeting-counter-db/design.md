## Context

The project is a polyglot monorepo with three Connect-RPC serverless endpoints in different languages (TypeScript `hello.ts`, Go `yo.go`, Python `sup.py`) deployed on Vercel. The frontend is a Vite + React SPA.

The `hexagonal-api-refactor` change introduced a hexagonal architecture: each endpoint delegates to a domain layer (`api/domain/`) via a `GreetingStore` port interface, with mock adapters in `api/adapters/mock/` as the default implementation. Handlers serve as the composition root, constructing an adapter and injecting it into the domain call.

Neon Postgres has been provisioned via the Vercel Marketplace integration. `DATABASE_URL` is already set in all environments.

## Goals / Non-Goals

**Goals:**
- Add schema-managed Postgres persistence using Drizzle ORM
- Implement Postgres adapters in `api/adapters/postgres/` conforming to the existing `GreetingStore` port interface
- Extend the `GreetingStore` port to include read methods for stats queries
- Swap handlers from mock to Postgres adapter (one-line change per handler)
- Expose aggregated stats via a new TypeScript endpoint that reads through the port
- Display stats in a new React component on the greetings page
- Automate migrations as part of the deploy pipeline

**Non-Goals:**
- Authentication or per-user tracking
- Real-time updates (WebSocket / SSE) — polling on demand is sufficient
- Drizzle ORM in Go or Python — those use raw SQL only
- Pagination of the names list
- Changes to the domain layer's greeting logic or response format

## Decisions

### Decision: Postgres adapters implement the `GreetingStore` port interface

Each Postgres adapter (`api/adapters/postgres/greeting_store.{ts,go,py}`) implements the same `GreetingStore` interface that the mock adapters satisfy. The handler swap is a single constructor change — from `new MockGreetingStore()` to `new PostgresGreetingStore(db)`. No domain code or handler logic changes.

**Alternatives considered:**
- *Direct DB calls in handlers*: Faster to write but defeats the hexagonal architecture — handlers would re-absorb persistence concerns.
- *Separate persistence service*: Overengineered for a demo monorepo.

### Decision: Extend `GreetingStore` port with read methods

The existing port only has `recordGreeting`. The stats endpoint needs to query aggregated data. Rather than bypassing the port and querying the DB directly from `stats.ts`, the port is extended with `getStats()` and `getNameFrequencies()` methods. This keeps all storage access behind the port boundary.

The mock adapter implements these new methods returning empty results (zero counts, empty name list).

**Alternatives considered:**
- *Separate `StatsReader` port*: Cleaner separation but adds interface proliferation for two read methods.
- *Direct DB query in stats endpoint*: Simpler but breaks the hex-arch principle — the stats endpoint would depend on Drizzle directly rather than the port.

### Decision: Drizzle ORM for schema management, sqlc for Go, psycopg for Python

Drizzle defines the schema in `api/db/schema.ts` and generates migration SQL. The TypeScript Postgres adapter uses Drizzle's query builder.

For Go, sqlc is pointed at Drizzle's generated migration files to auto-generate type-safe Go structs and query functions. This eliminates manual schema drift — when the Drizzle schema changes and new migrations are generated, re-running `sqlc generate` produces updated Go types automatically. The sqlc config (`sqlc.yaml`) references the migration files in `drizzle/migrations/` and query SQL files in `api/adapters/postgres/queries/`.

For Python, psycopg (v3) is used directly with parameterised queries. psycopg is the modern successor to psycopg2 with native async support, pipeline mode, and better type handling.

**Alternatives considered:**
- *Raw SQL in Go (pgx only)*: Simpler setup but requires manually maintaining Go structs that mirror the DB schema — prone to drift when the Drizzle schema changes.
- *psycopg2-binary for Python*: Legacy adapter; psycopg v3 is the maintained successor with a cleaner API.
- *Shared migration tool (golang-migrate, Flyway)*: Language-agnostic but adds tooling overhead and a separate CLI dependency.
- *SQLAlchemy for Python*: Full ORM is overkill for two queries in an adapter.

### Decision: Schema and client live in `api/db/`

`api/db/schema.ts` and `api/db/client.ts` are placed inside the `api/` directory so they fall within `api/tsconfig.json`'s include scope and are importable by the TypeScript Postgres adapter and `stats.ts` without tsconfig changes.

`drizzle.config.ts` lives at the repo root (where `drizzle-kit` is invoked from) and points at `./api/db/schema.ts`.

### Decision: Postgres adapter receives DB client via constructor injection

Each Postgres adapter takes a database connection/client as a constructor argument rather than constructing its own connection. The handler (composition root) creates the DB client and passes it in. This keeps the adapter testable and the connection lifecycle explicit.

**Alternatives considered:**
- *Global DB singleton imported by adapter*: Simpler wiring but hides the dependency and makes testing harder.

### Decision: Migrations run at Vercel build time

`pnpm db:migrate` is prepended to `vercel.json`'s `buildCommand`. This ensures every deploy applies any pending migrations before the frontend is built and the new function code is served.

**Risk:** A bad migration that fails at build time will block the deployment entirely. This is acceptable — a broken deploy is preferable to deploying code against a wrong schema.

**Alternatives considered:**
- *Manual migration runs*: Simpler but error-prone; easy to forget before a deploy.
- *Separate migration deployment step*: More robust for large teams but overkill here.

### Decision: DB failures are silenced in the Postgres adapter's `recordGreeting`

The Postgres adapter catches database errors in `recordGreeting` and swallows them (logging a warning). The domain layer already expects that store errors don't propagate — this was established in the hexagonal spec. The adapter honours that contract.

**Rationale:** A database hiccup should not break the primary demo. Stats accuracy is best-effort.

### Decision: `/api/stats` is a plain JSON REST endpoint, not Connect-RPC

The stats data is read-only, consumed only by the frontend StatsCard, and does not share a proto contract with other services. A simple `export default async function handler` returning `Response.json(...)` is the lightest approach. It constructs a `PostgresGreetingStore` and calls the port's read methods.

### Decision: Names are aggregated globally, not per greeting type

The spec requires unique names with total frequency across all greeting types. This keeps the query simple (`GROUP BY name` on `greeting_log`) and the UI uncluttered.

## Risks / Trade-offs

- **Schema drift in Go** → Eliminated by sqlc: Go structs are auto-generated from Drizzle's migration SQL. A schema change requires re-running `sqlc generate` but not manual struct editing. Query SQL files (`api/adapters/postgres/queries/*.sql`) must still be updated manually if column names change.
- **Schema drift in Python** → Python uses raw parameterised SQL with psycopg, so column references must be kept in sync with `api/db/schema.ts` manually. Mitigation: the migration SQL is committed and visible in PRs.
- **Cold-start latency** → Each serverless function opens a new Postgres connection on cold start. Neon's serverless driver uses HTTP transport which avoids connection pool exhaustion but adds per-request overhead. Mitigation: acceptable at this scale.
- **Migration at build time blocks deploy on failure** → See Decision above. Acceptable trade-off.
- **Port interface expansion** → Adding read methods to `GreetingStore` means the mock adapter must also be updated. This is a small change but creates a cross-change dependency — the mock was introduced by `hexagonal-api-refactor` and must be modified here.

## Migration Plan

1. Extend `GreetingStore` port interface in all three languages with `getStats()` and `getNameFrequencies()` read methods
2. Update mock adapters to implement the new read methods (return empty results)
3. `pnpm db:generate` — generate migration SQL from `api/db/schema.ts`
4. `pnpm db:migrate` — apply migration to the Neon database (run once locally before first deploy)
5. Seed `greeting_stats` with rows for 'hello', 'yo', 'sup' (one-time, via migration or script)
6. Implement Postgres adapters in `api/adapters/postgres/` for all three languages
7. Swap each handler's adapter from mock to Postgres (one-line change per handler)
8. Add stats endpoint and StatsCard component
9. Deploy — subsequent deploys will run `pnpm db:migrate` automatically; a no-op if schema is current

**Rollback:** Drop `greeting_log` and `greeting_stats` tables via Neon Console. Revert handler adapter wiring back to mock. Revert `vercel.json` buildCommand. Remove Postgres adapter files and `api/db/` directory.

## Open Questions

- Should the seed data (initial greeting_stats rows) be part of the migration SQL or a separate seed script? Currently planned as a seed step after migration.
- Should the `GreetingStore` read methods be in the same interface or split into a separate `StatsReader` interface? Current plan: same interface for simplicity.
