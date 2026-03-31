## 1. Preparation

- [ ] 1.1 Create a new git branch `upgrade/dependencies` from `main`
- [ ] 1.2 Verify baseline: run `pnpm build` and `pnpm lint` from `frontend/` — both must pass before any upgrades
- [ ] 1.3 Grep `frontend/src/` for legacy React APIs: `ReactDOM.render`, string `ref=`, and `defaultProps` on function components — confirm zero matches

## 2. Patch Upgrades (Radix UI)

- [ ] 2.1 Run `pnpm update "@radix-ui/react-avatar" "@radix-ui/react-dialog" "@radix-ui/react-dropdown-menu" "@radix-ui/react-slider" "@radix-ui/react-slot" "@radix-ui/react-tabs" "@radix-ui/react-toggle"` from `frontend/`
- [ ] 2.2 Run `pnpm build` and `pnpm lint` — fix any issues
- [ ] 2.3 Commit: `chore(deps): upgrade @radix-ui packages to latest patch`

## 3. TypeScript 6

- [ ] 3.1 Run `pnpm update typescript@^6 --save-dev` from `frontend/`
- [ ] 3.2 Run `pnpm build` — review and fix any new type errors in source (no tsconfig relaxation)
- [ ] 3.3 Verify `import.meta.dirname` in `vite.config.ts` is still correctly typed
- [ ] 3.4 Run `pnpm lint` — fix any issues
- [ ] 3.5 Commit: `chore(deps): upgrade TypeScript to v6`

## 4. ESLint Stack

- [ ] 4.1 Run `pnpm update eslint@^10 typescript-eslint eslint-plugin-react-hooks@^7 eslint-plugin-react-refresh globals@^17 --save-dev` from `frontend/`
- [ ] 4.2 Run `pnpm lint` — review and fix any new lint violations (no rule disabling)
- [ ] 4.3 Run `pnpm build` — confirm no regressions
- [ ] 4.4 Commit: `chore(deps): upgrade ESLint to v10 and lint plugins`

## 5. Vite and Build Tools

- [ ] 5.1 Run `pnpm update vite@^8 "@vitejs/plugin-react@^6" @types/node --save-dev` from `frontend/`
- [ ] 5.2 Review Vite 8 changelog for any `resolve.alias`, `optimizeDeps`, or `server` config changes affecting `vite.config.ts` — update if needed
- [ ] 5.3 Run `pnpm dev` briefly to confirm HMR and dev server start correctly
- [ ] 5.4 Run `pnpm build` and `pnpm lint` — fix any issues
- [ ] 5.5 Commit: `chore(deps): upgrade Vite to v8 and @vitejs/plugin-react to v6`

## 6. React 19

- [ ] 6.1 Run `pnpm update react@^19 react-dom@^19 @types/react@^19 @types/react-dom@^19` from `frontend/`
- [ ] 6.2 Run `pnpm build` — fix any type or runtime errors introduced by React 19
- [ ] 6.3 Audit `forwardRef` usages: they still work but are deprecated in v19 — note any for future cleanup (no change required now)
- [ ] 6.4 Run `pnpm lint` — fix any issues
- [ ] 6.5 Commit: `chore(deps): upgrade React and react-dom to v19`

## 7. React Router 7

- [ ] 7.1 Run `pnpm update react-router-dom@^7` from `frontend/`
- [ ] 7.2 Check for any import path changes in `frontend/src/` (e.g., imports from `react-router-dom` should still resolve in library mode)
- [ ] 7.3 Run `pnpm build` — fix any import or type errors
- [ ] 7.4 Run `pnpm lint` — fix any issues
- [ ] 7.5 Manually verify all three routes (`/`, `/samples`, `/learner`) render correctly with `pnpm dev`
- [ ] 7.6 Commit: `chore(deps): upgrade React Router to v7 (library mode)`

## 8. Finalise and PR

- [ ] 8.1 Add `.nvmrc` to repo root pinning `v23` (documents current Node version)
- [ ] 8.2 Run full `pnpm build` and `pnpm lint` from `frontend/` one final time — confirm clean
- [ ] 8.3 Push branch `upgrade/dependencies` and open a PR to `main`
