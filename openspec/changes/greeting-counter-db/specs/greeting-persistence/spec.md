## ADDED Requirements

### Requirement: Greeting events are persisted to the database
Every successful greeting call (hello, yo, sup) SHALL record the greeting type and the submitted name to a `greeting_log` table in Postgres. A failed database write SHALL NOT prevent the greeting response from being returned to the caller.

#### Scenario: Greeting is recorded on success
- **WHEN** a user submits a name to any greeting endpoint (hello, yo, sup)
- **THEN** a row is inserted into `greeting_log` with the greeting type and name

#### Scenario: DB failure does not break the greeting
- **WHEN** the database is unreachable during a greeting request
- **THEN** the greeting response is still returned successfully to the caller

### Requirement: Per-type greeting counts are maintained
The system SHALL maintain a running count of how many times each greeting type has been called in a `greeting_stats` table. The count SHALL be incremented atomically on each successful greeting call.

#### Scenario: Count increments on each greeting
- **WHEN** a greeting endpoint is called with any name
- **THEN** the count for that greeting type in `greeting_stats` is incremented by 1

#### Scenario: Initial counts exist for all types
- **WHEN** the database schema is first applied
- **THEN** rows exist in `greeting_stats` for 'hello', 'yo', and 'sup' each with count 0

### Requirement: Stats endpoint returns aggregated greeting data
The system SHALL expose a `GET /api/stats` endpoint that returns per-type greeting counts and a deduplicated list of greeted names with their total frequency across all greeting types.

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
