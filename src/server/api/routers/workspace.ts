import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, workspaceProcedure } from "@/server/api/trpc";

export const workspaceRouter = createTRPCRouter({
  current: workspaceProcedure.query(async ({ ctx }) => {
    const memberCount = await ctx.db.workspaceMember.count({
      where: { workspaceId: ctx.workspace.id },
    });
    return {
      id: ctx.workspace.id,
      name: ctx.workspace.name,
      role: ctx.member.role,
      memberCount,
    };
  }),

  rename: workspaceProcedure
    .input(z.object({ name: z.string().min(1).max(80) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.member.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.workspace.update({
        where: { id: ctx.workspace.id },
        data: { name: input.name },
      });
      return { ok: true };
    }),
});
