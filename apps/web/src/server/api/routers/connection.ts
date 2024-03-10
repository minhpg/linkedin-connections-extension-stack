import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const liProfile = z.object({
  entityUrn: z.string(),
  firstName: z.string(),
  headline: z.string(),
  lastName: z.string(),
  memorialized: z.boolean(),
  profilePicture: z.string(),
  publicIdentifier: z.string(),
  connectedAt: z.number(),
});
export const connectionRouter = createTRPCRouter({
  createMany: protectedProcedure
    .input(z.array(liProfile))
    .mutation(({ ctx, input }) => {
      console.log(ctx.session);
      return ctx.db.connection.createMany({
        data: input.map((item) => ({
          ...item,
          createdById: ctx.session.user.id,
        })),
      });
    }),

  create: protectedProcedure.input(liProfile).mutation(({ ctx, input }) => {
    const li = input;
    return ctx.db.connection.create({
      data: {
        ...input,
        createdBy: { connect: { id: ctx.session.user.id } },
      },
    });
  }),

  upsert: protectedProcedure.input(liProfile).mutation(({ ctx, input }) => {
    return ctx.db.connection.upsert({
      where: {
        entityUrn: input.entityUrn,
      },
      update: input,
      create: {
        ...input,
        createdBy: { connect: { id: ctx.session.user.id } },
      },
    });
  }),

  upsertMany: protectedProcedure
    .input(z.array(liProfile))
    .mutation(({ ctx, input: inputs }) => {
      return Promise.all(
        inputs.map((input) => {
          return ctx.db.connection.upsert({
            where: {
              entityUrn: input.entityUrn,
            },
            update: input,
            create: {
              ...input,
              createdBy: { connect: { id: ctx.session.user.id } },
            },
          });
        }),
      );
    }),

  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.connection.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
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
        orderBy: { connectedAt: "desc" },
        where: { createdById: ctx.session.user.id },
      };

      //@ts-expect-error -
      const count = await ctx.db.connection.count(query); // query still works

      //@ts-expect-error
      const data = await ctx.db.connection.findMany({
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
