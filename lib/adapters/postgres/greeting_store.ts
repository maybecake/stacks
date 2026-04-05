import { desc, sql } from "drizzle-orm";
import { getDb } from "../../db/client";
import { greetingLog, greetingStats } from "../../db/schema";
import { GreetingStats, GreetingStore, NameFrequency } from "../../domain/greeting";

export class PostgresGreetingStore implements GreetingStore {
  async recordGreeting(type: string, name: string): Promise<void> {
    try {
      const db = getDb();
      await db.insert(greetingLog).values({ greetingType: type, name });
      await db
        .insert(greetingStats)
        .values({ greetingType: type, count: 1 })
        .onConflictDoUpdate({
          target: greetingStats.greetingType,
          set: { count: sql`${greetingStats.count} + 1` },
        });
    } catch (err) {
      console.warn("greeting-store: recordGreeting failed", err);
    }
  }

  async getStats(): Promise<GreetingStats[]> {
    const db = getDb();
    const rows = await db.select().from(greetingStats);
    return rows.map((r) => ({ greetingType: r.greetingType, count: r.count }));
  }

  async getNameFrequencies(): Promise<NameFrequency[]> {
    const db = getDb();
    const rows = await db
      .select({
        name: greetingLog.name,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(greetingLog)
      .groupBy(greetingLog.name)
      .orderBy(desc(sql`count(*)`));
    return rows.map((r) => ({ name: r.name, count: r.count }));
  }
}
