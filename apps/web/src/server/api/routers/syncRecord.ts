import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const syncRecordRouter = createTRPCRouter({

  create: protectedProcedure
    .input(
      z.object({
        syncStart: z.number(),
        syncEnd: z.number(),
        syncErrorMessage: z.string().nullable(),
        startCount: z.number(),
        endCount: z.number(),
        syncSuccess: z.boolean()
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.syncRecord.create({
        data: {
          ...input,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.syncRecord.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id }, syncSuccess: true },
    });
  }),

  getWithParams: protectedProcedure
    .input(
      z.object({
        start: z.number(),
        limit: z.number(),
      }),
    )
    .query(async ({ ctx, input: { start, limit } }) => {

      const query = {
        select: false,
        orderBy: { syncEnd: "desc" },
        where: { createdById: ctx.session.user.id },
      };

      //@ts-expect-error
      const count = await ctx.db.syncRecord.count(query); // query still works

      //@ts-expect-error
      const data = await ctx.db.syncRecord.findMany({
        ...query,
        take: limit,
        skip: start,
      }); // query still works

      return {
        data,
        count,
      };
    }),
});
