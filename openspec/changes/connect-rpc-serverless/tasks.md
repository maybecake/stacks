## 1. Proto Definitions

- [ ] 1.1 Add `api/protos/yo.proto` — define `YoService` with `SayYo(YoRequest) → YoResponse` (same structure as `hello.proto`)
- [ ] 1.2 Add `api/protos/sup.proto` — define `SupService` with `SaySup(SupRequest) → SupResponse`

## 2. buf Code Generation Setup

- [ ] 2.1 Add `buf.yaml` at the repo root declaring the proto module (path `api/protos`)
- [ ] 2.2 Add `buf.gen.yaml` at the repo root with three output targets:
  - TypeScript (messages + connect-es) → `frontend/src/gen/`
  - Go (protoc-gen-go + protoc-gen-connect-go) → `api/gen/go/` using remote plugins
  - Python (protoc-gen-python + betterproto or connect-python) → `api/gen/python/`
- [ ] 2.3 Add `@bufbuild/buf`, `@bufbuild/protoc-gen-es`, and `@connectrpc/protoc-gen-connect-es` as devDependencies in `frontend/package.json`
- [ ] 2.4 Add a `gen:proto` script in `frontend/package.json` (or root `package.json`) that runs `buf generate` from the repo root
- [ ] 2.5 Add `frontend/src/gen/`, `api/gen/go/`, and `api/gen/python/` to `.gitignore`
- [ ] 2.6 Run `pnpm gen:proto` and verify all three output directories are populated
- [ ] 2.7 Update `vercel.json` `buildCommand` to run `npx buf generate` before `cd frontend && pnpm install && pnpm build`

## 3. TypeScript Serverless Function (hello)

- [ ] 3.1 Add `@connectrpc/connect`, `@connectrpc/connect-node`, and `@bufbuild/protobuf` as dependencies in `frontend/package.json`
- [ ] 3.2 Create `api/hello.ts` — Connect router registering `HelloService` returning `"Hello, <name>!"`, exported via `toNodeHttpHandler`
- [ ] 3.3 Verify `api/hello.ts` typechecks (ensure `tsconfig` in repo root or `api/` covers the file)

## 4. Go Serverless Function (yo)

- [ ] 4.1 Add `connectrpc.com/connect` and generated Go proto dependencies to `go.mod` / `go.sum`
- [ ] 4.2 Create `api/yo.go` — `package handler`, `Handler(w http.ResponseWriter, r *http.Request)`, Connect router registering `YoService` returning `"Yo, <name>!"`

## 5. Python Serverless Function (sup)

- [ ] 5.1 Add `connect-python` (or equivalent) and `protobuf` to `api/requirements.txt` (Vercel installs this for the Python runtime)
- [ ] 5.2 Create `api/sup.py` — Vercel Python handler function, inserts `api/gen/python/` onto `sys.path`, registers `SupService` returning `"Sup, <name>!"`

## 6. React Client Integration

- [ ] 6.1 Add `@connectrpc/connect-web` as a dependency in `frontend/package.json`
- [ ] 6.2 Create `frontend/src/features/greetings/HelloCard.tsx` — description label ("Hello · TypeScript / Node.js"), name input, submit button, Connect client to `/api/hello`, renders response/loading/error
- [ ] 6.3 Create `frontend/src/features/greetings/YoCard.tsx` — description label ("Yo · Go"), name input, submit button, Connect client to `/api/yo`, renders response/loading/error
- [ ] 6.4 Create `frontend/src/features/greetings/SupCard.tsx` — description label ("Sup · Python"), name input, submit button, Connect client to `/api/sup`, renders response/loading/error
- [ ] 6.5 Add a new **Greetings** route/tab to the frontend navigation (alongside existing tabs)
- [ ] 6.6 Create the Greetings page and render all three cards side-by-side (each card manages its own state independently)

## 7. Verification

- [ ] 7.1 Run `pnpm dev` and confirm all three greeting cards call their endpoints and display responses
- [ ] 7.2 Run `pnpm build` and confirm no TypeScript errors
- [ ] 7.3 Run `pnpm lint` and confirm no lint errors
