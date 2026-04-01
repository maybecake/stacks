## 1. Preparation

- [x] 1.1 Create a new git branch `upgrade/backend-deps` from `main`
- [x] 1.2 Verify baseline: run `go build ./...` from repo root and `pnpm build` + `pnpm lint` from `frontend/` — all must pass before any upgrades

## 2. Go Dependency Upgrade

- [x] 2.1 Run `go get -u ./...` from repo root
- [x] 2.2 Run `go mod tidy` to remove unused entries
- [x] 2.3 Run `go build ./...` — fix any compilation errors
- [x] 2.4 Commit: `chore(deps): upgrade Go dependencies (grpc v1.79.3 + x/* packages)`

## 3. ESLint @eslint/js Upgrade

- [x] 3.1 Check `@eslint/js` 10 changelog for renamed or removed rules affecting `frontend/eslint.config.js`
- [x] 3.2 Run `pnpm update @eslint/js@^10` from `frontend/`
- [x] 3.3 Run `pnpm lint` — fix any new violations in source (no rule suppression)
- [x] 3.4 Run `pnpm build` — confirm no regressions
- [x] 3.5 Commit: `chore(deps): upgrade @eslint/js to v10`

## 4. Python Dependency Pinning

- [x] 4.1 Query PyPI for latest stable versions of `protobuf`, `grpcio`, and `grpcio-tools`
- [x] 4.2 Update `service/requirements.txt` with `==<version>` pins for all three packages
- [x] 4.3 Verify `pip install -r service/requirements.txt` succeeds in a clean environment
- [x] 4.4 Commit: `chore(deps): pin Python service dependencies to explicit versions`

## 5. Finalise and PR

- [x] 5.1 Run `go build ./...` and `pnpm build` + `pnpm lint` one final time — confirm all green
- [ ] 5.2 Push branch `upgrade/backend-deps` and open a PR to `main`
