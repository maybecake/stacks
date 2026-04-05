import { GreetingStats, GreetingStore, GreetingTypeStat, NameFrequency } from "../../domain/greeting";

export class MockGreetingStore implements GreetingStore {
  async recordGreeting(_type: string, _name: string): Promise<void> {
    // No-op mock — no persistence until the Postgres adapter is wired
  }

  async getStats(): Promise<GreetingStats[]> {
    return [];
  }

  async getNameFrequencies(): Promise<NameFrequency[]> {
    return [];
  }

  async listGreetingTypeStats(
    _limit: number,
    _cursor: string,
  ): Promise<{ items: GreetingTypeStat[]; nextCursor: string }> {
    return { items: [], nextCursor: "" };
  }

  async listGreetedNames(
    _limit: number,
    _cursor: string,
  ): Promise<{ items: NameFrequency[]; nextCursor: string }> {
    return { items: [], nextCursor: "" };
  }
}
