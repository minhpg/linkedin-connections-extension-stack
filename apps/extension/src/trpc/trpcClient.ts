import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import SuperJSON from "superjson";
import { getAuthToken } from "../state/actions";
import { type AppRouter } from "@linkedin-connections/app/src/server/api/root";

export function getBaseUrl() {
  if (process.env.NODE_ENV === "development")
    return `http://localhost:${import.meta.env.VITE_PORT ?? 3000}`;

  if (import.meta.env.VITE_VERCEL_URL) {
    return `https://${import.meta.env.VITE_VERCEL_URL}`;
  }
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
