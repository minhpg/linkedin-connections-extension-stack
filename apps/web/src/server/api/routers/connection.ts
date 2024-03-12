import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

const userProfile = z.object({
  entityUrn: z.string(),
  firstName: z.string(),
  headline: z.string(),
  lastName: z.string(),
  memorialized: z.boolean(),
  profilePicture: z.string().optional(),
  publicIdentifier: z.string(),
});

const userConnection = z.object({
  entityUrn: z.string().optional(),
  from: userProfile,
  to: userProfile,
  connectedAt: z.number().optional(),
});

export const connectionRouter = createTRPCRouter({
  upsertUserProfile: protectedProcedure
    .input(userProfile)
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
    .input(userProfile)
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
    .input(z.array(userConnection))
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
          ])
        }),
      );
    }),

  upsertUserProfiles: protectedProcedure
    .input(z.array(userProfile))
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
    
  getUserProfile: protectedProcedure.input(z.object({
    publicIdentifier: z.string().optional(),
    entityUrn: z.string().optional()
  })).query(async ({ ctx, input: { 
    publicIdentifier,
    entityUrn
   } }) => {

    if(publicIdentifier) return await ctx.db.linkedInUser.findFirst({
      where: {
        publicIdentifier
      }
    })

    if(entityUrn) return await ctx.db.linkedInUser.findFirst({
      where: {
        entityUrn
      }
    })
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

    getConnectionsPaginationWithUrn: protectedProcedure
    .input(
      z.object({
        start: z.number(),
        limit: z.number(),
        entityUrn: z.string()
      }),
    )
    .query(async ({ ctx, input: { start, limit, entityUrn } }) => {

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
            entityUrn
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: start,
      });


      const count = await ctx.db.linkedInConnection.count({
        where: {
          from: {
            entityUrn
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return { data, count };
    }),

});
