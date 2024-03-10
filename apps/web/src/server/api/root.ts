import { connectionRouter } from "@/server/api/routers/connection";
import { createTRPCRouter } from "@/server/api/trpc";
import { syncRecordRouter } from "./routers/syncRecord";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  connection: connectionRouter,
  syncRecord: syncRecordRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
