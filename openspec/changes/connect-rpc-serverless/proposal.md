## Why

The existing HelloService is implemented in Go and Python gRPC servers that run as persistent processes, incompatible with Vercel's serverless model. This change adds three Connect-RPC serverless endpoints — each implemented in a different language (TypeScript, Go, Python) — to demonstrate that the proto contract is the interface boundary and the backend language is an implementation detail invisible to the frontend client.

## What Changes

- Add three proto service definitions (`hello`, `yo`, `sup`) in `api/protos/`
- Add three Vercel serverless functions in `api/` — one per language:
  - `api/hello.ts` (Node.js/TypeScript) — `HelloService.SayHello`
  - `api/yo.go` (Go) — `YoService.SayYo`
  - `api/sup.py` (Python) — `SupService.SaySup`
- Generate language-specific types from protos via `buf` — **not checked in**, regenerated at build/deploy time
- Update Vercel build command to run `buf generate` before the frontend build
- Add a React component on `/samples` that calls all three endpoints

## Capabilities

### New Capabilities
- `serverless-connect-rpc`: Three Connect-RPC serverless endpoints in different languages (TypeScript, Go, Python), all callable from the browser via `@connectrpc/connect-web`, with types generated from proto at build time

### Modified Capabilities

## Impact

- **New proto files**: `api/protos/yo.proto`, `api/protos/sup.proto`
- **New serverless functions**: `api/hello.ts`, `api/yo.go`, `api/sup.py`
- **Generated (gitignored)**: `frontend/src/gen/` (TS client types), `api/gen/go/` (Go server types), `api/gen/python/` (Python server types)
- **Build pipeline**: `vercel.json` build command updated to install buf and run `buf generate` before `pnpm build`
- **Frontend deps**: `@connectrpc/connect`, `@connectrpc/connect-web`, `@connectrpc/connect-node`, `@bufbuild/protobuf`, `@bufbuild/buf`, `@bufbuild/protoc-gen-es`, `@connectrpc/protoc-gen-connect-es`
- **Existing servers**: Go and Python gRPC servers are unaffected
