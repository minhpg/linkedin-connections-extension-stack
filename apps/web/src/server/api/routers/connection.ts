import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userProfileValidation = z.object({
  entityUrn: z.string(),
  firstName: z.string(),
  headline: z.string(),
  lastName: z.string(),
  memorialized: z.boolean(),
  profilePicture: z.string().nullable().optional(),
  publicIdentifier: z.string(),
});

export const userConnectionValidation = z.object({
  entityUrn: z.string().optional().nullable(),
  from: userProfileValidation,
  to: userProfileValidation,
  connectedAt: z.number().optional(),
});

export const connectionRouter = createTRPCRouter({
  upsertUserProfile: protectedProcedure
    .input(userProfileValidation)
    .mutation(({ ctx, input }) => {
      return ctx.db.linkedInUser.upsert({
        where: {
          entityUrn: input.entityUrn,
        },
        update: {
          ...input,
        },
        create: {
          ...input,
        },
      });
    }),

  upsertSelfProfile: protectedProcedure
    .input(userProfileValidation)
    .mutation(({ ctx, input }) => {
      return ctx.db.linkedInUser.upsert({
        where: {
          entityUrn: input.entityUrn,
        },
        update: {
          ...input,
          userId: ctx.session.user.id,
        },
        create: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  upsertUserConnections: protectedProcedure
    .input(z.array(userConnectionValidation))
    .mutation(({ ctx, input: connections }) => {
      return Promise.all(
        connections.map((input) => {
          /** Two-way connection */
          return ctx.db.$transaction([
            ctx.db.linkedInConnection.upsert({
              where: {
                fromId_toId: {
                  fromId: input.from.entityUrn,
                  toId: input.to.entityUrn,
                },
              },
              update: {
                entityUrn: input.entityUrn,
              },
              create: {
                entityUrn: input.entityUrn,
                fromId: input.from.entityUrn,
                toId: input.to.entityUrn,
                connectedAt: input.connectedAt,
              },
            }),
            ctx.db.linkedInConnection.upsert({
              where: {
                fromId_toId: {
                  fromId: input.to.entityUrn,
                  toId: input.from.entityUrn,
                },
              },
              update: {
                entityUrn: input.entityUrn,
              },
              create: {
                entityUrn: input.entityUrn,
                fromId: input.to.entityUrn,
                toId: input.from.entityUrn,
                connectedAt: input.connectedAt,
              },
            }),
          ]);
        }),
      );
    }),

  upsertUserProfiles: protectedProcedure
    .input(z.array(userProfileValidation))
    .mutation(({ ctx, input: users }) => {
      return Promise.all(
        users.map((input) => {
          return ctx.db.linkedInUser.upsert({
            where: {
              entityUrn: input.entityUrn,
            },
            update: input,
            create: input,
          });
        }),
      );
    }),

  getUserProfile: protectedProcedure
    .input(
      z.object({
        publicIdentifier: z.string().optional(),
        entityUrn: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input: { publicIdentifier, entityUrn } }) => {
      if (publicIdentifier)
        return await ctx.db.linkedInUser.findFirst({
          where: {
            publicIdentifier,
          },
        });

      if (entityUrn)
        return await ctx.db.linkedInUser.findFirst({
          where: {
            entityUrn,
          },
        });
    }),

  getSelfProfile: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.linkedInUser.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

  getSelfConnectionCount: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.linkedInConnection.count({
      where: {
        from: {
          userId: ctx.session.user.id,
        },
      },
    });
  }),

  getUserConnectionCount: protectedProcedure
    .input(
      z.object({
        publicIdentifier: z.string().optional(),
        entityUrn: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input: { publicIdentifier, entityUrn } }) => {
      if (publicIdentifier)
        return await ctx.db.linkedInConnection.count({
          where: {
            from: {
              publicIdentifier,
            },
          },
        });

      if (entityUrn)
        return await ctx.db.linkedInConnection.count({
          where: {
            from: {
              entityUrn,
            },
          },
        });
    }),

  getConnectionsPagination: protectedProcedure
    .input(
      z.object({
        start: z.number(),
        limit: z.number(),
      }),
    )
    .query(async ({ ctx, input: { start, limit } }) => {
      const data = await ctx.db.linkedInConnection.findMany({
        select: {
          entityUrn: true,
          from: true,
          to: true,
          connectedAt: true,
          updatedAt: true,
        },
        where: {
          from: {
            user: {
              id: ctx.session.user.id,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: start,
      });

      const count = await ctx.db.linkedInConnection.count({
        where: {
          from: {
            user: {
              id: ctx.session.user.id,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return { data, count };
    }),

  getConnectionsPaginationWithIdentifier: protectedProcedure
    .input(
      z.object({
        start: z.number(),
        limit: z.number(),
        publicIdentifier: z.string().optional(),
        entityUrn: z.string().optional(),
      }),
    )
    .query(
      async ({ ctx, input: { start, limit, entityUrn, publicIdentifier } }) => {
        const data = await ctx.db.linkedInConnection.findMany({
          select: {
            entityUrn: true,
            from: true,
            to: true,
            connectedAt: true,
            updatedAt: true,
          },
          where: {
            from: {
              OR: [{ publicIdentifier }, { entityUrn }],
            },
          },
          orderBy: { updatedAt: "desc" },
          take: limit,
          skip: start,
        });

        const count = await ctx.db.linkedInConnection.count({
          where: {
            from: {
              OR: [{ publicIdentifier }, { entityUrn }],
            },
          },
          orderBy: { updatedAt: "desc" },
        });

        return { data, count };
      },
    ),

  fullTextSearch: protectedProcedure
    .input(z.string())
    .query(({ ctx, input: search }) => {
      console.log(search)
      return ctx.db.linkedInUser.findMany({
        where: {
          OR: [
            {
              firstName: {
                search
              },
            },
            {
              lastName: {
                search
              },
            },
            {
              headline: {
                search
              },
            },
            {
              AND: [
                { firstName: { search: search.split("|")[0] } },
                { lastName: { search: search.split("|")[1] } },
                {
                  headline: {
                    search
                  },
                },
              ],
            },
          ],
        },
        orderBy: {
          _relevance: {
            fields: ["firstName", "lastName", "headline"],
            search, //`${input}`,
            sort: "desc",
          },
        },
        take: 5,
      });
    }),
});
