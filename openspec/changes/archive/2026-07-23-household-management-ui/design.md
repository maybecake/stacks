## Context

The invite page currently uses a single monolithic `InviteManager` component that handles event creation, guest list display, and a combined add-guest form that silently creates a household on every person add. The guest list is a flat `<ul>` of invitees with no household context. The backend proto has `CreateHousehold`, `AddHouseholdMember`, `ListHouseholds`, and `RemoveInvitee` but is missing `RemoveHouseholdMember`.

The domain model is already household-centric (one RSVP per household, capacity counted by persons), but the UI does not reflect this.

## Goals / Non-Goals

**Goals:**
- Guest list displays persons grouped by household with an "Unassigned" section
- Host can assign an unassigned person to an existing or new household
- Host can reassign a person from one household to another, or back to unassigned
- `PersonCreationForm` and `HouseholdPicker` are standalone components with no direct RPC or event-state coupling
- `RemoveHouseholdMember` RPC added to proto and backend

**Non-Goals:**
- Deleting households or persons
- Multi-event support (single event per host remains)
- RSVP-side household management changes
- Bulk operations (select multiple persons to assign at once)

## Decisions

### Decision: Separate `PersonCreationForm` from `HouseholdPicker`

The "add guest" form is split into two independently mountable components:

- `PersonCreationForm` — collects name + type, calls `onSubmit({ name, type })`. No RPC calls, no household state.
- `HouseholdPicker` — receives `households: Household[]` as a prop, calls `onSelect(householdId)` or `onCreate(name)`. No RPC calls.

The `InviteManager` (or any future flow) owns all RPC calls and passes data down. This means either component can be embedded in a modal, a sidebar, or a separate page without changes.

**Alternative considered:** Combined wizard component (person → household in one form). Rejected because it forces the two concerns together even when only one is needed (e.g., a future "bulk import" flow only needs person creation).

### Decision: `HouseholdGuestList` owns data fetching; sub-components are pure

A new `HouseholdGuestList` component is responsible for calling `ListHouseholds` + `ListInvitees` and deriving the grouped view. It passes rendered data down to `HouseholdCard` (one per household) and an `UnassignedSection`. Neither `HouseholdCard` nor `UnassignedSection` make RPC calls.

```
InviteManager
├── left panel: EventDetail / EventCreationForm (unchanged)
└── right panel: HouseholdGuestList
                 ├── HouseholdCard (× N)
                 │   └── member rows with [reassign ▾] action
                 ├── UnassignedSection
                 │   └── person rows with [assign ▾] action
                 └── PersonCreationForm (add guest)
```

### Decision: Reassign uses inline HouseholdPicker dropdown, not a modal

Each member row has a small "reassign" button that opens an inline `HouseholdPicker` dropdown in place. No modal or navigation required. On selection, `HouseholdGuestList` performs the `RemoveHouseholdMember` + `AddHouseholdMember` (or `CreateHousehold` + `AddHouseholdMember`) sequence, then re-fetches.

**Alternative considered:** Full-page or modal reassign flow. Rejected as over-engineered for the number of members typically involved.

### Decision: `invite__invitees.household_id` made nullable; synced by store layer

`invite__invitees.household_id` is currently `NOT NULL`, which means `AddInvitee` errors if the person has no household. The person-first flow requires inviting a person before they belong to any household.

**Fix:** a migration drops the NOT NULL constraint. `AddInvitee` sets `household_id = NULL` when the person has no household membership. The store layer keeps `invitees.household_id` in sync automatically:
- `AddHouseholdMember` → also runs `UPDATE invite__invitees SET household_id = $household WHERE person_id = $person`
- `RemoveHouseholdMember` → also runs `UPDATE invite__invitees SET household_id = NULL WHERE person_id = $person AND household_id = $household`

This preserves the RSVP-status join (`ListInviteesWithStatus` uses `invitees.household_id` to match RSVPs) without adding a separate sync RPC.

### Decision: Grouping via enhanced `ListInvitees`; no new list-households RPC

`ListHouseholds` is RSVP-anchored and unsuitable for pre-RSVP grouping. Rather than adding a new RPC, `ListInviteesWithStatus` is enhanced to LEFT JOIN `households` and return `household_name` alongside each invitee. `InviteeWithStatus` proto gets an optional `Household household` field.

The frontend groups the returned list by `invitee.household_id` client-side:
- Entries with a non-null `household_id` → grouped under their `HouseholdCard`
- Entries with null `household_id` → `UnassignedSection`

One RPC call, no set-difference logic needed.

### Decision: `RemoveHouseholdMemberRequest` carries both IDs (no membership ID)

The proto does not have a standalone membership ID. The natural key is `(household_id, person_id)`, so the request uses those two fields. This is consistent with `AddHouseholdMemberRequest`.

## Risks / Trade-offs

- **`invitees.household_id` synced by side-effect in store layer** → `AddHouseholdMember` and `RemoveHouseholdMember` issue additional UPDATE statements; if those fail silently, the denorm drifts. Mitigation: wrap both in a transaction so the membership change and the invitee sync are atomic.
- **Reassign is two sequential mutations** → if `AddHouseholdMember` fails after `RemoveHouseholdMember` succeeds, the person ends up in neither household. Mitigation: re-fetch on any error to show true server state and surface an error message.
- **No optimistic UI** → guest list re-fetches after every mutation; acceptable for low-frequency host interactions.
- **`ListInvitees` now returns household data** → slightly larger payload, but eliminates a second RPC call and simplifies the frontend.

## Open Questions

- Should `AddHouseholdMember` be idempotent (no-op if already a member) or return `AlreadyExists`? Current behavior is unknown; the reassign flow should be resilient either way.
