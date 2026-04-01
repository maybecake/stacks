## MODIFIED Requirements

### Requirement: Upgrades execute in defined dependency order
Each upgrade step SHALL be performed in a defined sequence appropriate to the ecosystem. For Go: `go get -u` then `go mod tidy` then `go build`. For frontend: package update then lint then build. For Python: determine latest stable versions then update `requirements.txt`. No step SHALL be started until the preceding step is verified green.

#### Scenario: Go upgrade follows get-tidy-build sequence
- **WHEN** upgrading Go dependencies
- **THEN** `go get -u ./...` is run first, followed by `go mod tidy`, followed by `go build ./...` — in that order

#### Scenario: Radix UI patches applied first (frontend)
- **WHEN** the frontend upgrade procedure begins
- **THEN** all `@radix-ui/*` packages are updated to their latest patch versions before any other package is upgraded

#### Scenario: TypeScript upgraded before build tools (frontend)
- **WHEN** Radix UI patches are complete and green
- **THEN** TypeScript is upgraded to v6 and the build passes before Vite or ESLint are touched

#### Scenario: React upgraded before React Router (frontend)
- **WHEN** Vite and ESLint upgrades are complete and green
- **THEN** React 19 is installed and verified before React Router v7 is upgraded

## ADDED Requirements

### Requirement: Go build passes after Go dependency upgrade
After running `go get -u ./...` and `go mod tidy`, `go build ./...` SHALL exit with code 0 before the Go upgrade is committed.

#### Scenario: Build clean after Go upgrade
- **WHEN** Go dependencies are updated
- **THEN** `go build ./...` from the repo root exits with code 0

### Requirement: Python pins verified installable before commit
After updating `service/requirements.txt` with pinned versions, `pip install -r service/requirements.txt` SHALL succeed in a clean environment before the change is committed.

#### Scenario: Clean install succeeds
- **WHEN** `pip install -r service/requirements.txt` is run after pinning
- **THEN** all packages install without conflict or error
