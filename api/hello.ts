import { ConnectRouter } from "@connectrpc/connect";
import { connectNodeAdapter } from "@connectrpc/connect-node";
import { create } from "@bufbuild/protobuf";
import { HelloService, HelloResponseSchema } from "./.gen/hello_pb.js";
import { greetHello } from "../lib/domain/greeting";
import { PostgresGreetingStore } from "../lib/adapters/postgres/greeting_store";

const store = new PostgresGreetingStore();

function routes(router: ConnectRouter) {
  router.service(HelloService, {
    async sayHello(req) {
      const message = await greetHello(req.name, store);
      return create(HelloResponseSchema, { message });
    },
  });
}

export default connectNodeAdapter({ routes });
