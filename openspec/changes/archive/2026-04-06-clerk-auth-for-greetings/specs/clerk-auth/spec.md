## ADDED Requirements

### Requirement: ClerkProvider wraps the application
The frontend SHALL wrap the entire React application in a `ClerkProvider` so that all components have access to Clerk's auth context.

#### Scenario: Provider is present in the component tree
- **WHEN** the application renders
- **THEN** `ClerkProvider` SHALL be an ancestor of `App` in the React tree, with `publishableKey` set from `VITE_CLERK_PUBLISHABLE_KEY`

#### Scenario: Missing publishable key
- **WHEN** `VITE_CLERK_PUBLISHABLE_KEY` is not set
- **THEN** the Clerk SDK SHALL throw an error at startup before any UI renders

### Requirement: UserButton is present in the header
The `Header` component SHALL render a Clerk `<UserButton />` so users can sign in, view their account, and sign out from any page.

#### Scenario: Signed-out state
- **WHEN** no Clerk session exists
- **THEN** the header SHALL render a sign-in button or Clerk `<SignInButton>` in place of the user avatar

#### Scenario: Signed-in state
- **WHEN** a valid Clerk session exists
- **THEN** the header SHALL render the Clerk `<UserButton />` showing the user's avatar

### Requirement: Sign-in flow uses Clerk-hosted UI
The application SHALL use Clerk's hosted sign-in and sign-up pages rather than custom auth forms.

#### Scenario: User initiates sign-in
- **WHEN** a user clicks the sign-in affordance (header button or card prompt)
- **THEN** Clerk SHALL handle the sign-in flow (modal or redirect) without a custom auth page being required

### Requirement: VITE_CLERK_PUBLISHABLE_KEY env var is defined
The frontend build environment SHALL define `VITE_CLERK_PUBLISHABLE_KEY` containing the Clerk publishable key for the target environment.

#### Scenario: Development environment
- **WHEN** `pnpm dev` is run
- **THEN** the value from `.env.local` SHALL be available as `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`
