import { PostgresGreetingStore } from "../lib/adapters/postgres/greeting_store";

const store = new PostgresGreetingStore();

export default async function handler(_req: Request): Promise<Response> {
  const [stats, names] = await Promise.all([store.getStats(), store.getNameFrequencies()]);
  return Response.json({ stats, names });
}
