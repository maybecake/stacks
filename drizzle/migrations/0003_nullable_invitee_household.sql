-- Migration 3: allow invitees to exist without a household (person-first invite flow)
ALTER TABLE "invite__invitees" ALTER COLUMN "household_id" DROP NOT NULL;
