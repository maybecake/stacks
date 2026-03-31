# Dependency Update Spec

## Motivation

Bring the project's frontend and build tooling up to date. Key drivers:

- React 17 uses the deprecated `ReactDOM.render()` API (removed in React 19)
- React Router v5 is end-of-life; v6 is the stable, actively maintained successor
- Bazel `protobuf` dependency was pinned to a release candidate (`31.0-rc1`)
- Node.js 23.x is an unstable odd-numbered release; Node 22 LTS is the stable choice

## Scope

### In-scope

- React 17 → 18
- React Router v5 → v6
- TypeScript 5.7 → 5.8
- Bazel: `protobuf` rc1 → stable, Go SDK alignment (1.22 → 1.23)
- Dockerfile: Node 23.x → 22.x LTS
- Python `requirements.txt`: add version pins

### Out-of-scope

- React 19 — deferred; additional breaking changes around refs/actions not yet warranted
- React Router v7 — deferred; Remix-style API requires a larger refactor
- Backend integration work (no API calls from frontend yet)

## Source Files Changed

| File | Change |
|------|--------|
| `frontend/package.json` | Bump react, react-dom, @types/react, @types/react-dom, react-router-dom, typescript |
| `frontend/src/main.tsx` | `ReactDOM.render()` → `createRoot()` |
| `frontend/src/App.tsx` | `<Switch>/<Route component>` → `<Routes>/<Route element>` |
| `frontend/src/components/Header.tsx` | NavLink: remove `exact`/`activeClassName`, use `className` fn |
| `frontend/src/features/samples/Samples.tsx` | `useHistory` → `useNavigate` |
| `MODULE.bazel` | protobuf stable, Go SDK 1.23 |
| `Dockerfile.dev` | Node 22.x LTS |
| `service/requirements.txt` | Pinned versions |

## Change Log

| Date | Step | Outcome |
|------|------|---------|
| 2026-03-27 | React 18 + Router v6 frontend migration | |
| 2026-03-27 | Bazel, Dockerfile, Python minor updates | |
