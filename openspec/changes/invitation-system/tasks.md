## 1. Proto & API Layer

- [ ] 1.1 Define `InvitationService` in `api/protos/invitation.proto` with messages: Event, Invitee, Parent, Household, RSVP
- [ ] 1.2 Add RPC methods: `CreateEvent`, `GetEvent`, `AddInvitee`, `RemoveInvitee`, `ListInvitees`, `SubmitRSVP`, `ListHouseholds`
- [ ] 1.3 Generate Go and/or TypeScript stubs from proto (run Bazel or protoc)
- [ ] 1.4 Implement `InvitationService` server with in-memory or persistence-backed store
- [ ] 1.5 Add atomic capacity check in `SubmitRSVP` handler (read-check-write in one transaction)
- [ ] 1.6 Add duplicate RSVP guard in `SubmitRSVP` handler (return error if invitee already confirmed)

## 2. Data Models & Persistence

- [ ] 2.1 Define Event schema: id (UUID), public_token, name, venue, datetime, duration, description, capacity, sibling_policy, parent_stay_policy, host_contacts
- [ ] 2.2 Define Invitee schema: id, event_id, child_name, linked_parent_ids[]
- [ ] 2.3 Define RSVP schema: id, event_id, invitee_id, status (confirmed/declined), parent_name, parent_attending, sibling_count, emergency_contact_name, emergency_contact_phone
- [ ] 2.4 Wire persistence layer (consistent with greeting-persistence pattern in existing specs)

## 3. Event Creation (Host)

- [ ] 3.1 Create `frontend/src/features/invitations/` feature directory
- [ ] 3.2 Build `CreateEventForm` component with fields: name, venue, date/time, duration, description, capacity, sibling policy toggle, parent-stay policy toggle, host contact fields
- [ ] 3.3 Validate required fields client-side before submission
- [ ] 3.4 Wire form submission to `CreateEvent` gRPC call
- [ ] 3.5 On success, display generated invite URL and copy-to-clipboard button
- [ ] 3.6 Add host event management route: `/events/:eventId/manage`

## 4. Guest List Management (Host)

- [ ] 4.1 Build `GuestListManager` component: table of invitees with add/remove controls
- [ ] 4.2 Wire `AddInvitee` gRPC call from add-invitee form (child name + optional parent fields)
- [ ] 4.3 Wire `RemoveInvitee` gRPC call with confirmation dialog; disable remove button if RSVP confirmed
- [ ] 4.4 Display RSVP status badge (pending / confirmed / declined) per invitee row
- [ ] 4.5 Display headcount summary: "X of Y spots filled" on manage page

## 5. RSVP Flow (Guest)

- [ ] 5.1 Add public invite route: `/invite/:eventToken`
- [ ] 5.2 Build `EventInvitePage` — fetches event by token, displays details, host contact, rules summary
- [ ] 5.3 Handle invalid/unknown token with error state
- [ ] 5.4 Build `InviteeSelector` component — list of invited children; show "already registered" badge for confirmed invitees
- [ ] 5.5 On selecting already-confirmed invitee, show duplicate message with registering parent name — do not advance to form
- [ ] 5.6 Build `RSVPForm` component with conditional fields: parent attending (locked if stay required), sibling count (hidden if not allowed with explanatory note), emergency contact fields
- [ ] 5.7 Show remaining capacity on RSVP form; disable form and show "event is full" when capacity is 0
- [ ] 5.8 Wire `SubmitRSVP` gRPC call; handle capacity-exceeded error with user-friendly message
- [ ] 5.9 Show RSVP confirmation screen on success; show decline confirmation on declined submission

## 6. Host Attendee Dashboard

- [ ] 6.1 Build `AttendeesDashboard` component grouped by household: parent name, child, siblings, headcount, emergency contact
- [ ] 6.2 Show registering parent name for each household
- [ ] 6.3 Wire `ListHouseholds` gRPC call to populate dashboard
- [ ] 6.4 Integrate dashboard into `/events/:eventId/manage` page (tab or section alongside guest list)

## 7. Routing & Navigation

- [ ] 7.1 Add React Router routes for `/events/new`, `/events/:eventId/manage`, `/invite/:eventToken`
- [ ] 7.2 Guard host routes (event creation/management) behind auth (Clerk)
- [ ] 7.3 Keep `/invite/:eventToken` fully public (no auth required)

## 8. Polish & Validation

- [ ] 8.1 Verify all required form fields show inline validation errors
- [ ] 8.2 Verify capacity race condition: simulate two simultaneous RSVPs for last slot
- [ ] 8.3 Verify duplicate RSVP protection: two parents attempt RSVP for same child
- [ ] 8.4 Check event token uses UUID (not sequential ID) to avoid guessability
- [ ] 8.5 Verify sibling/parent-stay rules propagate correctly from event config to RSVP form UI
