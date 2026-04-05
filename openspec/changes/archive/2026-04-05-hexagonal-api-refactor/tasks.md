## 1. TypeScript Domain and Mock Adapter

- [x] 1.1 Create `api/domain/greeting.ts` — export `GreetingStore` interface and `greetHello(name, store)` domain function
- [x] 1.2 Create `api/adapters/mock/greeting_store.ts` — export `MockGreetingStore` implementing `GreetingStore` as a no-op
- [x] 1.3 Refactor `api/hello.ts` — import domain function and mock adapter, remove inline logic, inject store

## 2. Go Domain and Mock Adapter

- [x] 2.1 Create `api/domain/greeting.go` (`package domain`) — export `GreetingStore` interface and `Greet(ctx, name, store)` domain function
- [x] 2.2 Create `api/adapters/mock/greeting_store.go` (`package mock`) — export `MockGreetingStore` implementing `domain.GreetingStore` as a no-op
- [x] 2.3 Refactor `api/yo.go` — import domain and mock packages, delegate `SayYo` to domain function, inject store

## 3. Python Domain and Mock Adapter

- [x] 3.1 Create `api/domain/__init__.py` and `api/domain/greeting.py` — export `GreetingStore` ABC and `greet_sup(name, store)` domain function
- [x] 3.2 Create `api/adapters/__init__.py`, `api/adapters/mock/__init__.py`, and `api/adapters/mock/greeting_store.py` — export `MockGreetingStore` implementing `GreetingStore` as a no-op
- [x] 3.3 Refactor `api/sup.py` — import domain and mock, delegate handler logic to domain function, inject store

## 4. Verification

- [x] 4.1 Verify `api/hello.ts` TypeScript compiles without errors (`cd api && npx tsc --noEmit`)
- [x] 4.2 Verify Go builds cleanly (`bazel build //...` or `go build ./api/...`)
- [ ] 4.3 Manually confirm all three endpoints return correct greeting responses via local dev or `curl`
- [x] 4.4 Confirm `api/domain/` and `api/adapters/mock/` contain no imports of DB drivers, ORMs, or transport frameworks
