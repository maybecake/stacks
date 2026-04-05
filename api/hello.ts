import { ConnectRouter } from "@connectrpc/connect";
import { connectNodeAdapter } from "@connectrpc/connect-node";
import { create } from "@bufbuild/protobuf";
// These imports resolve after `buf generate` runs at build time
import {
  HelloService,
  HelloResponseSchema,
  ListGreetingTypeStatsResponseSchema,
  ListGreetedNamesResponseSchema,
} from "./.gen/hello_pb.js";
import { greetHello } from "../lib/domain/greeting";
import { PostgresGreetingStore } from "../lib/adapters/postgres/greeting_store";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function clampPageSize(size: number): number {
  if (size <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

const store = new PostgresGreetingStore();

function routes(router: ConnectRouter) {
  router.service(HelloService, {
    async sayHello(req) {
      const message = await greetHello(req.name, store);
      return create(HelloResponseSchema, { message });
    },

    async listGreetingTypeStats(req) {
      const limit = clampPageSize(req.pageSize);
      const { items, nextCursor } = await store.listGreetingTypeStats(limit, req.pageToken);
      return create(ListGreetingTypeStatsResponseSchema, {
        greetingTypes: items.map((it) => ({ greetingType: it.greetingType, count: BigInt(it.count) })),
        nextPageToken: nextCursor,
      });
    },

    async listGreetedNames(req) {
      const limit = clampPageSize(req.pageSize);
      const { items, nextCursor } = await store.listGreetedNames(limit, req.pageToken);
      return create(ListGreetedNamesResponseSchema, {
        names: items.map((it) => ({ name: it.name, count: BigInt(it.count) })),
        nextPageToken: nextCursor,
      });
    },
  });
}

export default connectNodeAdapter({ routes });
