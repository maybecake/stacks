# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Polyglot monorepo using Bazel for builds. Contains:
- **React + TypeScript frontend** (`frontend/`) — the primary active codebase
- **Go gRPC service** (`service/simple/`) — backend service skeleton
- **Python gRPC service** (`service/simple/server.py`) — alternative backend
- **Protobuf definitions** (`api/protos/`) — shared API contracts

## Common Commands

### Frontend (run from `frontend/`)
```bash
pnpm dev        # Start Vite dev server on http://localhost:5173
pnpm build      # TypeScript check + production build
pnpm lint       # ESLint on all .ts/.tsx files
pnpm preview    # Preview production build
```

### Bazel (run from repo root)
```bash
bazel build //...                          # Build all targets
bazel build //service/simple              # Build Go gRPC server
bazel build //api/protos:hello_go_proto   # Build Go protobuf stubs
bazel run //:gazelle                       # Regenerate BUILD.bazel files
```

> There is no test infrastructure yet (no test commands configured).

## Architecture

### Frontend

The frontend uses **React Router v5** with three routes:
- `/` — Home page
- `/samples` — Component showcase
- `/learner` — Educational tools (e.g., TimeLearner timezone explorer)

**Theme system:** `ThemeContext` (`frontend/src/context/ThemeContext.tsx`) manages global theme state (light/dark/solarized) and compactness (normal/compact). Themes map to CSS custom properties applied at the root element; definitions live in `frontend/src/themes/`. Theme state persists to `localStorage`.

**Component layers:**
- `components/ui/` — Primitive reusable components (Button, Toggle, OptionSlider) built on Radix UI
- `components/layout/` — Structural components (Header, TwoColumnLayout)
- `features/` — Page-level feature components with their own subdirectories

### Backend (sketch)
Go and Python services both implement `HelloService` defined in `api/protos/hello.proto`. They are not yet integrated into the frontend (no API calls exist in React code). The Vite config proxies `/api` to `localhost:8080` for when that integration is built.

## Frontend Coding Standards (from `.cursorrules`)

**Component file order:** imports → type definitions → constants → component → exports

**Naming:**
- Components/Types: `PascalCase`
- Utilities/hooks: `camelCase` (hooks prefixed `use`)
- Constants: `UPPER_SNAKE_CASE`

**CSS:** BEM-like class names (`.theme-dropdown__trigger`), CSS custom properties for all theming. Style property order: layout → typography → colors → spacing → component-specific.

**TypeScript:** Strict mode enabled (`noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`). No `PropTypes`, no `defaultProps` — use TypeScript defaults.

**React patterns:** Function components only, hooks for state/effects, Context for global state, controlled components, composition over inheritance, lift state as needed.

## Dev Container

The `.devcontainer/` setup provides an Ubuntu 24.04 container with Node 23, Go, and Python pre-installed. Open in VSCode with the Dev Containers extension to use it.

**IMPORTANT:** All build and run commands must be executed inside the dev container, not on the host. Do not run `pnpm`, `bazel`, `go`, or `python` commands directly in the host shell. Use `docker exec stacks-dev <command>` to run commands in the container.

## Formatting

Prettier config (`.prettierrc`): 2-space indent, 100-char line width.
