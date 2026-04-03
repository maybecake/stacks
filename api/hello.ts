import { ConnectRouter } from "@connectrpc/connect";
import { connectNodeAdapter } from "@connectrpc/connect-node";
import { create } from "@bufbuild/protobuf";
// These imports resolve after `buf generate` runs at build time
import { HelloService, HelloResponseSchema } from "../frontend/src/gen/hello_pb.js";

function routes(router: ConnectRouter) {
  router.service(HelloService, {
    sayHello(req) {
      return create(HelloResponseSchema, { message: `Hello, ${req.name}!` });
    },
  });
}

export default connectNodeAdapter({ routes });
