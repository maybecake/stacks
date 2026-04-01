## Why

The frontend stack has fallen behind on several major versions: React 18 → 19, React Router 6 → 7, TypeScript 5 → 6, Vite 6 → 8, and ESLint 9 → 10. Running outdated major versions accumulates security exposure, misses performance improvements, and will make future upgrades harder as the gap widens.

## What Changes

- **BREAKING** Upgrade React from 18 to 19 — new concurrent rendering behavior, removed legacy APIs (`ReactDOM.render`, string refs, `defaultProps` on function components)
- **BREAKING** Upgrade React Router from v6 to v7 — ships as a Vite plugin, changes import paths and data-loading APIs
- **BREAKING** Upgrade TypeScript from 5.8 to 6.x — stricter type-checking, potential inference regressions
- **BREAKING** Upgrade Vite from 6 to 8 — config API changes, plugin compatibility requirements
- **BREAKING** Upgrade ESLint from 9 to 10 — flat config only (already adopted), potential rule changes
- Upgrade `@vitejs/plugin-react` from 4 to 6 (required for Vite 8)
- Upgrade `eslint-plugin-react-hooks` from 5 to 7 (required for React 19 + ESLint 10)
- Upgrade `typescript-eslint` from 8 to latest (TypeScript 6 support)
- Upgrade all `@radix-ui/*` packages to latest patch versions (non-breaking)
- Upgrade `@types/react` and `@types/react-dom` to v19 (aligned with React 19)
- Upgrade Node.js runtime from v23 to latest LTS (v24 when available, else stay on v23 current)

## Capabilities

### New Capabilities

- `dependency-upgrade-procedure`: The validated process, ordering, and verification steps for safely upgrading this project's frontend stack across major versions.

### Modified Capabilities

<!-- No existing spec capabilities are changing — this is infrastructure-only -->

## Impact

- `frontend/package.json` — version range changes for all upgraded packages
- `frontend/src/` — React 19 may require removing deprecated API usage; Router v7 changes import paths
- `frontend/vite.config.ts` — potential config adjustments for Vite 8 + React Router v7 plugin
- `frontend/eslint.config.js` — rule set changes from ESLint 10 and updated plugins
- `.devcontainer/` — Node.js version pin if added
- No backend services are affected (Go/Python gRPC services have no JS dependencies)
