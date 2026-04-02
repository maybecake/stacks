import { ConnectRouter } from "@connectrpc/connect";
import { createNodeHttpHandler } from "@connectrpc/connect-node";
import { create } from "@bufbuild/protobuf";
import type { IncomingMessage, ServerResponse } from "http";
// These imports resolve after `buf generate` runs at build time
import { HelloService, HelloResponseSchema } from "../frontend/src/gen/hello_pb.js";

function routes(router: ConnectRouter) {
  router.service(HelloService, {
    sayHello(req) {
      return create(HelloResponseSchema, { message: `Hello, ${req.name}!` });
    },
  });
}

const handler = createNodeHttpHandler({
  routes,
});

export default function (req: IncomingMessage, res: ServerResponse) {
  return handler(req, res);
}
