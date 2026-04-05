import { GreetingStore } from "../../domain/greeting";

export class MockGreetingStore implements GreetingStore {
  async recordGreeting(_type: string, _name: string): Promise<void> {
    // No-op mock — no persistence until the Postgres adapter is wired
  }
}
