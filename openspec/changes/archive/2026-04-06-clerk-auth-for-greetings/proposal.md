## Why

The greeting actions (hello, yo, sup) currently allow anonymous submissions, making it impossible to attribute greetings to specific users or enforce per-user rate limits in the future. Adding Clerk authentication gates only the write actions behind identity while keeping the page and listing features fully public.

## What Changes

- Users must be signed in to submit a hello, yo, or sup greeting
- Users who are not signed in see a sign-in prompt when attempting to use HelloCard, YoCard, or SupCard
- The greetings list (StatsCard) and all read-only views remain fully public — no auth required
- The frontend gains a Clerk provider and a UserButton in the header for session management
- The greeting API endpoints (hello, yo, sup) enforce a valid Clerk JWT before processing the request

## Capabilities

### New Capabilities
- `clerk-auth`: Clerk SDK integration — provider setup, session management, UserButton in header, sign-in/sign-up flow
- `greeting-auth-gate`: Per-card auth enforcement — HelloCard, YoCard, and SupCard require an authenticated session; unauthenticated users are prompted to sign in

### Modified Capabilities
- `greeting-domain`: The hello, yo, and sup greeting actions now require an authenticated caller; the list/stats actions remain unauthenticated

## Impact

- **Frontend**: `frontend/` gains `@clerk/react` dependency; `main.tsx` wraps app in `ClerkProvider`; `Header` gets a `<UserButton />`; `HelloCard`, `YoCard`, `SupCard` add auth-gate logic
- **API**: Greeting submission endpoints must validate a Clerk JWT from the `Authorization` header before recording a greeting; list/stats endpoints unchanged
- **Environment**: `VITE_CLERK_PUBLISHABLE_KEY` needed in frontend env; `CLERK_SECRET_KEY` (or JWKS URL) needed in backend env
- **Dependencies**: `@clerk/react` added to frontend; JWT verification library added to backend(s)
