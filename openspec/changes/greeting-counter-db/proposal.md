## Why

The greeting endpoints (hello, yo, sup) currently have no persistence — every call is stateless and nothing is recorded. Adding a database layer lets us track how many times each greeting type has been used and which names have been greeted, turning the demo into something that accumulates state over time.

## What Changes

- Add Drizzle ORM + Neon Postgres to the project for schema management and TypeScript queries
- Record every greeting event (type + name) to a `greeting_log` table in all three endpoints (TypeScript, Go, Python)
- Maintain a running count per greeting type in a `greeting_stats` table
- Add a `/api/stats` JSON endpoint that returns per-type counts and unique name frequencies
- Add a `StatsCard` component to the greetings page that fetches and displays the stats
- Run Drizzle migrations automatically on every Vercel deploy

## Capabilities

### New Capabilities
- `greeting-persistence`: Records greeting events to Postgres and exposes aggregated stats (per-type counts, unique names + frequencies) via a REST endpoint

### Modified Capabilities

## Impact

- **New dependencies (root)**: `drizzle-orm`, `@neondatabase/serverless` (runtime); `drizzle-kit` (dev)
- **New dependencies (Go)**: `github.com/jackc/pgx/v5`
- **New dependencies (Python)**: `psycopg2-binary`
- **New files**: `api/db/schema.ts`, `api/db/client.ts`, `drizzle.config.ts`, `api/stats.ts`, `drizzle/migrations/`, `frontend/src/features/greetings/StatsCard.tsx`
- **Modified files**: `api/hello.ts`, `api/yo.go`, `api/sup.py`, `api/requirements.txt`, `go.mod`, `vercel.json`, `frontend/src/features/greetings/Greetings.tsx`, `frontend/src/features/greetings/greetings.css`
- **Env vars**: `DATABASE_URL` (already provisioned via Neon Marketplace integration)
- **Build pipeline**: `vercel.json` buildCommand gains `pnpm db:migrate &&` prefix
