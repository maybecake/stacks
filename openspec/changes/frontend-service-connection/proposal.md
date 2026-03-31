## Why

The frontend and backend services exist independently with no connection between them. The React app has a Vite proxy configured to forward `/api` requests to `localhost:8080`, but nothing is listening on 8080, and no frontend code makes any API calls. This change wires them together using Connect as the protocol layer — giving the frontend a proper gRPC-Web client with types derived from the proto end-to-end, rather than a hand-rolled REST/JSON adapter.

## What Changes

- Add `buf.yaml` and `buf.gen.yaml` at the repo root to drive codegen from `hello.proto`, generating Go Connect service interfaces and TypeScript types + Connect client
- Replace the raw gRPC server registration in `simple.go` with a `connectrpc.com/connect` handler, served over h2c (HTTP/2 cleartext) on `:8080`; the separate gRPC-only port (`:50051`) is removed
- Update `MODULE.bazel` to add `rules_buf` and remove `rules_proto_grpc_go`
- Update `api/protos/BUILD.bazel` to use buf-based codegen targets; remove the `go_proto_library` target
- Update `go.mod` with `connectrpc.com/connect` and `golang.org/x/net` (for h2c); remove `google.golang.org/grpc` as a direct dependency
- Add `@connectrpc/connect-web` and `@bufbuild/protobuf` to the frontend
- Add a frontend Connect transport and generated `HelloService` client in `frontend/src/api/hello.ts` (using generated types, not hand-rolled JSON shapes)
- Add a `useHello` React hook and prototype UI section to demonstrate the end-to-end connection

## Capabilities

### New Capabilities

- `connect-server`: Go Connect handler on `:8080` serving `HelloService.SayHello` over the Connect/gRPC-Web protocol
- `frontend-api-client`: Generated TypeScript Connect client and `useHello` hook for calling the hello endpoint from React with proto-derived types

### Removed Capabilities

- `http-gateway`: The planned thin REST/JSON HTTP handler is superseded by Connect

## Impact

- **`buf.yaml` / `buf.gen.yaml`** (new): buf config and codegen config at repo root
- **`api/gen/`** (new): Generated Go Connect code (`api/gen/go/`) and TypeScript types + client (`api/gen/ts/`), managed by buf
- **`api/protos/BUILD.bazel`**: Remove `go_proto_library`; add buf codegen rules; keep `proto_library` and `python_proto_compile` (Python service unchanged)
- **`MODULE.bazel`**: Add `rules_buf`; remove `rules_proto_grpc_go`
- **`go.mod`**: Add `connectrpc.com/connect`, `golang.org/x/net`; remove `google.golang.org/grpc`
- **`service/simple/simple.go`**: Replace gRPC server setup with Connect handler + h2c HTTP mux; `SayHello` logic unchanged
- **`service/simple/BUILD.bazel`**: Update deps to reference generated Connect Go library
- **`frontend/package.json`**: Add `@connectrpc/connect-web`, `@bufbuild/protobuf`
- **`frontend/src/api/hello.ts`**: Uses generated Connect client instead of fetch
- **No changes** to `hello.proto` itself
- **No breaking changes** to the Python service or its proto compilation
