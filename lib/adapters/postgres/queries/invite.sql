-- ── Events ────────────────────────────────────────────────────────────────────

-- name: InsertEvent :one
INSERT INTO invite__events (host_user_id, name, venue, description, datetime, capacity, allow_siblings, require_parent_stay)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetEventByPublicToken :one
SELECT * FROM invite__events WHERE public_token = $1 LIMIT 1;

-- name: GetEventByID :one
SELECT * FROM invite__events WHERE id = $1 LIMIT 1;

-- ── Persons ───────────────────────────────────────────────────────────────────

-- name: InsertPerson :one
INSERT INTO persons (name, type, phone, email)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetPersonByID :one
SELECT * FROM persons WHERE id = $1 LIMIT 1;

-- name: ListPersonsForOwner :many
SELECT DISTINCT p.*
FROM persons p
JOIN household_members hm ON hm.person_id = p.id
JOIN user_households uh ON uh.household_id = hm.household_id
WHERE uh.user_id = $1
ORDER BY p.name;

-- name: ListPersonsForHost :many
SELECT DISTINCT p.*
FROM persons p
JOIN invite__invitees ii ON ii.person_id = p.id
JOIN invite__events e ON e.id = ii.event_id
WHERE e.host_user_id = $1
ORDER BY p.name;

-- name: ListPersonsForEvent :many
SELECT DISTINCT p.*
FROM persons p
JOIN invite__invitees ii ON ii.person_id = p.id
JOIN invite__events e ON e.id = ii.event_id
WHERE e.public_token = $1
ORDER BY p.name;

-- name: PersonIsAccessibleToOwner :one
SELECT COUNT(*) > 0 AS accessible
FROM household_members hm
JOIN user_households uh ON uh.household_id = hm.household_id
WHERE hm.person_id = $1 AND uh.user_id = $2;

-- name: PersonIsAccessibleToHost :one
SELECT COUNT(*) > 0 AS accessible
FROM invite__invitees ii
JOIN invite__events e ON e.id = ii.event_id
WHERE ii.person_id = $1 AND e.host_user_id = $2;

-- name: PersonIsAccessibleViaEvent :one
SELECT COUNT(*) > 0 AS accessible
FROM invite__invitees ii
JOIN invite__events e ON e.id = ii.event_id
WHERE ii.person_id = $1 AND e.public_token = $2;

-- ── Households ────────────────────────────────────────────────────────────────

-- name: InsertHousehold :one
INSERT INTO households (name)
VALUES ($1)
RETURNING *;

-- name: GetHouseholdByID :one
SELECT * FROM households WHERE id = $1 LIMIT 1;

-- name: InsertHouseholdMember :one
INSERT INTO household_members (household_id, person_id, role)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetHouseholdChildMembers :many
SELECT * FROM household_members WHERE household_id = $1 AND role = 'child';

-- name: GetHouseholdOwner :one
SELECT user_id FROM user_households WHERE household_id = $1 LIMIT 1;

-- ── Invitees ──────────────────────────────────────────────────────────────────

-- name: InsertInvitee :one
INSERT INTO invite__invitees (event_id, person_id, household_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetInviteeByID :one
SELECT * FROM invite__invitees WHERE id = $1 LIMIT 1;

-- name: DeleteInvitee :exec
DELETE FROM invite__invitees WHERE id = $1;

-- name: ListInviteesWithStatus :many
SELECT
    ii.id           AS invitee_id,
    ii.event_id,
    ii.person_id,
    ii.household_id,
    p.name          AS person_name,
    p.type          AS person_type,
    p.phone         AS person_phone,
    p.email         AS person_email,
    COALESCE(r.status, '')  AS rsvp_status
FROM invite__invitees ii
JOIN persons p ON p.id = ii.person_id
LEFT JOIN invite__rsvps r ON r.event_id = ii.event_id AND r.household_id = ii.household_id
WHERE ii.event_id = $1
ORDER BY p.name;

-- name: InviteeHouseholdHasConfirmedRSVP :one
SELECT COUNT(*) > 0 AS has_rsvp
FROM invite__rsvps r
JOIN invite__invitees ii ON ii.event_id = r.event_id AND ii.household_id = r.household_id
WHERE ii.id = $1 AND r.status = 'confirmed';

-- ── RSVPs ─────────────────────────────────────────────────────────────────────

-- name: InsertRSVP :one
INSERT INTO invite__rsvps (event_id, household_id, status, emergency_contact_name, emergency_contact_phone)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: InsertRSVPAttendee :exec
INSERT INTO invite__rsvp_attendees (rsvp_id, person_id)
VALUES ($1, $2);

-- name: ConfirmedAttendeeCount :one
SELECT COALESCE(SUM(ac.cnt), 0)::int AS total
FROM (
    SELECT COUNT(*) AS cnt
    FROM invite__rsvp_attendees ra
    JOIN invite__rsvps r ON r.id = ra.rsvp_id
    WHERE r.event_id = $1 AND r.status = 'confirmed'
    GROUP BY r.id
) ac;

-- name: ListHouseholdGroups :many
SELECT
    h.id                        AS household_id,
    h.name                      AS household_name,
    r.id                        AS rsvp_id,
    r.status                    AS rsvp_status,
    r.emergency_contact_name,
    r.emergency_contact_phone,
    r.created_at                AS rsvp_created_at,
    p.id                        AS person_id,
    p.name                      AS person_name,
    p.type                      AS person_type,
    p.phone                     AS person_phone,
    p.email                     AS person_email
FROM invite__rsvps r
JOIN households h ON h.id = r.household_id
JOIN invite__rsvp_attendees ra ON ra.rsvp_id = r.id
JOIN persons p ON p.id = ra.person_id
WHERE r.event_id = $1 AND r.status = 'confirmed'
ORDER BY h.name, p.name;

-- ── Claims ────────────────────────────────────────────────────────────────────

-- name: InsertHouseholdClaim :one
INSERT INTO household_claims (household_id, event_id, claim_token)
VALUES ($1, $2, gen_random_uuid())
RETURNING *;

-- name: GetHouseholdClaimByToken :one
SELECT * FROM household_claims WHERE claim_token = $1 LIMIT 1;

-- name: MarkClaimClaimed :exec
UPDATE household_claims SET claimed_at = now() WHERE claim_token = $1;

-- name: InsertUserHousehold :exec
INSERT INTO user_households (user_id, household_id) VALUES ($1, $2)
ON CONFLICT DO NOTHING;
