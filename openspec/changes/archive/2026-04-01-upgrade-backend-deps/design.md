## Context

The repo has three dependency ecosystems that need attention after the frontend major-version upgrade round:

| Ecosystem | Change | Risk |
|---|---|---|
| Go | `grpc` v1.71.1 → v1.79.3 + transitive `golang.org/x/*` | Low–Medium |
| Frontend (ESLint) | `@eslint/js` 9 → 10 | Low |
| Python | No version pins in `service/requirements.txt` | Low (hygiene) |

The Go service is a skeleton with no production traffic; the Python service is similarly non-integrated. No frontend runtime behaviour changes. The only user-visible risk is a lint regression from `@eslint/js` 10.

## Goals / Non-Goals

**Goals:**
- Bring `google.golang.org/grpc` and all `golang.org/x/*` packages to current versions
- Pin `service/requirements.txt` to specific versions that resolve cleanly
- Upgrade `@eslint/js` to 10.x and fix any resulting lint violations
- Keep `go build` and `pnpm build` + `pnpm lint` passing after every step

**Non-Goals:**
- Upgrade Go toolchain version (go.mod specifies 1.22; toolchain 1.23.8 is fine)
- Integrate the Go or Python services with the frontend
- Add Python virtual environment or lock-file tooling (out of scope)
- Upgrade any other frontend packages beyond `@eslint/js`

## Decisions

### Decision 1: Use `go get -u ./...` + `go mod tidy` for Go upgrade

Running `go get -u ./...` upgrades all transitive dependencies to their latest compatible versions in one pass, then `go mod tidy` removes any unused entries. This is the idiomatic approach and avoids manually specifying each transitive package.

*Alternative considered*: Upgrade only `google.golang.org/grpc` explicitly and leave transitives pinned. Rejected — the security-relevant packages (`x/net`, `x/crypto`) would remain stale.

### Decision 2: Pin Python deps to latest stable at time of upgrade

Determine current latest versions of `protobuf`, `grpcio`, and `grpcio-tools` via PyPI, then pin with `==` in `requirements.txt`. This gives reproducible installs without introducing a lock-file tool.

*Alternative considered*: Use `>=` lower-bound pins. Rejected — lower bounds drift over time and don't improve on the current unpinned state.

### Decision 3: Fix `@eslint/js` 10 violations in source, not via rule suppression

Consistent with the existing `dependency-upgrade-procedure` spec: any new lint violations introduced by the major bump SHALL be fixed in the same commit, not suppressed.

## Risks / Trade-offs

- **`go get -u` picks up pre-release versions** → Use `go get -u ./...` without `-pre`; Go's toolchain selects stable releases by default.
- **`@eslint/js` 10 tightens rules** → Some flat-config rule names or defaults may change. Mitigation: run `pnpm lint` after upgrade and fix violations before committing.
- **Python pin becomes stale quickly** → Acceptable tradeoff vs. unpinned. Future upgrade rounds will refresh the pin.

## Migration Plan

1. **Go**: `go get -u ./...` from repo root → `go mod tidy` → `go build ./...` → commit
2. **ESLint**: `pnpm update @eslint/js@^10` from `frontend/` → `pnpm lint` → fix violations → `pnpm build` → commit
3. **Python**: Query PyPI for latest stable versions → update `service/requirements.txt` → commit

Rollback: each step is a separate commit; revert the commit to restore prior state.

## Open Questions

- Are there any `@eslint/js` 10 rule renames that affect the current `eslint.config.js`? — check changelog before upgrading.
