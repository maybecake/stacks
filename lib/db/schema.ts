import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const greetingStats = pgTable("greeting_stats", {
  greetingType: text("greeting_type").primaryKey(),
  count: integer("count").default(0).notNull(),
});

export const greetingLog = pgTable("greeting_log", {
  id: serial("id").primaryKey(),
  greetingType: text("greeting_type").notNull(),
  name: text("name").notNull(),
  greetedAt: timestamp("greeted_at", { withTimezone: true }).defaultNow().notNull(),
});
