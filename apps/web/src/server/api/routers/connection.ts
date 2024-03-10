import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const liProfile = z.object({
  entityUrn: z.string(),
  firstName: z.string(),
  headline: z.string(),
  lastName: z.string(),
  memorialized: z.boolean(),
  // undefined tells prisma not to update the field
  profilePicture: z.optional(z.string()),
  publicIdentifier: z.string(),
  connectedAt: z.number(),
});

export const connectionRouter = createTRPCRouter({
  createMany: protectedProcedure
    .input(z.array(liProfile))
    .mutation(({ ctx, input }) => {
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
            // need to check if the new profilePicture, undefined tells prisma not to update the field
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
      const data = await ctx.db.connection.findMany({
        where: { createdById: ctx.session.user.id },
        // include the count
        orderBy: { connectedAt: "desc" },
        take: limit,
        skip: start,
      }); // query still works
      console.log(data);

      return {
        data,
        count: data.length,
      };
    }),
});
