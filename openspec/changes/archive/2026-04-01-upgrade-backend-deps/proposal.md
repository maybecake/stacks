## Why

Go's direct gRPC dependency and its transitive `golang.org/x/*` packages (including security-sensitive `x/net`, `x/sys`, `x/crypto`) are several minor versions behind, and the Python service has no version pins in `requirements.txt`, making builds non-reproducible and masking potential security exposure. The frontend's `@eslint/js` also crossed a major version boundary that warrants a controlled upgrade.

## What Changes

- Upgrade `google.golang.org/grpc` from v1.71.1 → v1.79.3
- Upgrade indirect Go deps via `go get -u` and `go mod tidy`: `golang.org/x/net`, `golang.org/x/sys`, `golang.org/x/crypto`, `golang.org/x/text`, `google.golang.org/protobuf`, and other transitive packages
- **BREAKING** Upgrade `@eslint/js` from 9.x → 10.x — potential rule changes; lint violations must be fixed, not suppressed
- Pin Python dependencies in `service/requirements.txt` to specific versions (`protobuf`, `grpcio`, `grpcio-tools`)

## Capabilities

### New Capabilities

- `python-dependency-pinning`: Requirements and process for pinning Python service dependencies to explicit versions for reproducible builds.

### Modified Capabilities

- `dependency-upgrade-procedure`: Extend the upgrade procedure to cover Go (`go get -u` + `go mod tidy` + `go build`) and Python (`pip install` + version pinning) verification steps alongside the existing frontend steps.

## Impact

- `go.mod` / `go.sum` — updated module versions and checksums
- `service/requirements.txt` — pinned versions added for all three packages
- `frontend/eslint.config.js` — potential rule fixes from `@eslint/js` 10
- No frontend source changes expected beyond lint fixes
- No API or runtime behaviour changes (all upgrades are patch/minor within existing APIs)
