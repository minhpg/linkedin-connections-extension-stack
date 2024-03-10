import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import SuperJSON from "superjson";
import { getAuthToken } from "../state/actions";
import { AppRouter } from "@linkedin-connections/app/src/server/api/root";

const clientConfig = {
  transformer: SuperJSON,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    httpBatchLink({
      url: `http://localhost:3000/api/trpc`,
      headers() {
        const token = getAuthToken();
        if (!token) return {};
        return {
          authorization: token,
        };
      },
    }),
  ],
};

export const client = createTRPCProxyClient<AppRouter>(clientConfig);
