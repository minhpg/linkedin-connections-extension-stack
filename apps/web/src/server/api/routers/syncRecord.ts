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
        syncSuccess: z.boolean(),
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
    .query(({ ctx, input: { start, limit } }) => {

      return ctx.db.$transaction([
        ctx.db.syncRecord.findMany({
          where: { createdById: ctx.session.user.id },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: start,
        }),
        ctx.db.syncRecord.count({
          where: { createdById: ctx.session.user.id },
          orderBy: { createdAt: "desc" },
        })
      ])
    }),
});
