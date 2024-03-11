import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

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
  entityUrn: z.string(),
  between: z.array(userProfile),
  connectedAt: z.number(),
});

const connectionUpsertInput = z.object({
  users: z.array(userProfile),
  connections: z.array(userConnection),
});

export const connectionRouter = createTRPCRouter({
  upsertUserProfile: protectedProcedure
    .input(userProfile)
    .mutation(({ ctx, input }) => {
      console.log(input);
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
      console.log(connections);
      return ctx.db.$transaction(
        connections.map((input) => {
          return ctx.db.linkedInConnection.upsert({
            where: {
              entityUrn: input.entityUrn,
            },
            update: {
              entityUrn: input.entityUrn,
            },
            create: {
              entityUrn: input.entityUrn,
              between: {
                connect: input.between.map((user) => {
                  return { entityUrn: user.entityUrn };
                }),
              },
              connectedAt: input.connectedAt,
              createdBy: { connect: { id: ctx.session.user.id } },
            },
          });
        }),
      );
    }),

  upsertUserProfiles: protectedProcedure
    .input(z.array(userProfile))
    .mutation(({ ctx, input: users }) => {
      return ctx.db.$transaction(
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

  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.linkedInConnection.findFirst({
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
      const connections = await ctx.db.linkedInConnection.findMany({
        select: {
          between: true,
          entityUrn: true,
          connectedAt: true,
          updatedAt: true,
        },
        where: {
          createdById: ctx.session.user.id,
          between: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
        orderBy: { connectedAt: "desc" },
        take: limit,
        skip: start,
      });

      function notEmpty<TValue>(
        value: TValue | null | undefined,
      ): value is TValue {
        return value !== null && value !== undefined;
      }

      const data = connections
        .map((connection) => {
          const connectedWith = connection.between.filter(
            (user) => user.userId !== ctx.session.user.id,
          )[0];

          if (!connectedWith) return;
          return {
            ...connection,
            connectedWith,
          };
        })
        .filter(notEmpty);

      const count = await ctx.db.linkedInConnection.count({
        where: { createdById: ctx.session.user.id },
        orderBy: { connectedAt: "desc" },
      });

      return { data, count };
    }),
});
