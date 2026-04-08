## Why

There is no way to create and manage event invitations in the app. Hosts need to invite guests, set attendance rules, and track RSVPs — especially for complex scenarios like kids' birthday parties where household composition, sibling policies, and venue capacity all interact.

## What Changes

- New invitation system allowing hosts to create events with logistics, rules, and a guest list
- RSVP flow for guests (parents) to respond for their full household in one step
- Real-time capacity enforcement to prevent overbooking
- Household/party grouping so hosts see attendees by family unit, not just individuals
- Duplicate RSVP protection: if a child is already registered by one parent, second parent sees clear indication

## Capabilities

### New Capabilities

- `event-creation`: Host creates an event with venue, time, description, contact info, and rules configuration (capacity, sibling policy, parent stay policy)
- `guest-list-management`: Host manages the invited children (the target invitee group); supports linking known parents to invited children
- `rsvp-flow`: Guest (parent) receives invite link, answers conditional questions based on event rules, and submits RSVP for full household
- `capacity-enforcement`: System tracks headcount in real time and blocks RSVPs that would exceed venue limit
- `household-tracking`: Attendees grouped by household/party; host dashboard shows family units, emergency contacts, and RSVP status
- `duplicate-rsvp-protection`: Detects when a second parent attempts to RSVP for an already-registered child and surfaces clear UI messaging

### Modified Capabilities

## Impact

- New frontend routes and feature components under `frontend/src/features/invitations/`
- New data models: Event, Invitee, Household, RSVP
- New gRPC service methods in `api/protos/` for event and RSVP operations
- No changes to existing greeting domain or auth specs
