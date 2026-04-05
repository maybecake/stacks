## ADDED Requirements

### Requirement: GreetingStore port interface is extended with read methods
The `GreetingStore` port interface in each language SHALL be extended with methods to read aggregated stats and name frequencies. The mock adapter SHALL be updated to implement these methods returning empty results.

#### Scenario: TypeScript port declares read methods
- **WHEN** `api/domain/greeting.ts` is imported
- **THEN** the `GreetingStore` interface SHALL include `getStats(): Promise<GreetingStats[]>` and `getNameFrequencies(): Promise<NameFrequency[]>` methods

#### Scenario: Go port declares read methods
- **WHEN** `api/domain/greeting.go` is compiled
- **THEN** the `GreetingStore` interface SHALL include `GetStats(ctx) ([]GreetingStats, error)` and `GetNameFrequencies(ctx) ([]NameFrequency, error)` methods

#### Scenario: Python port declares read methods
- **WHEN** `api/domain/greeting.py` is imported
- **THEN** the `GreetingStore` abstract base class SHALL include abstract `get_stats() -> list[GreetingStats]` and `get_name_frequencies() -> list[NameFrequency]` methods

#### Scenario: Mock adapter returns empty results for read methods
- **WHEN** `getStats` or `getNameFrequencies` is called on the mock adapter
- **THEN** it SHALL return an empty list without error

### Requirement: Postgres adapter implements GreetingStore port interface
Each language SHALL have a Postgres `GreetingStore` adapter in `api/adapters/postgres/` that implements the corresponding language's `GreetingStore` interface, including both write (`recordGreeting`) and read (`getStats`, `getNameFrequencies`) methods.

#### Scenario: TypeScript Postgres adapter satisfies interface
- **WHEN** `PostgresGreetingStore` from `api/adapters/postgres/greeting_store.ts` is used where a `GreetingStore` is expected
- **THEN** it SHALL compile without type errors

#### Scenario: Go Postgres adapter satisfies interface
- **WHEN** `PostgresGreetingStore` from `api/adapters/postgres/greeting_store.go` is assigned to a variable of type `domain.GreetingStore`
- **THEN** it SHALL compile without errors

#### Scenario: Python Postgres adapter satisfies abstract base class
- **WHEN** `PostgresGreetingStore` from `api/adapters/postgres/greeting_store.py` is instantiated
- **THEN** it SHALL not raise `TypeError` for unimplemented abstract methods

### Requirement: Greeting events are persisted to the database via the Postgres adapter
The Postgres adapter's `recordGreeting` method SHALL insert the greeting type and name into a `greeting_log` table and atomically increment the count in a `greeting_stats` table. A failed database write SHALL NOT propagate as an error — the adapter silences DB failures.

#### Scenario: Greeting is recorded on success
- **WHEN** the Postgres adapter's `recordGreeting` is called with a greeting type and name
- **THEN** a row is inserted into `greeting_log` with the greeting type and name
- **AND** the count for that greeting type in `greeting_stats` is incremented by 1

#### Scenario: DB failure is silenced
- **WHEN** the database is unreachable during a `recordGreeting` call
- **THEN** the method SHALL return without error (TypeScript: resolves; Go: returns nil; Python: returns without raising)

### Requirement: Per-type greeting counts are maintained
The `greeting_stats` table SHALL contain one row per greeting type with a running count. The count SHALL be incremented atomically on each successful `recordGreeting` call.

#### Scenario: Initial counts exist for all types
- **WHEN** the database schema is first applied
- **THEN** rows exist in `greeting_stats` for 'hello', 'yo', and 'sup' each with count 0

### Requirement: Postgres adapter returns aggregated stats via read methods
The Postgres adapter's `getStats` method SHALL query `greeting_stats` and return per-type counts. The `getNameFrequencies` method SHALL query `greeting_log` grouped by name, sorted by count descending.

#### Scenario: getStats returns all greeting types
- **WHEN** `getStats` is called on the Postgres adapter
- **THEN** it SHALL return an array of `{greetingType, count}` entries, one per greeting type

#### Scenario: getNameFrequencies returns unique names with counts
- **WHEN** `getNameFrequencies` is called on the Postgres adapter
- **THEN** it SHALL return an array of `{name, count}` entries sorted by count descending, aggregated across all greeting types

### Requirement: Handlers swap from mock to Postgres adapter
Each handler file (`hello.ts`, `yo.go`, `sup.py`) SHALL construct a `PostgresGreetingStore` instead of `MockGreetingStore` and inject it into the domain call. No other handler logic SHALL change.

#### Scenario: Handler uses Postgres adapter
- **WHEN** any greeting endpoint handler initialises
- **THEN** it SHALL construct a `PostgresGreetingStore` with a DB client and pass it to the domain greeting function

### Requirement: Stats endpoint returns aggregated greeting data via the port
The system SHALL expose a `GET /api/stats` endpoint that constructs a `PostgresGreetingStore` and calls its `getStats` and `getNameFrequencies` methods to return per-type greeting counts and a deduplicated list of greeted names with their total frequency.

#### Scenario: Stats returns counts for all greeting types
- **WHEN** a GET request is made to /api/stats
- **THEN** the response contains a `stats` array with one entry per greeting type, each with `greetingType` and `count` fields

#### Scenario: Stats returns unique names with frequencies
- **WHEN** a GET request is made to /api/stats
- **THEN** the response contains a `names` array of unique names sorted by total greeting count descending, each with `name` and `count` fields

#### Scenario: Stats returns empty names list before any greetings
- **WHEN** a GET request is made to /api/stats and no greetings have been sent
- **THEN** the `names` array is empty and all `stats` counts are 0

### Requirement: Schema is version-controlled and migrated on deploy
The database schema SHALL be defined in code using Drizzle ORM and committed to the repository. Migrations SHALL run automatically as part of the Vercel build process before the frontend is compiled.

#### Scenario: Fresh environment is fully bootstrapped on deploy
- **WHEN** the project is deployed to a new Vercel environment with a fresh database
- **THEN** all required tables are created by the migration step before the app is served

### Requirement: Stats card displays greeting data on the greetings page
The greetings page SHALL display a StatsCard component alongside the existing greeting cards that shows the current per-type counts and the list of unique greeted names with their frequencies.

#### Scenario: Stats card loads and displays counts
- **WHEN** the greetings page is loaded
- **THEN** the StatsCard fetches /api/stats and displays the count for each greeting type

#### Scenario: Stats card can be manually refreshed
- **WHEN** the user clicks the Refresh button on the StatsCard
- **THEN** the card re-fetches /api/stats and updates the displayed data
