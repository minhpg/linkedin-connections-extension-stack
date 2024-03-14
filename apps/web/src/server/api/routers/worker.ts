import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userConnectionValidation, userProfileValidation } from "./connection";

export const workerRouter = createTRPCRouter({
  upsertUserConnections: protectedProcedure
    .input(z.array(userConnectionValidation))
    .mutation(({ ctx, input: connections }) => {

    }),

  upsertUserProfiles: protectedProcedure
    .input(z.array(userProfileValidation))
    .mutation(({ ctx, input: users }) => {

    }),
});
