## Why

The greeting endpoints (hello, yo, sup) currently have no persistence — every call is stateless and nothing is recorded. Adding a database layer lets us track how many times each greeting type has been used and which names have been greeted, turning the demo into something that accumulates state over time.

The hexagonal architecture refactor (`hexagonal-api-refactor`) introduced a `GreetingStore` port interface and mock adapters in each language. This change implements real Postgres adapters that slot into those ports, replacing the mock no-ops with actual persistence — without modifying handler or domain code.

## What Changes

- Add Drizzle ORM + Neon Postgres to the project for schema management and TypeScript queries
- Extend the `GreetingStore` port interface in each language to include read methods (`getStats`, `getNameFrequencies`) needed by the stats endpoint
- Implement Postgres storage adapters in `api/adapters/postgres/` for all three languages, conforming to the `GreetingStore` port interface
- Record every greeting event (type + name) to a `greeting_log` table via the Postgres adapter
- Maintain a running count per greeting type in a `greeting_stats` table via the Postgres adapter
- Swap each handler's composition root from the mock adapter to the Postgres adapter
- Add a `/api/stats` JSON endpoint that reads stats through the `GreetingStore` port
- Add a `StatsCard` component to the greetings page that fetches and displays the stats
- Run Drizzle migrations automatically on every Vercel deploy

## Capabilities

### New Capabilities
- `greeting-storage-postgres`: Postgres storage adapter implementing the `GreetingStore` port for all three languages, providing real persistence for greeting events and stats
- `greeting-stats-api`: REST endpoint exposing aggregated greeting stats (per-type counts, unique names + frequencies) via the `GreetingStore` port

### Modified Capabilities
- `greeting-domain`: Port interface extended with read methods (`getStats`, `getNameFrequencies`) to support stats queries
- `greeting-storage-mock`: Mock adapter updated to implement the new read methods (returns empty results)

## Impact

- **New dependencies (root)**: `drizzle-orm`, `@neondatabase/serverless` (runtime); `drizzle-kit` (dev)
- **New dependencies (Go)**: `github.com/jackc/pgx/v5`; `sqlc` (dev tool, generates type-safe Go code from Drizzle migration SQL)
- **New dependencies (Python)**: `psycopg[binary]>=3.1`
- **New files**: `api/db/schema.ts`, `api/db/client.ts`, `drizzle.config.ts`, `sqlc.yaml`, `api/adapters/postgres/queries/*.sql` (sqlc query definitions), `api/stats.ts`, `drizzle/migrations/`, `api/adapters/postgres/greeting_store.ts`, `api/adapters/postgres/greeting_store.go`, `api/adapters/postgres/db/` (sqlc-generated Go code), `api/adapters/postgres/greeting_store.py`, `frontend/src/features/greetings/StatsCard.tsx`
- **Modified files**: `api/domain/greeting.ts`, `api/domain/greeting.go`, `api/domain/greeting.py`, `api/adapters/mock/greeting_store.ts`, `api/adapters/mock/greeting_store.go`, `api/adapters/mock/greeting_store.py`, `api/hello.ts`, `api/yo.go`, `api/sup.py`, `api/requirements.txt`, `go.mod`, `vercel.json`, `frontend/src/features/greetings/Greetings.tsx`, `frontend/src/features/greetings/greetings.css`
- **Env vars**: `DATABASE_URL` (already provisioned via Neon Marketplace integration)
- **Build pipeline**: `vercel.json` buildCommand gains `pnpm db:migrate &&` prefix
