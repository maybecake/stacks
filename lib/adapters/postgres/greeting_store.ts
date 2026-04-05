import { desc, sql } from "drizzle-orm";
import { getDb } from "../../db/client";
import { greetingLog, greetingStats } from "../../db/schema";
import { GreetingStats, GreetingStore, GreetingTypeStat, NameFrequency } from "../../domain/greeting";
import { decodeCursor, encodeCursor } from "../../pagination/cursor";

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

  async listGreetingTypeStats(
    limit: number,
    cursor: string,
  ): Promise<{ items: GreetingTypeStat[]; nextCursor: string }> {
    const offset = decodeCursor(cursor);
    const all = await this.getStats();
    const page = all.slice(offset, offset + limit);
    const nextCursor = offset + page.length < all.length ? encodeCursor(offset + page.length) : "";
    return { items: page.map((r) => ({ greetingType: r.greetingType, count: r.count })), nextCursor };
  }

  async listGreetedNames(
    limit: number,
    cursor: string,
  ): Promise<{ items: NameFrequency[]; nextCursor: string }> {
    const offset = decodeCursor(cursor);
    const all = await this.getNameFrequencies();
    const page = all.slice(offset, offset + limit);
    const nextCursor = offset + page.length < all.length ? encodeCursor(offset + page.length) : "";
    return { items: page, nextCursor };
  }
}
