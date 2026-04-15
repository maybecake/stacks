## 1. Routing and Navigation

- [ ] 1.1 Add `/invite` route to `frontend/src/App.tsx` pointing to `InviteManager`
- [ ] 1.2 Add "Invite" nav link to `frontend/src/components/Header.tsx`
- [ ] 1.3 Export `InviteManager` from `frontend/src/features/index.ts`

## 2. Feature Scaffolding

- [ ] 2.1 Create `frontend/src/features/invite/` directory with `index.ts` barrel
- [ ] 2.2 Create empty `InviteManager.tsx` component file with placeholder render
- [ ] 2.3 Create `invite.css` for feature-specific styles

## 3. Auth Gate

- [ ] 3.1 Add Clerk `Show when="signed-in"` / `Show when="signed-out"` structure to `InviteManager` using `useAuth` for loading state (same pattern as `HelloCard.tsx`)
- [ ] 3.2 Render sign-in prompt with `SignInButton` for unauthenticated users
- [ ] 3.3 Render neutral loading state while `isLoaded === false`

## 4. Event Creation Form

- [ ] 4.1 Add local state for event form fields: name, venue, description, datetimeUnix, capacity, allowSiblings, requireParentStay
- [ ] 4.2 Render form with inputs for all fields (text inputs for name/venue/description, datetime-local for datetime, number for capacity, checkboxes for allowSiblings and requireParentStay)
- [ ] 4.3 Implement `handleCreateEvent` handler: create Connect transport with `makeAuthInterceptor`, call `InviteService.CreateEvent`, store returned event in component state on success
- [ ] 4.4 Show error message if `CreateEvent` RPC fails

## 5. Event Detail View

- [x] 5.1 **Backend prerequisite**: add `ListEvents` RPC to `InviteService` (no params; returns events owned by the authenticated caller via JWT `host_user_id`) — completed in `add-list-pagination`
- [ ] 5.2 On mount (when authenticated), call `InviteService.ListEvents`; if result is non-empty use the first event as the active event and enter manage mode
- [ ] 5.3 When event exists, render event details panel (name, venue, datetime formatted as local string, capacity, rule flags) instead of creation form

## 6. Guest List Panel

- [ ] 6.1 Add local state for invitee list, loading flag, and error
- [ ] 6.2 Implement `loadInvitees` function: call `InviteService.ListInvitees` with event ID, update state on response
- [ ] 6.3 Call `loadInvitees` when the component enters manage mode (event exists or was just created)
- [ ] 6.4 Render invitee list: each row shows invitee name and type (child/adult)
- [ ] 6.5 Render empty-state message when invitee list is empty
- [ ] 6.6 Render error message when `ListInvitees` fails

## 7. Add Guest Form

- [ ] 7.1 Add local state for add-guest form: name field, type selector (child/adult), loading flag, error
- [ ] 7.2 Render add-guest form inside the guest list panel: text input for name, select or toggle for type, submit button
- [ ] 7.3 Implement `handleAddGuest` handler: call `CreatePerson` with name and type, then call `AddInvitee` with returned person ID and event ID, then call `loadInvitees` to refresh the list
- [ ] 7.4 Show error message in add-guest form if either `CreatePerson` or `AddInvitee` fails
- [ ] 7.5 Clear add-guest form fields on successful submission

## 8. Layout

- [ ] 8.1 Use `TwoColumnLayout` to arrange left panel (event form or details) and right panel (guest list + add-guest form)
- [ ] 8.2 Apply BEM class names under `.invite-manager` namespace in `invite.css`
- [ ] 8.3 Verify the page looks reasonable in both light and dark themes using CSS custom properties
