import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, workspaceProcedure } from "@/server/api/trpc";
import { ChecklistStatus } from "@/generated/prisma";

const cuid = z.string().min(1);

type Db = typeof import("@/server/db").db;

async function tenderInWorkspace(
  db: Db,
  tenderId: string,
  workspaceId: string,
) {
  const t = await db.tender.findFirst({
    where: { id: tenderId, workspaceId },
    select: { id: true },
  });
  if (!t) throw new TRPCError({ code: "NOT_FOUND" });
  return t;
}

export const checklistRouter = createTRPCRouter({
  listByTender: workspaceProcedure
    .input(z.object({ tenderId: cuid }))
    .query(async ({ ctx, input }) => {
      await tenderInWorkspace(ctx.db, input.tenderId, ctx.workspace.id);
      return ctx.db.checklistItem.findMany({
        where: { tenderId: input.tenderId },
        orderBy: { order: "asc" },
        include: { reviewer: { select: { id: true, name: true } } },
      });
    }),

  create: workspaceProcedure
    .input(
      z.object({
        tenderId: cuid,
        section: z.string().min(1),
        label: z.string().min(1),
        reference: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await tenderInWorkspace(ctx.db, input.tenderId, ctx.workspace.id);
      const count = await ctx.db.checklistItem.count({
        where: { tenderId: input.tenderId },
      });
      return ctx.db.checklistItem.create({
        data: { ...input, order: count },
      });
    }),

  setStatus: workspaceProcedure
    .input(
      z.object({
        id: cuid,
        status: z.nativeEnum(ChecklistStatus),
        documentId: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.checklistItem.findFirst({
        where: { id: input.id, tender: { workspaceId: ctx.workspace.id } },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.checklistItem.update({
        where: { id: input.id },
        data: {
          status: input.status,
          documentId: input.documentId ?? item.documentId,
          reviewerId:
            input.status === "VERIFIED" ? ctx.session.user.id : item.reviewerId,
        },
      });
    }),

  delete: workspaceProcedure
    .input(z.object({ id: cuid }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.checklistItem.findFirst({
        where: { id: input.id, tender: { workspaceId: ctx.workspace.id } },
        select: { id: true },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.checklistItem.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
