## Context

The frontend is a Vite + React + TypeScript SPA running in a dev container with Node v23. All dependencies are managed via pnpm. Several packages are now one or two major versions behind, creating a growing gap that increases migration effort over time.

Current versions and their targets:

| Package | Current | Target | Risk |
|---|---|---|---|
| Node.js | v23.11 | v24 LTS (when released) | Low |
| TypeScript | 5.8.x | 6.x | Medium |
| Vite | 6.x | 8.x | Medium |
| `@vitejs/plugin-react` | 4.x | 6.x | Medium |
| React + react-dom | 18.3 | 19.x | High |
| `@types/react` + `@types/react-dom` | 18.x | 19.x | Medium |
| React Router | 6.x | 7.x | High |
| ESLint | 9.x | 10.x | Low |
| `eslint-plugin-react-hooks` | 5.x | 7.x | Low |
| `typescript-eslint` | 8.x | latest | Low |
| `@radix-ui/*` | various | latest patch | Very Low |

## Goals / Non-Goals

**Goals:**
- Bring all dependencies to their current major release
- Maintain a passing `pnpm build` and `pnpm lint` after every upgrade step
- Document any source changes required by breaking APIs
- Establish an upgrade ordering that minimizes compounding failures

**Non-Goals:**
- Adopt React Router v7 "framework mode" (Remix-style) — we stay in library mode
- Rewrite components to use new APIs beyond what is required for compatibility
- Upgrade the Go/Python backend services
- Pin to exact versions rather than ranges

## Decisions

### Decision 1: Upgrade in dependency order, validate at each step

Upgrade from the bottom of the dependency graph upward. Each layer should be green before moving to the next:

1. **Patch-only packages first** (`@radix-ui/*`) — zero expected breakage, establishes a clean baseline
2. **TypeScript 6** — type errors surface early and affect all subsequent steps
3. **ESLint 10 + plugins** — tooling only, no runtime impact; ESLint failures are loud and fast
4. **Vite 8 + `@vitejs/plugin-react` 6** — build tooling; failures are compile-time
5. **React 19 + `@types/react` v19** — highest runtime API impact, but must precede Router v7
6. **React Router 7 (library mode)** — depends on React 19; last because it touches routing code throughout

*Alternative considered*: Upgrade everything at once. Rejected — compounding failures from multiple breaking changes are harder to isolate and fix.

### Decision 2: React Router v7 in library mode only

React Router v7 ships two modes: framework mode (replaces Vite config, adds server rendering) and library mode (drop-in replacement for v6 with renamed imports). We use library mode. The Vite config stays as-is; only import paths and a small number of hooks change.

*Alternative considered*: Adopt framework mode for future SSR capability. Rejected — scope creep; no SSR requirement exists.

### Decision 3: TypeScript 6 strict mode — fix errors, don't loosen config

TypeScript 6 tightens inference in a few areas. If new errors surface, fix the source rather than adding `@ts-ignore` or relaxing `tsconfig.json`. This maintains the benefit of the upgrade.

*Alternative considered*: Temporarily add `// @ts-ignore` suppressions to unblock, then clean up. Rejected — suppressions get forgotten and defeat the purpose.

## Risks / Trade-offs

- **React 19 ref-as-prop change** → Components using `forwardRef` should be audited; React 19 passes `ref` as a regular prop. Existing `forwardRef` wrappers still work in v19 (deprecated but not removed), so this is a warning, not a blocker. → Mitigation: run build after upgrade; address deprecation warnings.

- **React 19 removes legacy APIs** (`ReactDOM.render`, string refs, `defaultProps` on function components) → Scan codebase for usage before upgrading. Current scaffolding appears clean (uses `createRoot`). → Mitigation: grep before upgrading.

- **React Router v7 renamed hooks and components** (`useHistory` → `useNavigate` already done in v6; v7 renames `<Outlet>` imports, changes loader/action API) → In library mode the main change is the package entrypoint (`react-router-dom` still works as a re-export). → Mitigation: run lint + build after upgrade to catch import errors.

- **Vite 8 plugin API changes** → `@vitejs/plugin-react` v6 is the compatible companion. Config format is largely unchanged. → Mitigation: review changelog for `resolve.alias` and `optimizeDeps` options.

- **ESLint 10 rule changes** → Some rules may tighten. Prefer fixing violations over disabling rules. → Mitigation: run `pnpm lint` after upgrade; fix new violations.

- **Node v24 LTS availability** → v24 becomes LTS in October 2026. Until then, v23 (current) is fine to stay on. → Mitigation: skip Node upgrade until v24 LTS is released; add a `.nvmrc` to pin v23.

## Migration Plan

Each step follows the same loop:

```
pnpm update <packages>
pnpm build        # TypeScript check + Vite build
pnpm lint         # ESLint check
# fix any errors, then commit
```

Step sequence:
1. Radix UI patches — `pnpm update "@radix-ui/*"`
2. TypeScript 6 — `pnpm update typescript@^6 --save-dev`
3. ESLint 10 stack — `pnpm update eslint@^10 typescript-eslint eslint-plugin-react-hooks@^7 eslint-plugin-react-refresh globals@^17 --save-dev`
4. Vite 8 + plugin — `pnpm update vite@^8 @vitejs/plugin-react@^6 @types/node --save-dev`
5. React 19 — `pnpm update react@^19 react-dom@^19 @types/react@^19 @types/react-dom@^19`
6. React Router 7 — `pnpm update react-router-dom@^7`

Rollback: each step is a separate commit. Roll back by reverting the commit and running `pnpm install`.

## Open Questions

- Does TypeScript 6 change how `import.meta.dirname` is typed? (Used in `vite.config.ts`) — verify after step 4.
- Are there any Radix UI v2 packages in the roadmap that would require API changes? — check during step 1.
