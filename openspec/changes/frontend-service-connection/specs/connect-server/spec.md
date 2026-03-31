## ADDED Requirements

### Requirement: Connect handler serves SayHello over gRPC-Web

The Go service SHALL expose `HelloService.SayHello` via a `connectrpc.com/connect` handler on port `8080`, accepting requests in the Connect, gRPC-Web, and gRPC protocols.

#### Scenario: Successful hello request via Connect protocol

- **WHEN** a Connect client calls `SayHello` with `name: "World"`
- **THEN** the server responds with `message: "Hello, World!"`

#### Scenario: gRPC-Web browser client call

- **WHEN** a browser gRPC-Web client sends a `SayHello` request via the Vite proxy
- **THEN** the server responds successfully with the greeting message

#### Scenario: Empty name

- **WHEN** a client calls `SayHello` with an empty `name`
- **THEN** the server responds with `message: "Hello, !"`

### Requirement: Server listens on :8080 with h2c

The Go service SHALL start an h2c-wrapped HTTP server on `:8080` serving the Connect handler. The standalone gRPC server on `:50051` SHALL be removed.

#### Scenario: Server starts successfully

- **WHEN** the service process starts
- **THEN** the Connect handler is accepting connections on `:8080` via HTTP/1.1 and HTTP/2 cleartext

#### Scenario: Fatal on bind failure

- **WHEN** port `8080` is already in use
- **THEN** the process logs a fatal error and exits

### Requirement: buf generates Go Connect service interfaces

The `hello.proto` SHALL be compiled via `buf generate` (using `buf.build/connectrpc/go`) to produce Go Connect service interfaces in `api/gen/go/`. The `service/simple/` package SHALL implement those interfaces instead of the raw `google.golang.org/grpc` generated stubs.

#### Scenario: Bazel build uses generated Connect interfaces

- **WHEN** `bazel build //service/simple` is run
- **THEN** it compiles against the buf-generated Connect interfaces without errors
