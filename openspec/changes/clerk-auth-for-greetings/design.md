## Context

The app is a Vite + React Router v5 SPA talking to gRPC-over-HTTP/2 backends via Connect-RPC. There are three greeting submission actions (SayHello, SayYo, SaySup) and read-only list/stats actions. The frontend is the primary integration point; backends are Go, Python, and Node services implementing the same proto contract.

Auth must be additive — the page stays fully functional for unauthenticated users except for the three write actions.

## Goals / Non-Goals

**Goals:**
- Gate SayHello, SayYo, and SaySup behind a valid Clerk session
- Keep the page, navigation, and list/stats views fully public
- Attach the Clerk JWT to greeting submission requests so backends can verify identity
- Provide visible sign-in/sign-out affordance in the header

**Non-Goals:**
- Route-level protection (the `/greetings` route stays public)
- Per-user greeting history or attribution stored in the database
- Auth on the Python or Node backends in this change (Go backend is the reference implementation; others follow the same pattern independently)
- Enforcing auth at the proto/API layer in non-Go backends (out of scope)

## Decisions

### 1. Auth gate at component level, not route level

The requirement is to allow unauthenticated access to the greetings page and its list views, but require auth for the three write cards. A route guard would block the whole page. Instead, each of HelloCard, YoCard, and SupCard renders a sign-in prompt in place of the form when the user is not authenticated.

**Alternative considered:** A wrapper component (`<AuthGate>`) that wraps just the form. Rejected in favor of in-card logic to keep each card self-contained and to allow card-specific sign-in messaging.

### 2. JWT attached per-request via Connect interceptor

The Clerk JWT is short-lived. Fetching it at transport-construction time would cause expired tokens on long-lived sessions. Instead, a Connect interceptor calls `getToken()` before each request and injects it into the `Authorization: Bearer <token>` header.

The interceptor is applied only to the greeting submission clients (HelloCard, YoCard, SupCard), not the stats/list clients, keeping read paths clean.

**Alternative considered:** A single shared authenticated transport. Rejected because it would also attach tokens to read requests unnecessarily, and `getToken()` at transport-construction time doesn't refresh.

### 3. ClerkProvider placed inside ThemeProvider in main.tsx

`ClerkProvider` must wrap all components that use Clerk hooks. Placing it inside `ThemeProvider` (which has no Clerk dependency) preserves the existing provider hierarchy and avoids unnecessary re-renders of theme consumers on auth state changes.

### 4. JWKS-based JWT verification in the Go backend

The Go backend verifies Clerk JWTs using the Clerk JWKS endpoint rather than the Clerk Go SDK. This avoids a direct Clerk SDK dependency and works identically for any RS256-issuing provider. The JWKS client caches keys with a background refresh to avoid per-request fetches in serverless cold-start scenarios.

**Library:** `github.com/MicahParks/keyfunc/v3` — handles key rotation and caching automatically.

Claim validation requirements:
- `alg`: RS256
- `iss`: Clerk frontend API URL (env var)
- `exp`: must not be expired

The `sub` claim (Clerk user ID) is available for future per-user features but not stored in this change.

List/stats RPCs (`ListGreetingTypeStats`, `ListGreetedNames`) do **not** check for an auth header — they pass through unconditionally.

### 5. Frontend env var via VITE_ prefix

Clerk's publishable key is public and safe to embed in the browser bundle. It is exposed as `VITE_CLERK_PUBLISHABLE_KEY` following Vite's convention for client-side env vars.

## Risks / Trade-offs

- **JWKS cold-start latency** → The first request after a cold start fetches JWKS. `keyfunc` caches after the first fetch; subsequent requests within the TTL are fast. Acceptable for this scale.
- **Token expiry during form fill** → If a user opens a card and takes >1 hour to submit, `getToken()` will still return a fresh token (Clerk refreshes silently). No action needed.
- **Python and Node backends accept unauthenticated requests** → Out of scope for this change. Those backends will need the same JWKS interceptor added separately before being considered auth-complete.
- **No logout redirect** → Clerk's `<UserButton>` handles sign-out; no custom redirect logic is needed since all routes remain accessible after sign-out.

## Migration Plan

1. Add `@clerk/react` to frontend dependencies
2. Provision Clerk application and obtain publishable key + JWKS URL
3. Add env vars to `.env.local` (dev) and deployment environment (prod)
4. Update `main.tsx` and `Header.tsx`
5. Add auth-gating to HelloCard, YoCard, SupCard
6. Add Connect interceptor for auth header injection
7. Add JWKS verification middleware to Go backend
8. Test: unauthenticated list works, unauthenticated submit is blocked at UI, authenticated submit succeeds, backend rejects missing/invalid JWT with `UNAUTHENTICATED`

**Rollback:** Remove `ClerkProvider` from `main.tsx` and revert the three cards and Go interceptor. No data migrations required.

## Open Questions

- Should the Clerk application be created via the Vercel Marketplace integration (auto-provisioned env vars) or manually? Marketplace is preferred if the project is Vercel-deployed.
- Which social providers (Google, GitHub, etc.) should be enabled in Clerk, or email/password only?
