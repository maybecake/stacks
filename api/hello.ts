import { ConnectRouter } from "@connectrpc/connect";
import { createNodeHttpHandler } from "@connectrpc/connect-node";
import type { IncomingMessage, ServerResponse } from "http";
// These imports resolve after `buf generate` runs at build time
import { HelloService } from "../frontend/src/gen/hello_connect.js";
import { HelloResponse } from "../frontend/src/gen/hello_pb.js";

function routes(router: ConnectRouter) {
  router.service(HelloService, {
    sayHello(req) {
      return new HelloResponse({ message: `Hello, ${req.name}!` });
    },
  });
}

const handler = createNodeHttpHandler({
  routes,
});

export default function (req: IncomingMessage, res: ServerResponse) {
  return handler(req, res);
}
