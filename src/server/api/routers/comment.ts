import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, workspaceProcedure } from "@/server/api/trpc";

const cuid = z.string().min(1);

export const commentRouter = createTRPCRouter({
  listByTender: workspaceProcedure
    .input(z.object({ tenderId: cuid }))
    .query(async ({ ctx, input }) => {
      const tender = await ctx.db.tender.findFirst({
        where: { id: input.tenderId, workspaceId: ctx.workspace.id },
        select: { id: true },
      });
      if (!tender) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.tenderComment.findMany({
        where: { tenderId: input.tenderId },
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      });
    }),

  create: workspaceProcedure
    .input(
      z.object({
        tenderId: cuid,
        content: z.string().min(1).max(4000),
        mentions: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tender = await ctx.db.tender.findFirst({
        where: { id: input.tenderId, workspaceId: ctx.workspace.id },
        select: { id: true },
      });
      if (!tender) throw new TRPCError({ code: "NOT_FOUND" });
      const comment = await ctx.db.tenderComment.create({
        data: {
          tenderId: input.tenderId,
          authorId: ctx.session.user.id,
          content: input.content,
          mentions: input.mentions,
        },
        include: { author: { select: { id: true, name: true } } },
      });
      await ctx.db.activityEntry.create({
        data: {
          tenderId: input.tenderId,
          type: "COMMENT",
          actorId: ctx.session.user.id,
          description: "Added a comment",
        },
      });
      return comment;
    }),

  delete: workspaceProcedure
    .input(z.object({ id: cuid }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.tenderComment.findFirst({
        where: { id: input.id, tender: { workspaceId: ctx.workspace.id } },
      });
      if (!comment) throw new TRPCError({ code: "NOT_FOUND" });
      if (comment.authorId !== ctx.session.user.id && ctx.member.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.tenderComment.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
