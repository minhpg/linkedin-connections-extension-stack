import { connectionRouter } from "@/server/api/routers/connection";
import { createTRPCRouter } from "@/server/api/trpc";
import { syncRecordRouter } from "./routers/syncRecord";
import { inferRouterOutputs } from "@trpc/server";
import { secondarySyncRecordRouter } from "./routers/secondarySyncRecord";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  connection: connectionRouter,
  syncRecord: syncRecordRouter,
  secondarySyncRecord: secondarySyncRecordRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type ConnectionOut = inferRouterOutputs<AppRouter>["connection"];
export type SyncOut = inferRouterOutputs<AppRouter>["syncRecord"];
