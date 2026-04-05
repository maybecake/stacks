## 1. Dependencies & Config

- [x] 1.1 Add `drizzle-orm` and `@neondatabase/serverless` to root `package.json` dependencies
- [x] 1.2 Add `drizzle-kit` to root `package.json` devDependencies
- [x] 1.3 Add `db:generate` and `db:migrate` scripts to root `package.json`
- [x] 1.4 Create `drizzle.config.ts` at repo root pointing at `./lib/db/schema.ts` with output `./drizzle/migrations`
- [x] 1.5 Add `github.com/jackc/pgx/v5` to `go.mod` and run `go mod tidy`
- [x] 1.6 Install sqlc (`go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest` or add to dev tools)
- [x] 1.7 Add `psycopg[binary]>=3.1` to `api/requirements.txt`

## 2. Drizzle Schema & Client

- [x] 2.1 Create `lib/db/schema.ts` with `greeting_stats` table (`greeting_type` PK, `count` integer default 0)
- [x] 2.2 Add `greeting_log` table to `lib/db/schema.ts` (`id` serial PK, `greeting_type`, `name`, `greeted_at` timestamptz default now)
- [x] 2.3 Create `lib/db/client.ts` exporting a `getDb()` factory using `neon` + `drizzle` from `drizzle-orm/neon-http`

## 3. Migration

- [x] 3.1 Run `pnpm db:generate` to generate migration SQL in `drizzle/migrations/`
- [x] 3.2 Run `pnpm db:migrate` to apply the migration to the Neon database
- [x] 3.3 Seed `greeting_stats` with rows for 'hello', 'yo', 'sup' (count 0) using `ON CONFLICT DO NOTHING`
- [x] 3.4 Update `vercel.json` buildCommand to `pnpm db:migrate && cd frontend && pnpm build`

## 4. Extend GreetingStore Port Interface

- [x] 4.1 Add `getStats()` and `getNameFrequencies()` read methods plus `GreetingStats` and `NameFrequency` types to `lib/domain/greeting.ts`
- [x] 4.2 Add `GetStats()` and `GetNameFrequencies()` methods plus result structs to `lib/domain/greeting.go`
- [x] 4.3 Add `get_stats()` and `get_name_frequencies()` abstract methods plus dataclass types to `lib/domain/greeting.py`

## 5. Update Mock Adapters

- [x] 5.1 Update `lib/adapters/mock/greeting_store.ts` to implement `getStats()` → empty array and `getNameFrequencies()` → empty array
- [x] 5.2 Update `lib/adapters/mock/greeting_store.go` to implement `GetStats()` → empty slice and `GetNameFrequencies()` → empty slice
- [x] 5.3 Update `lib/adapters/mock/greeting_store.py` to implement `get_stats()` → empty list and `get_name_frequencies()` → empty list

## 6. sqlc Setup (Go)

- [x] 6.1 Create `sqlc.yaml` at repo root: point schema at `drizzle/migrations/` and queries at `lib/adapters/postgres/queries/`
- [x] 6.2 Create `lib/adapters/postgres/queries/greeting.sql` with sqlc-annotated queries: insert greeting log, upsert greeting stats, select all stats, select name frequencies grouped by name
- [x] 6.3 Run `sqlc generate` to produce type-safe Go code in `lib/adapters/postgres/db/`

## 7. Postgres Adapters

- [x] 7.1 Create `lib/adapters/postgres/greeting_store.ts` implementing `GreetingStore` using Drizzle ORM: `recordGreeting` inserts log + upserts stats (errors silenced), `getStats` queries `greeting_stats`, `getNameFrequencies` queries `greeting_log` grouped by name
- [x] 7.2 Create `lib/adapters/postgres/greeting_store.go` implementing `GreetingStore` using sqlc-generated query functions and pgx: `RecordGreeting` inserts log + upserts stats (errors silenced), `GetStats` and `GetNameFrequencies` use sqlc-generated type-safe queries
- [x] 7.3 Create `lib/adapters/postgres/greeting_store.py` implementing `GreetingStore` using psycopg (v3): `record_greeting` inserts log + upserts stats (errors silenced), `get_stats` queries `greeting_stats`, `get_name_frequencies` queries `greeting_log` grouped by name
- [x] 7.4 Verify `npx tsc -p api/tsconfig.json --noEmit` passes for TS adapter
- [x] 7.5 Verify `go build ./lib/...` passes for Go adapter

## 8. Swap Handler Adapters

- [x] 8.1 Update `api/hello.ts` to import and construct `PostgresGreetingStore` instead of `MockGreetingStore`
- [x] 8.2 Update `api/yo.go` to import and construct `PostgresGreetingStore` instead of `MockGreetingStore`
- [x] 8.3 Update `api/sup.py` to import and construct `PostgresGreetingStore` instead of `MockGreetingStore`

## 9. Stats Endpoint

- [x] 9.1 Create `api/stats.ts` that constructs a `PostgresGreetingStore` and calls `getStats()` + `getNameFrequencies()` to return JSON response
- [x] 9.2 Verify `npx tsc -p api/tsconfig.json --noEmit` passes

## 10. StatsCard Component

- [x] 10.1 Create `frontend/src/features/greetings/StatsCard.tsx` that fetches `/api/stats` on mount and displays per-type counts and names list
- [x] 10.2 Add a Refresh button to StatsCard that re-fetches `/api/stats`
- [x] 10.3 Append stats-card CSS classes to `frontend/src/features/greetings/greetings.css`
- [x] 10.4 Import and render `<StatsCard />` in `frontend/src/features/greetings/Greetings.tsx`
- [x] 10.5 Verify `cd frontend && pnpm build` passes without TypeScript or lint errors
