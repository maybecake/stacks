## Context

No invitation or RSVP infrastructure exists in the app today. The frontend has auth (Clerk), a greeting domain, and a component library. The backend is gRPC-only. This change introduces a self-contained invitation system on top of that foundation.

The primary complexity is **household-aware capacity management**: a household RSVP covers multiple attending persons (children + guardians), and the system must enforce venue headcount in real time while also preventing duplicate RSVPs when two guardians from the same household attempt to register.

## Goals / Non-Goals

**Goals:**
- Host can create an event and configure attendance rules (capacity, sibling policy, parent-stay policy)
- Host manages a guest list of invited children, optionally linked to one or two known parents
- Guest receives a sharable invite link and RSVPs for their full household in one flow
- System enforces capacity before confirming any RSVP
- Host dashboard shows attendees grouped by household with RSVP status and emergency contacts
- Second-parent duplicate RSVP is detected and communicated clearly in the UI

**Non-Goals:**
- Email/SMS delivery of invitations (links are share-only for MVP)
- Payment or ticketing
- Multi-event management (admin dashboard across many events) — single event per host for MVP
- Calendar integration
- Adult-party or non-kid use cases (foundation supports it, but MVP only validates kid's birthday scenario)

## Decisions

### 1. Person as a global, persistent, reusable entity

`persons` is a global table — no `owner_user_id` on the record itself. Ownership is expressed through `user_households` only. A person record created during an unauthenticated RSVP is "orphaned" (valid state) until a user claims it. This allows frictionless RSVP submission without forcing account creation.

*Alternative considered:* user-namespaced persons. Simpler ownership but creates duplicate records when the same real person appears across multiple hosts' events. Rejected in favour of a global identity foundation.

### 2. Household is a first-class entity, not a projection

`households` is a real table. A household contains persons via `household_members`. RSVPs are issued by a household, not by an individual invitee. This naturally handles multiple invited children from the same family — one RSVP covers the whole household regardless of how many members are on the invitee list.

*Alternative considered:* compute "household" by joining RSVP + Invitee at query time. Rejected because it forces a 1:1 RSVP-per-invitee model that double-counts guardians when siblings are both invited.

### 3. Invite target = Person; RSVP unit = Household

Invitations are issued to specific persons (children). RSVPs come from a household. The `UNIQUE(event_id, household_id)` constraint on `invite__rsvps` is the duplicate guard — any guardian from the same household hitting the RSVP endpoint when a confirmed RSVP exists gets `AlreadyExists`.

### 4. Orphaned households claimed via invite context

When an unauthenticated RSVP is confirmed, a `household_claims` row is created linking the household to the event and a one-time `claim_token`. Only a user who presents that token can link the household to their account (`user_households` row). The exact claiming UX (link, QR, code entry) is TBD but the token mechanism is locked in.

This ensures only the registering person can claim — possession of the claim token proves they submitted the original RSVP.

### 5. Host can invite a whole household at once

`AddHouseholdInvitees(event_id, household_id)` expands to one invitee row per child (`household_members WHERE role = 'child'`). Individual `AddInvitee(event_id, person_id)` also available for single-person additions.

### 6. Attendees are named persons, not a sibling count

`invite__rsvp_attendees` links specific persons to an RSVP. Headcount = `COUNT(*) FROM rsvp_attendees WHERE rsvp_id = ?`. Sibling count field removed. Anonymous tag-alongs (uninvited, unnamed extras) can be handled with a `guest_count int` on the RSVP if needed post-MVP.

### 7. Invite link = event token, not per-guest token

Single shareable link encodes the event public token. Any visitor can view event details and begin an RSVP. Guest identifies their household by selecting an invited person and self-identifying as a guardian.

*Alternative considered:* Per-guardian unique tokens. Better security but requires email delivery. Deferred post-MVP.

### 8. gRPC service methods for all data operations

Consistent with existing architecture. New proto methods added to a new `InviteService`. Frontend calls via gRPC-Web or thin BFF adapter.

### 9. Atomic capacity check on RSVP confirmation

RSVP confirmation is a single gRPC call that atomically checks `venue_capacity - SUM(confirmed attendee counts)` and writes the RSVP + attendees. No client-side capacity state trusted.

## Data Model

### Core identity (global, reusable across events)

```
persons
├── id UUID PK
├── name text
├── type ('child' | 'adult')
├── phone text (nullable)
├── email text (nullable)
└── created_at

households
├── id UUID PK
├── name text (nullable)          -- e.g. "Smith family"
└── created_at

household_members
├── household_id FK → households
├── person_id FK → persons
├── role ('child' | 'guardian')
└── PK (household_id, person_id)

user_households                   -- populated after claiming; absence = orphaned
├── user_id text                  -- Clerk UID
└── household_id FK → households

household_claims                  -- one per RSVP submission for unclaimed households
├── id UUID PK
├── household_id FK → households
├── event_id FK → invite__events
├── claim_token UUID UNIQUE
├── claimed_at timestamptz        -- null until claimed
└── created_at
```

### Invitation system

```
invite__events
├── id UUID PK
├── public_token UUID             -- encoded in invite URL
├── host_user_id text             -- Clerk UID
├── name, venue, description text
├── datetime timestamptz
├── capacity int
├── allow_siblings bool
├── require_parent_stay bool
└── created_at

invite__invitees                  -- one row per invited person per event
├── id UUID PK
├── event_id FK → invite__events
├── person_id FK → persons
└── household_id FK → households  -- denorm for grouping queries

invite__rsvps                     -- one per household per event
├── id UUID PK
├── event_id FK → invite__events
├── household_id FK → households
├── status ('confirmed' | 'declined')
├── emergency_contact_name text
├── emergency_contact_phone text
└── created_at
     UNIQUE (event_id, household_id)

invite__rsvp_attendees            -- which persons from the household are attending
├── rsvp_id FK → invite__rsvps
├── person_id FK → persons
└── PK (rsvp_id, person_id)
```

## Person Access Control

`persons` is global but access must be scoped. A caller may access a person record if:
- The person is in a household the caller owns (`user_households → household_members`)
- The person is (or was) an invitee in any of the caller's events — current or past (host access)
- The caller is actively submitting an RSVP for an event where the person is listed

**Claimed persons are not host-discoverable by default.** A host cannot look up a person who belongs to another user's claimed household unless a prior invite relationship exists. Specifically, a host gains access to a claimed person only if:
1. That person is an invitee in the host's current event (person was added to the guest list)
2. That person was an invitee in a previous event hosted by the same host

This prevents hosts from browsing the global `persons` table to discover arbitrary users who happen to have claimed their household. The invite relationship must be established first — either by the host adding the person, or by the guest self-identifying during RSVP (which links them to the event as an invitee).

`ListPersons` / `GetPerson` RPCs enforce this scoping server-side. The query joins through `invite__invitees` to limit results to persons with a valid invite relationship to the caller.

## Risks / Trade-offs

- **Race condition on last slot**: Two households submit simultaneously. Mitigated by atomic server-side check — one gets an error.
- **Invite link is guessable if event IDs are sequential**: Use UUIDs for public tokens.
- **Guardian identity is self-reported**: No guest auth for MVP. Acceptable for trusted social network of party guests; claiming flow adds accountability post-auth.
- **Person deduplication**: Global persons table will accumulate duplicates (same real person, two records) until a merge/dedup tool exists. Accepted as post-MVP problem.
- **No email delivery**: Host manually shares the invite link. MVP scope.

## Future: Person / Household Visibility Permissions

The MVP access model (invite-relationship-gated) is intentionally conservative. A richer permission model is planned post-MVP allowing households to express fine-grained consent:

- **Within-event visibility**: "Allow others in this party to see my information" (e.g. other parents can see contact details for carpooling)
- **Cross-event reuse by host**: "Allow the host to re-invite me to future events"
- **Cross-event reuse by guests**: "Allow other parents from this party to access my household for future invitations" — scoped to host-only or all attendees

This permission model should live on `households` (or a `household_permissions` table) and will gate `ListPersons` / `GetPerson` results beyond the baseline invite-relationship check. MVP data model does not add this table but must not structurally block it — `households` as a first-class entity is the foundation.

## Open Questions

- Does claiming require phone/email verification, or is possession of the claim token sufficient?
- Does the host need to approve RSVPs, or is confirmation automatic? (Recommendation: automatic for MVP)
- What persistence layer? (Recommendation: same Postgres store as existing pattern)
- Should `guest_count` be added to `invite__rsvps` for anonymous extras, or defer entirely?
