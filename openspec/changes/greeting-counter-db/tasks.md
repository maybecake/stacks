## 1. Dependencies & Config

- [ ] 1.1 Add `drizzle-orm` and `@neondatabase/serverless` to root `package.json` dependencies
- [ ] 1.2 Add `drizzle-kit` to root `package.json` devDependencies
- [ ] 1.3 Add `db:generate` and `db:migrate` scripts to root `package.json`
- [ ] 1.4 Create `drizzle.config.ts` at repo root pointing at `./api/db/schema.ts` with output `./drizzle/migrations`
- [ ] 1.5 Add `github.com/jackc/pgx/v5` to `go.mod` and run `go mod tidy`
- [ ] 1.6 Install sqlc (`go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest` or add to dev tools)
- [ ] 1.7 Add `psycopg[binary]>=3.1` to `api/requirements.txt`

## 2. Drizzle Schema & Client

- [ ] 2.1 Create `api/db/schema.ts` with `greeting_stats` table (`greeting_type` PK, `count` integer default 0)
- [ ] 2.2 Add `greeting_log` table to `api/db/schema.ts` (`id` serial PK, `greeting_type`, `name`, `greeted_at` timestamptz default now)
- [ ] 2.3 Create `api/db/client.ts` exporting a `getDb()` factory using `neon` + `drizzle` from `drizzle-orm/neon-http`

## 3. Migration

- [ ] 3.1 Run `pnpm db:generate` to generate migration SQL in `drizzle/migrations/`
- [ ] 3.2 Run `pnpm db:migrate` to apply the migration to the Neon database
- [ ] 3.3 Seed `greeting_stats` with rows for 'hello', 'yo', 'sup' (count 0) using `ON CONFLICT DO NOTHING`
- [ ] 3.4 Update `vercel.json` buildCommand to `pnpm db:migrate && cd frontend && pnpm build`

## 4. Extend GreetingStore Port Interface

- [ ] 4.1 Add `getStats()` and `getNameFrequencies()` read methods plus `GreetingStats` and `NameFrequency` types to `api/domain/greeting.ts`
- [ ] 4.2 Add `GetStats()` and `GetNameFrequencies()` methods plus result structs to `api/domain/greeting.go`
- [ ] 4.3 Add `get_stats()` and `get_name_frequencies()` abstract methods plus dataclass types to `api/domain/greeting.py`

## 5. Update Mock Adapters

- [ ] 5.1 Update `api/adapters/mock/greeting_store.ts` to implement `getStats()` → empty array and `getNameFrequencies()` → empty array
- [ ] 5.2 Update `api/adapters/mock/greeting_store.go` to implement `GetStats()` → empty slice and `GetNameFrequencies()` → empty slice
- [ ] 5.3 Update `api/adapters/mock/greeting_store.py` to implement `get_stats()` → empty list and `get_name_frequencies()` → empty list

## 6. sqlc Setup (Go)

- [ ] 6.1 Create `sqlc.yaml` at repo root: point schema at `drizzle/migrations/` and queries at `api/adapters/postgres/queries/`
- [ ] 6.2 Create `api/adapters/postgres/queries/greeting.sql` with sqlc-annotated queries: insert greeting log, upsert greeting stats, select all stats, select name frequencies grouped by name
- [ ] 6.3 Run `sqlc generate` to produce type-safe Go code in `api/adapters/postgres/db/`

## 7. Postgres Adapters

- [ ] 7.1 Create `api/adapters/postgres/greeting_store.ts` implementing `GreetingStore` using Drizzle ORM: `recordGreeting` inserts log + upserts stats (errors silenced), `getStats` queries `greeting_stats`, `getNameFrequencies` queries `greeting_log` grouped by name
- [ ] 7.2 Create `api/adapters/postgres/greeting_store.go` implementing `GreetingStore` using sqlc-generated query functions and pgx: `RecordGreeting` inserts log + upserts stats (errors silenced), `GetStats` and `GetNameFrequencies` use sqlc-generated type-safe queries
- [ ] 7.3 Create `api/adapters/postgres/greeting_store.py` implementing `GreetingStore` using psycopg (v3): `record_greeting` inserts log + upserts stats (errors silenced), `get_stats` queries `greeting_stats`, `get_name_frequencies` queries `greeting_log` grouped by name
- [ ] 7.4 Verify `npx tsc -p api/tsconfig.json --noEmit` passes for TS adapter
- [ ] 7.5 Verify `go build ./api/...` passes for Go adapter

## 8. Swap Handler Adapters

- [ ] 8.1 Update `api/hello.ts` to import and construct `PostgresGreetingStore` instead of `MockGreetingStore`
- [ ] 8.2 Update `api/yo.go` to import and construct `PostgresGreetingStore` instead of `MockGreetingStore`
- [ ] 8.3 Update `api/sup.py` to import and construct `PostgresGreetingStore` instead of `MockGreetingStore`

## 9. Stats Endpoint

- [ ] 9.1 Create `api/stats.ts` that constructs a `PostgresGreetingStore` and calls `getStats()` + `getNameFrequencies()` to return JSON response
- [ ] 9.2 Verify `npx tsc -p api/tsconfig.json --noEmit` passes

## 10. StatsCard Component

- [ ] 10.1 Create `frontend/src/features/greetings/StatsCard.tsx` that fetches `/api/stats` on mount and displays per-type counts and names list
- [ ] 10.2 Add a Refresh button to StatsCard that re-fetches `/api/stats`
- [ ] 10.3 Append stats-card CSS classes to `frontend/src/features/greetings/greetings.css`
- [ ] 10.4 Import and render `<StatsCard />` in `frontend/src/features/greetings/Greetings.tsx`
- [ ] 10.5 Verify `cd frontend && pnpm build` passes without TypeScript or lint errors
