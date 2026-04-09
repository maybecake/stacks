import { ConnectError, Code, ConnectRouter } from "@connectrpc/connect";
import { connectNodeAdapter } from "@connectrpc/connect-node";
import { create } from "@bufbuild/protobuf";
import { createRemoteJWKSet, jwtVerify } from "jose";
// These imports resolve after `buf generate` runs at build time
import { HelloService, HelloResponseSchema } from "./.gen/hello_pb.js";
import { greetHello } from "../lib/domain/greeting";
import { PostgresGreetingStore } from "../lib/adapters/postgres/greeting_store";

const store = new PostgresGreetingStore();

function jwksURLFromPublishableKey(key: string): string {
  const stripped = key.replace(/^pk_(test|live)_/, "");
  const domain = Buffer.from(stripped, "base64").toString("utf-8").replace(/\$$/, "");
  return `https://${domain}/.well-known/jwks.json`;
}

let cachedJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(): ReturnType<typeof createRemoteJWKSet> {
  if (!cachedJWKS) {
    const key = process.env.VITE_CLERK_PUBLISHABLE_KEY;
    if (!key) throw new ConnectError("VITE_CLERK_PUBLISHABLE_KEY not set", Code.Internal);
    cachedJWKS = createRemoteJWKSet(new URL(jwksURLFromPublishableKey(key)));
  }
  return cachedJWKS;
}

async function requireAuth(authHeader: string | null): Promise<void> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ConnectError("missing Authorization header", Code.Unauthenticated);
  }
  try {
    await jwtVerify(authHeader.slice(7), getJWKS(), { algorithms: ["RS256"] });
  } catch (err) {
    if (err instanceof ConnectError) throw err;
    throw new ConnectError("invalid token", Code.Unauthenticated);
  }
}

function routes(router: ConnectRouter) {
  router.service(HelloService, {
    async sayHello(req) {
      await requireAuth(req.header.get("Authorization"));
      const message = await greetHello(req.name, store);
      return create(HelloResponseSchema, { message });
    },
  });
}

export default connectNodeAdapter({ routes });
