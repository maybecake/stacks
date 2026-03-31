## 1. buf Setup

- [ ] 1.1 Add `buf.yaml` at the repo root referencing `api/protos` as the input and pinning `buf.build/googleapis/googleapis` as a dependency
- [ ] 1.2 Add `buf.gen.yaml` at the repo root with three plugins: `buf.build/connectrpc/go` (out: `api/gen/go`), `buf.build/bufbuild/es` (out: `api/gen/ts`), `buf.build/connectrpc/es` (out: `api/gen/ts`)
- [ ] 1.3 Run `buf generate` and commit the generated files under `api/gen/go/` and `api/gen/ts/`
- [ ] 1.4 Verify generated Go file at `api/gen/go/hello/v1/helloconnect/hello.connect.go` (or equivalent) contains a `HelloServiceHandler` interface
- [ ] 1.5 Verify generated TypeScript files in `api/gen/ts/` include `HelloService` client descriptor and `HelloRequest`/`HelloResponse` message types

## 2. Bazel Updates

- [ ] 2.1 Add `rules_buf` to `MODULE.bazel`; remove `rules_proto_grpc_go`
- [ ] 2.2 Update `api/protos/BUILD.bazel`: remove `go_proto_library` target; add a `buf_lint` rule; keep `proto_library` and `python_proto_compile`
- [ ] 2.3 Add a `go_library` target in `api/gen/go/BUILD.bazel` (or let Gazelle generate it) wrapping the buf-generated Connect Go code
- [ ] 2.4 Update `service/simple/BUILD.bazel`: replace `//api/protos:hello_go_proto` and `@org_golang_google_grpc` deps with the generated Connect Go library and `connectrpc.com/connect`
- [ ] 2.5 Run `bazel run //:gazelle` to regenerate any other affected BUILD files
- [ ] 2.6 Verify `bazel build //...` passes cleanly

## 3. Go Service — Switch to Connect

- [ ] 3.1 Add `connectrpc.com/connect` and `golang.org/x/net` to `go.mod` via `go get`; remove `google.golang.org/grpc` if no longer referenced
- [ ] 3.2 Rewrite `service/simple/simple.go`: implement the buf-generated `HelloServiceHandler` interface with the existing `SayHello` logic
- [ ] 3.3 Replace the gRPC server setup in `main()` with a `connectrpc/connect` handler registration, an `http.NewServeMux()`, and an h2c-wrapped `http.Server` on `:8080`
- [ ] 3.4 Remove the `net.Listen(":50051")` gRPC server entirely
- [ ] 3.5 Verify with `go build ./service/simple/...` that it compiles
- [ ] 3.6 Verify with `curl` using the Connect protocol (or grpcurl targeting `:8080`) that `SayHello` returns the expected greeting

## 4. Frontend — Connect Client

- [ ] 4.1 Add `@connectrpc/connect-web` and `@bufbuild/protobuf` to `frontend/package.json` via `pnpm add`
- [ ] 4.2 Rewrite `frontend/src/api/hello.ts`: create a `createConnectTransport` pointed at `/api`, instantiate a `createClient(HelloService, transport)`, and export `sayHello(name: string): Promise<string>` using the generated client
- [ ] 4.3 Import `HelloService` and message types from `api/gen/ts/` (relative import path from `frontend/src/` — confirm path depth)
- [ ] 4.4 Verify `pnpm build` passes with no TypeScript errors

## 5. Frontend Hook

- [ ] 5.1 Create `frontend/src/hooks/useHello.ts` with `useHello(name: string)` returning `{ data: string | null, loading: boolean, error: Error | null }`
- [ ] 5.2 Call `sayHello` in a `useEffect` with `name` as dependency; set loading/data/error state appropriately
- [ ] 5.3 Handle `ConnectError` from the client and expose it as `error`

## 6. Prototype UI

- [ ] 6.1 Add a "Prototype" section to an existing page (home `/` or `/samples`) with a text input and "Send" button
- [ ] 6.2 Wire the button to trigger `useHello` on demand (submit-driven, not on every keystroke)
- [ ] 6.3 Add a read-only textarea below the button showing the response message, loading indicator, or error text
- [ ] 6.4 Disable the "Send" button when the name input is empty
- [ ] 6.5 Verify end-to-end in the browser: start the Go service and `pnpm dev`, confirm a name can be submitted and the greeting appears via the Connect/gRPC-Web path
