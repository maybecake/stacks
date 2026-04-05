# Database Guide

This project uses [Neon](https://neon.tech) (serverless Postgres) with [Drizzle ORM](https://orm.drizzle.team) for schema management and migrations.

## Setup

### Environment variable

Everything requires `DATABASE_URL` (a Neon connection string). The recommended setup:

1. Add `DATABASE_URL` in your Vercel project → **Settings → Environment Variables** (Production, Preview, Development)
2. Pull it locally:
   ```bash
   vercel env pull .env.local
   ```

The Vercel + Neon marketplace integration can inject `DATABASE_URL` automatically — see [Neon branching](#neon-branching) below.

---

## Schema and migrations

Schema lives in **`lib/db/schema.ts`** using Drizzle's TypeScript schema API. Migrations are generated SQL files in **`drizzle/migrations/`** and are tracked automatically by Drizzle.

### Adding a new table or column

1. Edit `lib/db/schema.ts`
2. Generate the migration:
   ```bash
   pnpm db:generate
   ```
   This creates a new `.sql` file in `drizzle/migrations/`. Review it before committing.
3. Commit both the schema change and the generated migration file together
4. The migration runs automatically on the next Vercel deploy

### Applying migrations locally

```bash
pnpm db:migrate
```

Requires `DATABASE_URL` to be set (via `.env.local` or shell environment).

### Keeping all three language backends in sync

After a schema change, each language backend needs attention:

| Backend | What to update | How |
|---|---|---|
| TypeScript | Nothing — Drizzle queries use schema objects directly | Automatic |
| Python | Raw SQL strings in `lib/adapters/postgres/greeting_store.py` | Manual |
| Go | sqlc-generated code in `lib/adapters/postgres/db/` | Run `sqlc generate` |

**Full checklist for a schema change:**

```bash
# 1. Edit lib/db/schema.ts
# 2. Edit lib/adapters/postgres/queries/greeting.sql if queries change
pnpm db:generate          # generate migration SQL
sqlc generate             # regenerate Go query code
go build ./lib/...        # verify Go compiles
pnpm exec tsc -p api/tsconfig.json --noEmit  # verify TS compiles
# 3. Update lib/adapters/postgres/greeting_store.py if table/column names changed
# 4. Commit: schema.ts + migration file + queries.sql + generated Go files together
```

The sqlc-generated files (`lib/adapters/postgres/db/models.go`, `greeting.sql.go`, `db.go`) are committed to the repo. Forgetting `sqlc generate` means the Go adapter silently drifts from the actual schema.

### Gotchas

- **Never edit existing migration files** after they've been applied. Drizzle tracks applied migrations by filename hash — editing them causes a checksum mismatch error. Always generate a new migration instead.
- **Destructive changes** (dropping a column, renaming a table) require care. Drizzle will generate the destructive SQL — review it before applying. Consider a multi-step migration: add new → backfill → drop old.

---

## Rollback strategies

Drizzle does not have a built-in rollback command. Options, in order of preference:

### 1. Neon branching (preferred)

Neon supports database branches — think of them like git branches for your data. Use this before any risky migration:

```bash
# Create a branch from main (via Neon console or CLI)
neon branches create --name pre-migration-backup

# Point your local DATABASE_URL at the branch to test the migration there first
# If it breaks, the main branch is untouched
```

Vercel preview deployments can be pointed at a Neon branch per PR, so each preview gets its own isolated database state. Set this up in the Neon integration settings in Vercel.

### 2. Write a forward-only rollback migration

Since you can't undo a migration, write a new migration that reverses the change:

1. Revert (or adjust) `lib/db/schema.ts` to the desired state
2. Run `pnpm db:generate` — Drizzle will generate a migration that undoes the previous change (e.g., `DROP TABLE`, `DROP COLUMN`)
3. Apply it: `pnpm db:migrate`

### 3. Neon point-in-time restore (break-glass)

If a bad migration already ran against production and you need to recover data:

1. Go to the Neon console → your project → **Restore**
2. Pick a timestamp before the migration ran
3. Neon restores the branch to that point

This is destructive (you lose data written after the restore point), so use it only as a last resort.

---

## Useful commands

| Command | What it does |
|---|---|
| `pnpm db:generate` | Generate migration SQL from schema changes |
| `pnpm db:migrate` | Apply pending migrations to the database |
| `sqlc generate` | Regenerate Go query code from SQL (run after migration changes) |
| `vercel env pull .env.local` | Pull Vercel env vars (including `DATABASE_URL`) locally |
