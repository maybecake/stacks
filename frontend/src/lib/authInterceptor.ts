import type { Interceptor } from "@connectrpc/connect";

export function makeAuthInterceptor(getToken: () => Promise<string | null>): Interceptor {
  return (next) => async (req) => {
    const token = await getToken();
    if (token) {
      req.header.set("Authorization", `Bearer ${token}`);
    }
    return next(req);
  };
}
