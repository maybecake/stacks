# Stacks

Polyglot monorepo with a React/TypeScript frontend, Go gRPC service, and Python gRPC service, built with Bazel.

## Dev Container (recommended)

The primary development environment is a VS Code dev container based on Ubuntu 24.04.

**Prerequisites:**
- Docker Desktop (or Docker Engine)
- VS Code with the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension

**Getting started:**
1. Open the repo in VS Code
2. When prompted, click **Reopen in Container** (or run `Dev Containers: Reopen in Container` from the command palette)
3. Wait for the container to build and the `postCreateCommand` to finish

The container includes:
- **Node.js 23** with pnpm (via corepack)
- **Go** (latest, via devcontainer feature)
- **Bazel** (via devcontainer feature)
- **Python 3**
- **protoc** (Protocol Buffers compiler)
- **PostgreSQL** client + server
- **Docker** (Docker-outside-of-Docker — host socket mounted)
- **Claude Code** CLI
- Go tools: `buildifier`, `gazelle`, `grpcurl` (installed via `postCreateCommand`)

Ports `3000` and `5173` are forwarded to the host automatically.

## Project Structure

```
api/protos/        — Protobuf definitions (shared API contracts)
frontend/          — React + TypeScript + Vite frontend
service/simple/    — Go gRPC service
```

## Frontend

Run from the `frontend/` directory:

```bash
pnpm dev        # Start Vite dev server on http://localhost:5173
pnpm build      # TypeScript check + production build
pnpm lint       # ESLint
pnpm preview    # Preview production build
```

The Vite config proxies `/api` to `localhost:8080` for backend integration.

## Bazel

Run from the repo root:

```bash
bazel build //...                          # Build all targets
bazel build //service/simple              # Build Go gRPC server
bazel build //api/protos:hello_go_proto   # Build Go protobuf stubs
bazel run //:gazelle                       # Regenerate BUILD.bazel files
```

## Windows (native, without dev container)

If you prefer a native Windows setup:

```powershell
choco install bazelisk
choco install buildifier
choco install protoc
choco install msys2
```

VS Code extensions: `BazelBuild.vscode-bazel`, `zxh404.vscode-proto3`

You will also need to install Node.js and enable pnpm separately (`corepack enable`).
