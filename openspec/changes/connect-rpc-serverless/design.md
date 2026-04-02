## Context

The repo has `HelloService` in `api/protos/hello.proto`. Two persistent gRPC servers (Go, Python) exist but are not callable from a browser or Vercel serverless. Connect-RPC adds a browser-compatible HTTP/1.1 layer over the same proto definitions.

This change expands scope to three endpoints in three languages to validate that the proto contract fully abstracts the backend implementation from the frontend client.

## Goals / Non-Goals

**Goals:**
- Three Connect-RPC serverless functions: TypeScript (`hello`), Go (`yo`), Python (`sup`)
- All callable from the browser via a single consistent Connect client pattern
- Generated types never checked in — regenerated from proto at build/deploy time
- Frontend client code is identical in structure regardless of which language backs the endpoint

**Non-Goals:**
- Replacing or deprecating the existing Go/Python gRPC servers
- Authentication, middleware, or streaming RPCs
- Bazel integration for code generation (use `buf` CLI directly)
- Shared business logic between the three functions (each is an independent demo)

## Decisions

### Three separate proto files, one per service
`api/protos/yo.proto` and `api/protos/sup.proto` are added alongside the existing `hello.proto`. Keeps each service definition self-contained and mirrors the pattern already established. One large combined proto file would couple unrelated services.

### Use `buf` CLI for all code generation
`buf` generates idiomatic types for TypeScript, Go, and Python from a single `buf.gen.yaml`. Alternative (`protoc` with plugins) requires more manual path management. `buf` is pinned via `@bufbuild/buf` npm package so no separate install is needed.

### Generated files are gitignored, regenerated at deploy time
Generated files (`frontend/src/gen/`, `api/gen/go/`, `api/gen/python/`) are excluded from git. They are fast to generate (seconds) and checking them in creates drift risk when proto files change. The Vercel build command runs `buf generate` before the build step. Locally, developers run `pnpm gen:proto` after proto changes.

### Generated output paths by language
| Language | Output path | Consumed by |
|---|---|---|
| TypeScript | `frontend/src/gen/` | Frontend client + `api/hello.ts` |
| Go | `api/gen/go/` | `api/yo.go` |
| Python | `api/gen/python/` | `api/sup.py` |

Go files in `api/gen/go/` are imported by the Go function via the repo's Go module. Python generated files in `api/gen/python/` are on the Python path via `sys.path` insertion in `sup.py` (Vercel Python functions have no package install step for local files).

### Serverless functions live at repo-root `api/`, not `frontend/api/`
Keeps backend code separate from frontend source. Vercel discovers `api/` functions relative to the repo root when no `rootDirectory` is set in `vercel.json`. The existing `vercel.json` has no `rootDirectory`, so this works without additional config changes beyond updating the build command.

### Cold start characteristics by language
Go compiles to a binary — fastest cold starts. Node.js is mid-range. Python is slowest due to interpreter startup and import time. All three are acceptable for a demo/learning context on the free tier.

### `buf generate` in Vercel build command
The `vercel.json` `buildCommand` is updated to: `npx buf generate && cd frontend && pnpm install && pnpm build`. This ensures generated files exist before TypeScript compilation. For Go and Python, Vercel compiles/runs the functions independently — their generated files need to exist at deploy time, covered by the same `buf generate` step.

## Risks / Trade-offs

- **buf not pre-installed on Vercel**: Mitigation — use `npx buf` (via `@bufbuild/buf` in devDependencies) so no global install is required.
- **Go codegen tools (`protoc-gen-go`, `protoc-gen-connect-go`) must be available at build time**: These are Go binaries. Mitigation — use `buf`'s remote plugins (`buf.build/protocolbuffers/go`, `buf.build/connectrpc/go`) so no local binary install is needed.
- **Python generated files on sys.path**: Inserting `api/gen/python/` into `sys.path` at runtime is slightly fragile. Mitigation — isolate to a single import block at the top of `sup.py`.
- **Proto drift if gen:proto not run locally**: Mitigation — CI can verify generated files match proto via `buf generate --error-on-unmanaged` or a diff check. Out of scope for this change but noted.

## React UI

A new **Greetings** tab is added to the frontend navigation alongside the existing tabs. The tab renders three independent cards, one per endpoint:

| Card | Endpoint | Backend |
|---|---|---|
| Hello | `/api/hello` | TypeScript / Node.js |
| Yo | `/api/yo` | Go |
| Sup | `/api/sup` | Python |

Each card contains:
- A short description of the endpoint and the backend technology it exercises
- A text input for the `name` parameter
- A submit button that triggers the Connect-RPC call independently of the other cards
- An output area that shows the response message, a loading indicator while in-flight, or a human-readable error on failure

Cards are independent — submitting one does not affect the state of the others.
