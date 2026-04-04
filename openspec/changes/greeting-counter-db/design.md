## Context

The project is a polyglot monorepo with three Connect-RPC serverless endpoints in different languages (TypeScript `hello.ts`, Go `yo.go`, Python `sup.py`) deployed on Vercel. The frontend is a Vite + React SPA. There is no existing database layer — all endpoints are stateless.

Neon Postgres has been provisioned via the Vercel Marketplace integration. `DATABASE_URL` is already set in all environments.

## Goals / Non-Goals

**Goals:**
- Add schema-managed Postgres persistence using Drizzle ORM
- Record greeting events from all three language endpoints
- Expose aggregated stats via a new TypeScript endpoint
- Display stats in a new React component on the greetings page
- Automate migrations as part of the deploy pipeline

**Non-Goals:**
- Authentication or per-user tracking
- Real-time updates (WebSocket / SSE) — polling on demand is sufficient
- Drizzle ORM in Go or Python — those use raw SQL only
- Pagination of the names list

## Decisions

### Decision: Drizzle ORM for schema management, raw SQL in Go and Python

Drizzle defines the schema in `api/db/schema.ts` and generates migration SQL. TypeScript endpoints use Drizzle's query builder. Go and Python endpoints write raw SQL that mirrors the schema — there is no shared ORM across languages.

**Alternatives considered:**
- *Shared migration tool (golang-migrate, Flyway)*: Language-agnostic but adds tooling overhead and a separate CLI dependency.
- *No ORM, raw SQL everywhere*: Simpler cross-language consistency but loses type safety and migration generation in TypeScript.

### Decision: Schema and client live in `api/db/`

`api/db/schema.ts` and `api/db/client.ts` are placed inside the `api/` directory so they fall within `api/tsconfig.json`'s include scope and are importable by `hello.ts` and `stats.ts` without tsconfig changes.

`drizzle.config.ts` lives at the repo root (where `drizzle-kit` is invoked from) and points at `./api/db/schema.ts`.

### Decision: Migrations run at Vercel build time

`pnpm db:migrate` is prepended to `vercel.json`'s `buildCommand`. This ensures every deploy applies any pending migrations before the frontend is built and the new function code is served.

**Risk:** A bad migration that fails at build time will block the deployment entirely. This is acceptable — a broken deploy is preferable to deploying code against a wrong schema.

**Alternatives considered:**
- *Manual migration runs*: Simpler but error-prone; easy to forget before a deploy.
- *Separate migration deployment step*: More robust for large teams but overkill here.

### Decision: DB failures are silenced in greeting endpoints

All three greeting endpoints catch database errors and still return the greeting response. The DB write is a side effect, not part of the greeting contract.

**Rationale:** A database hiccup should not break the primary demo. Stats accuracy is best-effort.

### Decision: `/api/stats` is a plain JSON REST endpoint, not Connect-RPC

The stats data is read-only, consumed only by the frontend StatsCard, and does not share a proto contract with other services. A simple `export default async function handler` returning `Response.json(...)` is the lightest approach.

### Decision: Names are aggregated globally, not per greeting type

The spec requires unique names with total frequency across all greeting types. This keeps the query simple (`GROUP BY name` on `greeting_log`) and the UI uncluttered.

## Risks / Trade-offs

- **Schema drift in Go/Python** → Raw SQL in `yo.go` and `sup.py` must be kept in sync with `api/db/schema.ts` manually. A column rename in the Drizzle schema will not automatically update the Go or Python queries. Mitigation: the migration SQL is committed and visible in PRs.
- **Cold-start latency** → Each serverless function opens a new Postgres connection on cold start. Neon's serverless driver uses HTTP transport which avoids connection pool exhaustion but adds per-request overhead. Mitigation: acceptable at this scale.
- **Migration at build time blocks deploy on failure** → See Decision above. Acceptable trade-off.

## Migration Plan

1. `pnpm db:generate` — generate migration SQL from `api/db/schema.ts`
2. `pnpm db:migrate` — apply migration to the Neon database (run once locally before first deploy)
3. Seed `greeting_stats` with rows for 'hello', 'yo', 'sup' (one-time, via migration or script)
4. Deploy — subsequent deploys will run `pnpm db:migrate` automatically; a no-op if schema is current

**Rollback:** Drop `greeting_log` and `greeting_stats` tables via Neon Console. Revert `vercel.json` buildCommand and remove DB-related code from the three endpoints.

## Open Questions

- Should the seed data (initial greeting_stats rows) be part of the migration SQL or a separate seed script? Currently planned as a seed step after migration.
