import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import SuperJSON from "superjson";
import { getAuthToken } from "../state/actions";
import { AppRouter } from "@linkedin-connections/app/src/server/api/root";

function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (import.meta.env.VERCEL_URL) return `https://${import.meta.env.VERCEL_URL}`;
  return `http://localhost:${import.meta.env.PORT ?? 3000}`;
}
const clientConfig = {
  transformer: SuperJSON,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
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
