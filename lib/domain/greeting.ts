export interface GreetingStore {
  recordGreeting(type: string, name: string): Promise<void>;
}

export async function greetHello(name: string, store: GreetingStore): Promise<string> {
  try {
    await store.recordGreeting("hello", name);
  } catch {
    // Storage errors are non-fatal; greeting is the primary contract
  }
  return `Hello, ${name}!`;
}
