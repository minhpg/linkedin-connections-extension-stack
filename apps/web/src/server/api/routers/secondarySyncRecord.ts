import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userProfileValidation } from "./connection";

export const secondarySyncRecordRouter = createTRPCRouter({
  upsertRecord: protectedProcedure
    .input(
      z.object({
        syncStartPos: z.number(),
        syncTotal: z.number().optional(),
        syncStart: z.number(),
        syncEnd: z.number().optional(),
        syncSuccess: z.boolean(),
        syncInProgress: z.boolean(),
        syncErrorMessage: z.string().nullable(),
        linkedInUser: userProfileValidation,
      }),
    )
    .mutation(
      ({
        ctx,
        input: {
          syncStartPos,
          syncTotal,
          syncStart,
          syncEnd,
          syncSuccess,
          syncInProgress,
          syncErrorMessage,
          linkedInUser,
        },
      }) => {
        return ctx.db.secondarySyncRecord.upsert({
          where: {
            linkedInUserEntityUrn: linkedInUser.entityUrn,
          },
          update: {
            syncStartPos,
            syncTotal,
            syncStart,
            syncEnd,
            syncSuccess,
            syncInProgress,
            syncErrorMessage,
          },
          create: {
            linkedInUserEntityUrn: linkedInUser.entityUrn,
            syncStartPos,
            syncTotal,
            syncStart,
            syncEnd,
            syncSuccess,
            syncInProgress,
            syncErrorMessage,
          },
        });
      },
    ),

  getUnsyncedUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.linkedInUser.findFirst({
      orderBy: { createdAt: "desc" },
      where: {
        from: {
          every: {
            to: {
              user: {
                id: ctx.session.user.id,
              },
            },
          },
        },
        secondarySyncRecords: {
          none: {},
        },
      },
    });
  }),

  getLatestPending: protectedProcedure.query(async ({ ctx }) => {
     const latestPendingRecord = ctx.db.secondarySyncRecord.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        linkedInUser: true,
        syncTotal: true,
        syncStart: true,
        syncStartPos: true
      },
      where: {
        // linkedInUser: {
        //   from: {
        //     every: {
        //       from: {
        //         user: {
        //           id: ctx.session.user.id,
        //         },
        //       },
        //     },
        //   },
        // },
        syncSuccess: false,
        syncInProgress: true,
      },
    });
    console.log(latestPendingRecord)
    return latestPendingRecord
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
        ctx.db.secondarySyncRecord.findMany({
          // where: { createdById: ctx.session.user.id },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: start,
        }),
        ctx.db.secondarySyncRecord.count({
          // where: { createdById: ctx.session.user.id },
          orderBy: { createdAt: "desc" },
        }),
      ]);
    }),
});
