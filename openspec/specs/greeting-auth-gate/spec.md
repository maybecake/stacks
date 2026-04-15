### Requirement: HelloCard, YoCard, and SupCard require authentication to submit
Each greeting submission card (HelloCard, YoCard, SupCard) SHALL check for an active Clerk session before allowing a greeting to be sent. Unauthenticated users SHALL see a prompt to sign in rather than the submission form.

#### Scenario: Unauthenticated user views a greeting card
- **WHEN** a user without an active Clerk session views HelloCard, YoCard, or SupCard
- **THEN** the card SHALL display a sign-in prompt instead of the name input and submit button

#### Scenario: Authenticated user views a greeting card
- **WHEN** a user with an active Clerk session views HelloCard, YoCard, or SupCard
- **THEN** the card SHALL display the name input and submit button as normal

#### Scenario: Unauthenticated user cannot submit via the API directly from these cards
- **WHEN** no Clerk session exists
- **THEN** the card's submit handler SHALL NOT be invokable — the form is not rendered

### Requirement: StatsCard and TestCard remain fully public
The `StatsCard` and `TestCard` components SHALL NOT require authentication and SHALL remain accessible to all users.

#### Scenario: Unauthenticated user views StatsCard
- **WHEN** a user without an active Clerk session views the greetings page
- **THEN** `StatsCard` SHALL render and function normally without any sign-in prompt

### Requirement: Clerk JWT is attached to greeting submission requests
When an authenticated user submits a greeting, the Connect-RPC request SHALL include the Clerk JWT as a Bearer token in the `Authorization` header so the backend can verify identity.

#### Scenario: Authenticated greeting submission
- **WHEN** an authenticated user submits a greeting via HelloCard, YoCard, or SupCard
- **THEN** the outgoing Connect-RPC request SHALL include `Authorization: Bearer <clerk-jwt>` in its headers

#### Scenario: List/stats requests have no auth header
- **WHEN** any user triggers a list or stats request (StatsCard)
- **THEN** the outgoing request SHALL NOT include an `Authorization` header

### Requirement: Auth loading state does not cause layout shift
While Clerk resolves the session on initial load, greeting cards SHALL show a stable loading state rather than flashing between signed-out and signed-in UI.

#### Scenario: Clerk session loading
- **WHEN** the Clerk SDK has not yet resolved the session (`isLoaded === false`)
- **THEN** HelloCard, YoCard, and SupCard SHALL render a neutral loading state (e.g., disabled form or skeleton) rather than the sign-in prompt

### Requirement: InviteManager requires authentication
The `InviteManager` component at `/invite` SHALL check for an active Clerk session before rendering invite management content. Unauthenticated users SHALL see a sign-in prompt.

#### Scenario: Unauthenticated user visits /invite
- **WHEN** a user without an active Clerk session navigates to `/invite`
- **THEN** `InviteManager` SHALL display a sign-in prompt and SHALL NOT render event or guest list content

#### Scenario: Authenticated user visits /invite
- **WHEN** a user with an active Clerk session navigates to `/invite`
- **THEN** `InviteManager` SHALL render the invite management UI

#### Scenario: Clerk session loading on /invite
- **WHEN** the Clerk SDK has not yet resolved the session (`isLoaded === false`)
- **THEN** `InviteManager` SHALL show a neutral loading state rather than flashing between signed-out and signed-in UI
