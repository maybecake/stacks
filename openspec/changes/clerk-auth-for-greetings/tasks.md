## 1. Clerk Application & Environment

- [x] 1.1 Create a Clerk application (via Vercel Marketplace or clerk.com dashboard) and obtain the publishable key and JWKS URL
- [x] 1.2 Add `VITE_CLERK_PUBLISHABLE_KEY` to `frontend/.env.local` for development
- [ ] 1.3 Add `CLERK_JWKS_URL` to the Go service environment (`.env` or dev container config)
- [ ] 1.4 Document required env vars in a `.env.example` or README section

## 2. Frontend — Clerk Provider & Header

- [x] 2.1 Add `@clerk/react` to `frontend/package.json` and install (`pnpm install`)
- [x] 2.2 Wrap `<App />` with `<ClerkProvider afterSignOutUrl="/">` in `frontend/src/main.tsx` (no `publishableKey` prop — Clerk reads `VITE_CLERK_PUBLISHABLE_KEY` automatically), inside the existing `<ThemeProvider>`
- [x] 2.3 Add auth controls to `frontend/src/components/Header.tsx` using `<Show when="signed-in"><UserButton /></Show>` and `<Show when="signed-out"><SignInButton /></Show>`
- [x] 2.4 Style the auth controls in `header.css` to sit in the existing header toolbar alongside `<ThemeDropdown />`

## 3. Frontend — Auth Gate in Greeting Cards

- [x] 3.1 Update `HelloCard.tsx`: wrap the form in `<Show when="signed-in">` and add `<Show when="signed-out"><SignInButton /></Show>` for the prompt; use `useAuth().isLoaded` to gate the loading state
- [x] 3.2 Update `YoCard.tsx`: same `<Show>`-based auth gate pattern as HelloCard
- [x] 3.3 Update `SupCard.tsx`: same `<Show>`-based auth gate pattern as HelloCard
- [x] 3.4 Verify `StatsCard.tsx` and `TestCard.tsx` have no auth changes (no `useAuth` added)

## 4. Frontend — JWT Injection via Connect Interceptor

- [x] 4.1 Create a `makeAuthInterceptor` utility (e.g., `frontend/src/lib/authInterceptor.ts`) that calls `getToken()` and injects `Authorization: Bearer <token>` into outgoing requests
- [x] 4.2 Apply the interceptor to the Connect transport in HelloCard, YoCard, and SupCard (per-card transport construction or a shared authenticated transport factory)
- [x] 4.3 Confirm StatsCard's transport does NOT use the auth interceptor

## 5. Go Backend — JWKS JWT Verification

- [ ] 5.1 Add `github.com/MicahParks/keyfunc/v3` to `go.mod` and run `go mod tidy`
- [ ] 5.2 Read `CLERK_JWKS_URL` at startup in `service/simple/simple.go`; fail fast if missing
- [ ] 5.3 Initialize the JWKS key provider at startup (with background refresh)
- [ ] 5.4 Write a `requireAuth` helper that extracts the Bearer token from Connect request headers, verifies RS256 signature + issuer + expiry, and returns a Connect `UNAUTHENTICATED` error on failure
- [ ] 5.5 Call `requireAuth` at the top of `SayHello`, `SayYo` (if present), and `SaySup` (if present) handlers
- [ ] 5.6 Confirm `ListGreetingTypeStats` and `ListGreetedNames` handlers do NOT call `requireAuth`

## 6. Verification

- [ ] 6.1 Unauthenticated user: greetings page loads, StatsCard works, HelloCard/YoCard/SupCard show sign-in prompt
- [ ] 6.2 Authenticated user: HelloCard/YoCard/SupCard show form; successful submission returns greeting message
- [ ] 6.3 Go backend: curl with no token to SayHello returns UNAUTHENTICATED
- [ ] 6.4 Go backend: curl with valid Clerk JWT to SayHello returns greeting
- [ ] 6.5 Go backend: curl with no token to ListGreetingTypeStats returns results normally
- [ ] 6.6 Sign-out via UserButton: cards revert to sign-in prompt without page reload
