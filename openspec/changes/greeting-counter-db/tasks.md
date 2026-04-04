## 1. Dependencies & Config

- [ ] 1.1 Add `drizzle-orm` and `@neondatabase/serverless` to root `package.json` dependencies
- [ ] 1.2 Add `drizzle-kit` to root `package.json` devDependencies
- [ ] 1.3 Add `db:generate` and `db:migrate` scripts to root `package.json`
- [ ] 1.4 Create `drizzle.config.ts` at repo root pointing at `./api/db/schema.ts` with output `./drizzle/migrations`
- [ ] 1.5 Add `github.com/jackc/pgx/v5` to `go.mod` and run `go mod tidy`
- [ ] 1.6 Add `psycopg2-binary>=2.9.0` to `api/requirements.txt`

## 2. Drizzle Schema & Client

- [ ] 2.1 Create `api/db/schema.ts` with `greeting_stats` table (`greeting_type` PK, `count` integer default 0)
- [ ] 2.2 Add `greeting_log` table to `api/db/schema.ts` (`id` serial PK, `greeting_type`, `name`, `greeted_at` timestamptz default now)
- [ ] 2.3 Create `api/db/client.ts` exporting a `getDb()` factory using `neon` + `drizzle` from `drizzle-orm/neon-http`

## 3. Migration

- [ ] 3.1 Run `pnpm db:generate` to generate migration SQL in `drizzle/migrations/`
- [ ] 3.2 Run `pnpm db:migrate` to apply the migration to the Neon database
- [ ] 3.3 Seed `greeting_stats` with rows for 'hello', 'yo', 'sup' (count 0) using `ON CONFLICT DO NOTHING`
- [ ] 3.4 Update `vercel.json` buildCommand to `pnpm db:migrate && cd frontend && pnpm build`

## 4. Wire Greeting Endpoints

- [ ] 4.1 Update `api/hello.ts` to insert into `greeting_log` and upsert `greeting_stats` using drizzle-orm after each greeting
- [ ] 4.2 Update `api/yo.go` to insert into `greeting_log` and upsert `greeting_stats` using pgx after each greeting (DB errors silenced)
- [ ] 4.3 Update `api/sup.py` to insert into `greeting_log` and upsert `greeting_stats` using psycopg2 after each greeting (DB errors silenced)
- [ ] 4.4 Verify `npx tsc -p api/tsconfig.json --noEmit` passes after hello.ts changes
- [ ] 4.5 Verify `go build ./api/...` passes after yo.go changes

## 5. Stats Endpoint

- [ ] 5.1 Create `api/stats.ts` that GETs aggregated stats: `greeting_stats` rows ordered by type + `greeting_log` grouped by name, sorted by count desc
- [ ] 5.2 Verify `npx tsc -p api/tsconfig.json --noEmit` passes

## 6. StatsCard Component

- [ ] 6.1 Create `frontend/src/features/greetings/StatsCard.tsx` that fetches `/api/stats` on mount and displays per-type counts and names list
- [ ] 6.2 Add a Refresh button to StatsCard that re-fetches `/api/stats`
- [ ] 6.3 Append stats-card CSS classes to `frontend/src/features/greetings/greetings.css`
- [ ] 6.4 Import and render `<StatsCard />` in `frontend/src/features/greetings/Greetings.tsx`
- [ ] 6.5 Verify `cd frontend && pnpm build` passes without TypeScript or lint errors
