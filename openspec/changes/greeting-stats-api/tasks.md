## 1. Extend Proto Definition

- [x] 1.1 Add `GreetingTypeStat` message to `hello.proto` (fields: `string greeting_type`, `int64 count`)
- [x] 1.2 Add `NameFrequency` message to `hello.proto` (fields: `string name`, `int64 count`)
- [x] 1.3 Add `ListGreetingTypeStatsRequest` / `ListGreetingTypeStatsResponse` messages with `page_size`, `page_token`, `next_page_token`
- [x] 1.4 Add `ListGreetedNamesRequest` / `ListGreetedNamesResponse` messages with `page_size`, `page_token`, `next_page_token`
- [x] 1.5 Add `ListGreetingTypeStats` and `ListGreetedNames` RPCs to `HelloService` in `hello.proto`
- [x] 1.6 Add grpc-gateway HTTP annotations to both RPCs (`GET /api/stats/greeting-types`, `GET /api/stats/names`)
- [x] 1.7 Regenerate Go proto stubs: `bazel run //:gazelle && bazel build //api/protos:hello_go_proto`

## 2. Extend Domain Interface

- [x] 2.1 Add `GreetingTypeStat` and `NameFrequency` types to `api/domain/greeting.go`
- [x] 2.2 Add `ListGreetingTypeStats(ctx, limit int, cursor string) ([]GreetingTypeStat, string, error)` to Go `GreetingStore` interface
- [x] 2.3 Add `ListGreetedNames(ctx, limit int, cursor string) ([]NameFrequency, string, error)` to Go `GreetingStore` interface
- [x] 2.4 Update TypeScript `GreetingStore` interface and types in `api/domain/greeting.ts`
- [x] 2.5 Update Python `GreetingStore` abstract base class in `api/domain/greeting.py`

## 3. Update Mock Adapter

- [x] 3.1 Implement `ListGreetingTypeStats` on Go mock — return empty slice, empty cursor, nil error
- [x] 3.2 Implement `ListGreetedNames` on Go mock — return empty slice, empty cursor, nil error
- [x] 3.3 Update TypeScript mock adapter to implement both new interface methods
- [x] 3.4 Update Python mock adapter to implement both new abstract methods
- [x] 3.5 Verify all three adapters compile / import cleanly

## 4. Cursor Pagination Utility (Go)

- [x] 4.1 Write `encodeCursor(offset int) string` — base64-encode `{"offset":N}`
- [x] 4.2 Write `decodeCursor(token string) (int, error)` — decode and validate; return error on malformed input
- [x] 4.3 Add unit tests for encode/decode round-trip and malformed-token error

## 5. Move list RPCs to YoService (Go Vercel function)

- [x] 5.1 Add `GreetingTypeStat`, `NameFrequency`, and list request/response messages to `api/protos/yo/yo.proto`
- [x] 5.2 Add `ListGreetingTypeStats` and `ListGreetedNames` RPCs to `YoService` in `yo.proto`
- [x] 5.3 Remove list RPCs and stats messages from `hello.proto` (keep `SayHello` only)
- [x] 5.4 Run `buf generate` to regenerate Go and TypeScript stubs
- [x] 5.5 Implement `ListGreetingTypeStats` on `YoServer` in `api/yo.go` — parse cursor, call store, encode next cursor, clamp page_size (default 20, max 100), return `INVALID_ARGUMENT` on malformed token
- [x] 5.6 Implement `ListGreetedNames` on `YoServer` in `api/yo.go` — same pagination logic
- [x] 5.7 Remove list method implementations from `api/hello.ts`

## 7. Update Frontend

- [x] 7.1 Re-enable Vite proxy in `frontend/vite.config.ts` targeting `http://localhost:8080`
- [x] 7.2 Update `StatsCard.tsx` to fetch `/api/stats/greeting-types` and `/api/stats/names` in parallel
- [x] 7.3 Update `StatsCard` state types to match the new split response shapes (`greetingTypes`, `names`, `nextPageToken`)
- [x] 7.4 Verify `pnpm build` and `pnpm lint` pass
