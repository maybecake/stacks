## 1. Extend Proto Definition

- [ ] 1.1 Add `GreetingTypeStat` message to `hello.proto` (fields: `string greeting_type`, `int64 count`)
- [ ] 1.2 Add `NameFrequency` message to `hello.proto` (fields: `string name`, `int64 count`)
- [ ] 1.3 Add `ListGreetingTypeStatsRequest` / `ListGreetingTypeStatsResponse` messages with `page_size`, `page_token`, `next_page_token`
- [ ] 1.4 Add `ListGreetedNamesRequest` / `ListGreetedNamesResponse` messages with `page_size`, `page_token`, `next_page_token`
- [ ] 1.5 Add `ListGreetingTypeStats` and `ListGreetedNames` RPCs to `HelloService` in `hello.proto`
- [ ] 1.6 Add grpc-gateway HTTP annotations to both RPCs (`GET /api/stats/greeting-types`, `GET /api/stats/names`)
- [ ] 1.7 Regenerate Go proto stubs: `bazel run //:gazelle && bazel build //api/protos:hello_go_proto`

## 2. Extend Domain Interface

- [ ] 2.1 Add `GreetingTypeStat` and `NameFrequency` types to `api/domain/greeting.go`
- [ ] 2.2 Add `ListGreetingTypeStats(ctx, limit int, cursor string) ([]GreetingTypeStat, string, error)` to Go `GreetingStore` interface
- [ ] 2.3 Add `ListGreetedNames(ctx, limit int, cursor string) ([]NameFrequency, string, error)` to Go `GreetingStore` interface
- [ ] 2.4 Update TypeScript `GreetingStore` interface and types in `api/domain/greeting.ts`
- [ ] 2.5 Update Python `GreetingStore` abstract base class in `api/domain/greeting.py`

## 3. Update Mock Adapter

- [ ] 3.1 Implement `ListGreetingTypeStats` on Go mock — return empty slice, empty cursor, nil error
- [ ] 3.2 Implement `ListGreetedNames` on Go mock — return empty slice, empty cursor, nil error
- [ ] 3.3 Update TypeScript mock adapter to implement both new interface methods
- [ ] 3.4 Update Python mock adapter to implement both new abstract methods
- [ ] 3.5 Verify all three adapters compile / import cleanly

## 4. Cursor Pagination Utility (Go)

- [ ] 4.1 Write `encodeCursor(offset int) string` — base64-encode `{"offset":N}`
- [ ] 4.2 Write `decodeCursor(token string) (int, error)` — decode and validate; return error on malformed input
- [ ] 4.3 Add unit tests for encode/decode round-trip and malformed-token error

## 5. Implement RPC Methods in Go Server

- [ ] 5.1 Implement `ListGreetingTypeStats` in `service/simple/simple.go` — parse cursor, call store, encode next cursor, apply page_size clamp (default 20, max 100)
- [ ] 5.2 Implement `ListGreetedNames` in `service/simple/simple.go` — same pagination logic
- [ ] 5.3 Return `INVALID_ARGUMENT` gRPC status on malformed `page_token`
- [ ] 5.4 Verify `bazel build //service/simple` passes

## 6. Wire grpc-gateway

- [ ] 6.1 Add `grpc-gateway` and `google/api/annotations.proto` dependencies to `go.mod` / Bazel WORKSPACE
- [ ] 6.2 Generate gateway registration code for `HelloService`
- [ ] 6.3 In server startup, register gateway mux and start `http.ListenAndServe(":8080", gwMux)` in a goroutine
- [ ] 6.4 Smoke-test: `curl localhost:8080/api/stats/names` returns `{"names":[],"nextPageToken":""}`

## 7. Update Frontend

- [ ] 7.1 Re-enable Vite proxy in `frontend/vite.config.ts` targeting `http://localhost:8080`
- [ ] 7.2 Update `StatsCard.tsx` to fetch `/api/stats/greeting-types` and `/api/stats/names` in parallel
- [ ] 7.3 Update `StatsCard` state types to match the new split response shapes (`greetingTypes`, `names`, `nextPageToken`)
- [ ] 7.4 Verify `pnpm build` and `pnpm lint` pass
