## Context

No invitation or RSVP infrastructure exists in the app today. The frontend has auth (Clerk), a greeting domain, and a component library. The backend is gRPC-only. This change introduces a self-contained invitation system on top of that foundation.

The primary complexity is **household-aware capacity management**: a single RSVP may add 1–4 people (child + optional parent + optional siblings), and the system must enforce venue headcount in real time while also preventing duplicate registrations when two parents share custody of the same invited child.

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

### 1. Data model: Invitee as the anchor, not the parent

The **Invitee** (the child being invited) is the central entity. Parents are associated with an invitee. RSVPs reference an invitee. This prevents duplication at the source: two parents competing to RSVP for the same child both touch the same invitee record.

*Alternative considered:* anchor on the parent/household. Rejected because it makes duplicate detection harder — you'd need fuzzy matching on child names rather than a known FK.

### 2. Household headcount computed at RSVP time

When a parent submits an RSVP, the system calculates their household footprint (1 child + attending parent flag + sibling count) and checks it against `venue_capacity - current_confirmed_headcount`. If it doesn't fit, RSVP is rejected.

*Alternative considered:* Reserve a slot at form-open time. Rejected — too complex for MVP and leads to abandoned reservations blocking real guests.

### 3. Invite link = event token, not per-guest token

A single shareable link encodes the event ID. Any visitor can look up the event and start an RSVP. The guest identifies themselves by selecting or entering an invitee's parent name.

*Alternative considered:* Per-parent unique tokens. Better security but requires email delivery infrastructure. Deferred post-MVP.

### 4. gRPC service methods for all data operations

Consistent with existing architecture. New proto methods added to a new `InvitationService`. Frontend calls via gRPC-Web or a thin BFF adapter.

### 5. Optimistic capacity lock via server-side transaction

RSVP confirmation is a single gRPC call that atomically checks capacity and writes the RSVP. No client-side capacity state is trusted.

## Risks / Trade-offs

- **Race condition on last slot**: Two guests submit simultaneously for the last 2 spots each needing 2 people. Mitigated by atomic server-side check — one will get an error and be prompted to adjust.
- **Invite link is guessable if event IDs are sequential**: Use UUIDs or short random tokens for event public IDs.
- **Parent identity is self-reported**: No auth on the guest RSVP flow for MVP. A bad actor could claim to be any parent. Acceptable for MVP (trusted social network of party guests); add auth post-MVP.
- **No email delivery**: Host must manually share the link. Acceptable for MVP scope.

## Open Questions

- Should siblings be individually named, or just counted? (Recommendation: count only for MVP)
- Does the host need to approve RSVPs, or is confirmation automatic? (Recommendation: automatic for MVP)
- What persistence layer? (Recommendation: define in specs; likely same store as greeting-persistence pattern)
