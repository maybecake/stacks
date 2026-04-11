-- Migration 1: core identity tables (persons, households, membership, claims)

CREATE TABLE "persons" (
    "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name"       text NOT NULL,
    "type"       text NOT NULL CHECK (type IN ('child', 'adult')),
    "phone"      text,
    "email"      text,
    "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "households" (
    "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name"       text,
    "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "household_members" (
    "household_id" uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    "person_id"    uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    "role"         text NOT NULL CHECK (role IN ('child', 'guardian')),
    PRIMARY KEY ("household_id", "person_id")
);

-- populated only once a user authenticates and claims their household
CREATE TABLE "user_households" (
    "user_id"      text NOT NULL,
    "household_id" uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    PRIMARY KEY ("user_id", "household_id")
);

-- one row per RSVP submission for unclaimed households
CREATE TABLE "household_claims" (
    "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "household_id" uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    "event_id"     uuid NOT NULL,  -- FK to invite__events added in migration 2
    "claim_token"  uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    "claimed_at"   timestamptz,
    "created_at"   timestamptz DEFAULT now() NOT NULL
);
