import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { createTRPCRouter, workspaceProcedure } from "@/server/api/trpc";
import { WorkspaceRole } from "@/generated/prisma";

const cuid = z.string().min(1);

function requireAdmin(role: WorkspaceRole) {
  if (role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
}

export const teamRouter = createTRPCRouter({
  listMembers: workspaceProcedure.query(({ ctx }) => {
    return ctx.db.workspaceMember.findMany({
      where: { workspaceId: ctx.workspace.id },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  }),

  listInvitations: workspaceProcedure.query(({ ctx }) => {
    return ctx.db.workspaceInvitation.findMany({
      where: { workspaceId: ctx.workspace.id, acceptedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }),

  invite: workspaceProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.nativeEnum(WorkspaceRole).default("ANALYST"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.member.role);
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });
      if (existingUser) {
        const existingMember = await ctx.db.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: ctx.workspace.id,
              userId: existingUser.id,
            },
          },
        });
        if (existingMember) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User is already a member",
          });
        }
        return ctx.db.workspaceMember.create({
          data: {
            workspaceId: ctx.workspace.id,
            userId: existingUser.id,
            role: input.role,
            status: "PENDING",
          },
        });
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
      return ctx.db.workspaceInvitation.upsert({
        where: {
          workspaceId_email: {
            workspaceId: ctx.workspace.id,
            email: input.email.toLowerCase(),
          },
        },
        create: {
          workspaceId: ctx.workspace.id,
          email: input.email.toLowerCase(),
          role: input.role,
          invitedById: ctx.session.user.id,
          token,
          expiresAt,
        },
        update: {
          role: input.role,
          token,
          expiresAt,
          acceptedAt: null,
        },
      });
    }),

  cancelInvite: workspaceProcedure
    .input(z.object({ id: cuid }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.member.role);
      const invite = await ctx.db.workspaceInvitation.findFirst({
        where: { id: input.id, workspaceId: ctx.workspace.id },
      });
      if (!invite) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.workspaceInvitation.delete({ where: { id: input.id } });
      return { ok: true };
    }),

  updateMemberRole: workspaceProcedure
    .input(
      z.object({
        id: cuid,
        role: z.nativeEnum(WorkspaceRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.member.role);
      const member = await ctx.db.workspaceMember.findFirst({
        where: { id: input.id, workspaceId: ctx.workspace.id },
      });
      if (!member) throw new TRPCError({ code: "NOT_FOUND" });
      if (member.userId === ctx.workspace.ownerId && input.role !== "ADMIN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot demote workspace owner",
        });
      }
      return ctx.db.workspaceMember.update({
        where: { id: input.id },
        data: { role: input.role },
      });
    }),

  removeMember: workspaceProcedure
    .input(z.object({ id: cuid }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.member.role);
      const member = await ctx.db.workspaceMember.findFirst({
        where: { id: input.id, workspaceId: ctx.workspace.id },
      });
      if (!member) throw new TRPCError({ code: "NOT_FOUND" });
      if (member.userId === ctx.workspace.ownerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove workspace owner",
        });
      }
      await ctx.db.workspaceMember.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
