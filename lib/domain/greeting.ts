export interface GreetingStats {
  greetingType: string;
  count: number;
}

export interface GreetingTypeStat {
  greetingType: string;
  count: number;
}

export interface NameFrequency {
  name: string;
  count: number;
}

export interface GreetingStore {
  recordGreeting(type: string, name: string): Promise<void>;
  getStats(): Promise<GreetingStats[]>;
  getNameFrequencies(): Promise<NameFrequency[]>;
  listGreetingTypeStats(
    limit: number,
    cursor: string,
  ): Promise<{ items: GreetingTypeStat[]; nextCursor: string }>;
  listGreetedNames(
    limit: number,
    cursor: string,
  ): Promise<{ items: NameFrequency[]; nextCursor: string }>;
}

export async function greetHello(name: string, store: GreetingStore): Promise<string> {
  try {
    await store.recordGreeting("hello", name);
  } catch {
    // Storage errors are non-fatal; greeting is the primary contract
  }
  return `Hello, ${name}!`;
}
