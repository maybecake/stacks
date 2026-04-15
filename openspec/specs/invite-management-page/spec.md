### Requirement: Invite page is accessible via /invite route
The application SHALL expose a `/invite` route that renders the `InviteManager` feature component. A navigation link to `/invite` SHALL appear in the Header.

#### Scenario: User navigates to /invite
- **WHEN** a user visits `/invite`
- **THEN** the `InviteManager` component SHALL render inside the standard app layout (Header + main content)

#### Scenario: Header contains invite link
- **WHEN** any page is rendered
- **THEN** the Header SHALL include a navigation link to `/invite`

### Requirement: Invite page requires authentication
The `/invite` page SHALL check for an active Clerk session. Unauthenticated visitors SHALL see a sign-in prompt. Authenticated users SHALL see the invite management UI.

#### Scenario: Unauthenticated user visits /invite
- **WHEN** a user without an active Clerk session navigates to `/invite`
- **THEN** the page SHALL display a sign-in prompt and SHALL NOT render any event or guest list content

#### Scenario: Authenticated user visits /invite
- **WHEN** a user with an active Clerk session navigates to `/invite`
- **THEN** the page SHALL render the invite management UI

#### Scenario: Clerk session loading on /invite
- **WHEN** the Clerk SDK has not yet resolved the session (`isLoaded === false`)
- **THEN** the page SHALL show a neutral loading state rather than flashing between signed-out and signed-in UI

### Requirement: Host can create an event
When an authenticated host has no existing event, the page SHALL display an event creation form. Submitting the form SHALL call the `InviteService.CreateEvent` RPC and transition the page to manage mode on success.

#### Scenario: Host with no event sees creation form
- **WHEN** an authenticated user visits `/invite` and has no existing event
- **THEN** the page SHALL display a form with fields: name, venue, description, datetime, capacity, allow_siblings (checkbox), and require_parent_stay (checkbox)

#### Scenario: Host submits a valid event creation form
- **WHEN** an authenticated user fills in all required fields and submits the form
- **THEN** the page SHALL call `CreateEvent` with the provided data
- **THEN** on success the page SHALL transition to manage mode showing the newly created event details

#### Scenario: CreateEvent fails
- **WHEN** `CreateEvent` returns an error
- **THEN** the form SHALL display a user-facing error message and remain on the creation form

### Requirement: Host sees their existing event details
When an authenticated host already has an event, the page SHALL display the event's name, venue, datetime, capacity, and rule settings instead of the creation form. This single-event assumption is a demo-phase simplification; the backend supports multiple events per host and a future change will replace this with an event list and selector.

#### Scenario: Host with existing event visits /invite
- **WHEN** an authenticated user visits `/invite` and has an existing event
- **THEN** the left panel SHALL display the event details (name, venue, datetime, capacity, allow_siblings, require_parent_stay) instead of the creation form

### Requirement: Host can view the guest list
The page SHALL display the list of current invitees for the host's event by calling `InviteService.ListInvitees`.

#### Scenario: Guest list loads on manage mode entry
- **WHEN** the page enters manage mode (event exists or was just created)
- **THEN** the page SHALL call `ListInvitees` with the event ID
- **THEN** the right panel SHALL display each invitee's name and type

#### Scenario: Guest list is empty
- **WHEN** `ListInvitees` returns an empty list
- **THEN** the right panel SHALL display an empty-state message indicating no guests have been added yet

#### Scenario: ListInvitees fails
- **WHEN** `ListInvitees` returns an error
- **THEN** the right panel SHALL display a user-facing error message

### Requirement: Host can add a new invitee by name
The guest list panel SHALL include an "Add guest" form with a name field and a child/adult type selector. Submitting it SHALL call `CreatePerson` then `AddInvitee` and refresh the guest list on success.

#### Scenario: Host adds a new child invitee
- **WHEN** an authenticated host enters a name, selects type "child", and submits the add-guest form
- **THEN** the page SHALL call `CreatePerson` with the name and type
- **THEN** on success the page SHALL call `AddInvitee` with the new person's ID and the event ID
- **THEN** on success the guest list SHALL refresh and display the newly added invitee

#### Scenario: Add invitee fails
- **WHEN** either `CreatePerson` or `AddInvitee` returns an error
- **THEN** the add-guest form SHALL display a user-facing error message and the guest list SHALL NOT change

### Requirement: All InviteService calls include the Clerk JWT
Every request to `InviteService` from the invite page SHALL include the Clerk JWT as a Bearer token in the `Authorization` header via `makeAuthInterceptor`.

#### Scenario: Authenticated request to InviteService
- **WHEN** the page calls any `InviteService` RPC
- **THEN** the outgoing Connect-RPC request SHALL include `Authorization: Bearer <clerk-jwt>` in its headers
