CREATE TABLE "greeting_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"greeting_type" text NOT NULL,
	"name" text NOT NULL,
	"greeted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "greeting_stats" (
	"greeting_type" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO "greeting_stats" ("greeting_type", "count") VALUES
  ('hello', 0),
  ('yo', 0),
  ('sup', 0)
ON CONFLICT DO NOTHING;
