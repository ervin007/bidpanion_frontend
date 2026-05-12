import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, workspaceProcedure } from "@/server/api/trpc";
import {
  BoardColumn,
  Recommendation,
  TenderSource,
  TenderStatus,
} from "@/generated/prisma";

const cuid = z.string().min(1);

const tenderStatusSchema = z.nativeEnum(TenderStatus);
const boardColumnSchema = z.nativeEnum(BoardColumn);
const tenderSourceSchema = z.nativeEnum(TenderSource);
const recommendationSchema = z.nativeEnum(Recommendation);

type Db = typeof import("@/server/db").db;

async function assertTenderInWorkspace(
  db: Db,
  tenderId: string,
  workspaceId: string,
) {
  const tender = await db.tender.findFirst({
    where: { id: tenderId, workspaceId },
  });
  if (!tender) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Tender not found" });
  }
  return tender;
}

export const tenderRouter = createTRPCRouter({
  list: workspaceProcedure
    .input(
      z
        .object({
          includeDeleted: z.boolean().default(false),
          search: z.string().optional(),
        })
        .default({ includeDeleted: false }),
    )
    .query(async ({ ctx, input }) => {
      const tenders = await ctx.db.tender.findMany({
        where: {
          workspaceId: ctx.workspace.id,
          ...(input.includeDeleted ? {} : { deletedAt: null }),
          ...(input.search
            ? {
                OR: [
                  { title: { contains: input.search, mode: "insensitive" as const } },
                  { authority: { contains: input.search, mode: "insensitive" as const } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          owner: { select: { id: true, name: true } },
          _count: { select: { tasks: true } },
        },
      });
      const taskCompletion = await ctx.db.tenderTask.groupBy({
        by: ["tenderId", "status"],
        where: { tenderId: { in: tenders.map((t) => t.id) } },
        _count: { _all: true },
      });
      return tenders.map((t) => {
        const completed = taskCompletion
          .filter((x) => x.tenderId === t.id && x.status === "DONE")
          .reduce((a, b) => a + b._count._all, 0);
        return {
          ...t,
          tasksCompleted: completed,
          tasksTotal: t._count.tasks,
        };
      });
    }),

  trash: workspaceProcedure.query(({ ctx }) => {
    return ctx.db.tender.findMany({
      where: { workspaceId: ctx.workspace.id, deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  }),

  get: workspaceProcedure
    .input(z.object({ id: cuid }))
    .query(async ({ ctx, input }) => {
      const tender = await ctx.db.tender.findFirst({
        where: { id: input.id, workspaceId: ctx.workspace.id },
        include: {
          owner: { select: { id: true, name: true } },
          documents: { orderBy: { createdAt: "asc" } },
          briefSections: {
            orderBy: { order: "asc" },
            include: {
              fields: {
                orderBy: { order: "asc" },
                include: { verifiedBy: { select: { id: true, name: true } } },
              },
            },
          },
          fitCategories: { orderBy: { order: "asc" } },
          tasks: {
            orderBy: { createdAt: "asc" },
            include: {
              assignee: { select: { id: true, name: true } },
              subtasks: { orderBy: { order: "asc" } },
            },
          },
          checklist: {
            orderBy: { order: "asc" },
            include: { reviewer: { select: { id: true, name: true } } },
          },
          comments: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { id: true, name: true } } },
          },
          activity: {
            orderBy: { createdAt: "desc" },
            include: { actor: { select: { id: true, name: true } } },
            take: 50,
          },
          summary: true,
        },
      });
      if (!tender) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return tender;
    }),

  create: workspaceProcedure
    .input(
      z.object({
        title: z.string().min(1),
        authority: z.string().min(1),
        source: tenderSourceSchema.default("MANUAL"),
        country: z.string().default("DE"),
        deadline: z.date().nullish(),
        sourceUrl: z.string().url().nullish(),
        description: z.string().nullish(),
        boardColumn: boardColumnSchema.default("BACKLOG"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tender.create({
        data: {
          ...input,
          workspaceId: ctx.workspace.id,
          ownerId: ctx.session.user.id,
        },
      });
    }),

  update: workspaceProcedure
    .input(
      z.object({
        id: cuid,
        title: z.string().min(1).optional(),
        authority: z.string().min(1).optional(),
        status: tenderStatusSchema.optional(),
        boardColumn: boardColumnSchema.nullish(),
        deadline: z.date().nullish().optional(),
        ownerId: z.string().nullish().optional(),
        fitScore: z.number().int().min(0).max(100).nullish().optional(),
        recommendation: recommendationSchema.nullish().optional(),
        watching: z.boolean().optional(),
        description: z.string().nullish().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const existing = await assertTenderInWorkspace(
        ctx.db,
        id,
        ctx.workspace.id,
      );

      const next = await ctx.db.tender.update({
        where: { id },
        data,
      });

      if (data.status && data.status !== existing.status) {
        await ctx.db.activityEntry.create({
          data: {
            tenderId: id,
            type: "STATUS_CHANGE",
            actorId: ctx.session.user.id,
            description: `Status changed to ${data.status}`,
            metadata: { from: existing.status, to: data.status },
          },
        });
      }

      return next;
    }),

  setBoardColumn: workspaceProcedure
    .input(
      z.object({ id: cuid, boardColumn: boardColumnSchema.nullable() }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertTenderInWorkspace(ctx.db, input.id, ctx.workspace.id);
      return ctx.db.tender.update({
        where: { id: input.id },
        data: { boardColumn: input.boardColumn },
      });
    }),

  softDelete: workspaceProcedure
    .input(z.object({ id: cuid }))
    .mutation(async ({ ctx, input }) => {
      await assertTenderInWorkspace(ctx.db, input.id, ctx.workspace.id);
      return ctx.db.tender.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      });
    }),

  restore: workspaceProcedure
    .input(z.object({ id: cuid }))
    .mutation(async ({ ctx, input }) => {
      await assertTenderInWorkspace(ctx.db, input.id, ctx.workspace.id);
      return ctx.db.tender.update({
        where: { id: input.id },
        data: { deletedAt: null },
      });
    }),

  hardDelete: workspaceProcedure
    .input(z.object({ id: cuid }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.member.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await assertTenderInWorkspace(ctx.db, input.id, ctx.workspace.id);
      await ctx.db.tender.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
