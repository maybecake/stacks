-- Migration 2: invitation system tables

CREATE TABLE "invite__events" (
    "id"                  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "public_token"        uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    "host_user_id"        text NOT NULL,
    "name"                text NOT NULL,
    "venue"               text NOT NULL,
    "description"         text,
    "datetime"            timestamptz NOT NULL,
    "capacity"            integer NOT NULL,
    "allow_siblings"      boolean NOT NULL DEFAULT false,
    "require_parent_stay" boolean NOT NULL DEFAULT false,
    "created_at"          timestamptz DEFAULT now() NOT NULL
);

-- now that invite__events exists, add the FK on household_claims
ALTER TABLE "household_claims"
    ADD CONSTRAINT "household_claims_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "invite__events"("id") ON DELETE CASCADE;

CREATE TABLE "invite__invitees" (
    "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "event_id"     uuid NOT NULL REFERENCES invite__events(id) ON DELETE CASCADE,
    "person_id"    uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    "household_id" uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    "created_at"   timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "invite__rsvps" (
    "id"                      uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "event_id"                uuid NOT NULL REFERENCES invite__events(id) ON DELETE CASCADE,
    "household_id"            uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    "status"                  text NOT NULL CHECK (status IN ('confirmed', 'declined')),
    "emergency_contact_name"  text NOT NULL,
    "emergency_contact_phone" text NOT NULL,
    "created_at"              timestamptz DEFAULT now() NOT NULL,
    UNIQUE ("event_id", "household_id")
);

CREATE TABLE "invite__rsvp_attendees" (
    "rsvp_id"   uuid NOT NULL REFERENCES invite__rsvps(id) ON DELETE CASCADE,
    "person_id" uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    PRIMARY KEY ("rsvp_id", "person_id")
);
