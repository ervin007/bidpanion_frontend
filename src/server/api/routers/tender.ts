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

  saveQuickAnalysisResult: workspaceProcedure
    .input(
      z.object({
        tenderId: z.string(),
        payload: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const p = input.payload as any;
      const title = p?.issuer?.name ? `${p.issuer.name} Tender` : undefined;

      const tender = await ctx.db.tender.update({
        where: { id: input.tenderId },
        data: {
          processingStatus: "COMPLETED",
          ...(title ? { title: title.slice(0, 200) } : {}),
        },
      });

      await ctx.db.tenderSummary.upsert({
        where: { tenderId: input.tenderId },
        create: {
          tenderId: input.tenderId,
          payload: input.payload,
          language: "EN",
          profile: "standard",
        },
        update: {
          payload: input.payload,
        },
      });

      return tender;
    }),

  calculateFitScore: workspaceProcedure
    .input(z.object({ tenderId: cuid }))
    .mutation(async ({ ctx, input }) => {
      const tender = await ctx.db.tender.findFirst({
        where: { id: input.tenderId, workspaceId: ctx.workspace.id },
        include: { summary: true },
      });
      if (!tender) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tender not found" });
      }
      if (!tender.summary) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tender summary has not been generated yet. Please wait for processing to finish.",
        });
      }

      const profile = await ctx.db.companyProfile.findUnique({
        where: { workspaceId: ctx.workspace.id },
        include: { sections: { orderBy: { order: "asc" } } },
      });
      if (!profile || profile.sections.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please set up and save your Company Profile first.",
        });
      }

      // Create an AnalysisJob to track the Temporal workflow progress
      const job = await ctx.db.analysisJob.create({
        data: {
          workspaceId: ctx.workspace.id,
          tenderId: tender.id,
          language: tender.summary.language ?? "DE",
          profile: tender.summary.profile ?? "standard",
          status: "QUEUED",
        },
      });

      // Update tender processingStatus to PROCESSING
      await ctx.db.tender.update({
        where: { id: tender.id },
        data: { processingStatus: "PROCESSING" },
      });

      // Construct dynamic callback URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const callbackUrl = `${appUrl}/api/ai/jobs/${job.id}/callback`;

      const backendUrl = "http://svakd9lmph7uly1dhcg06t4w.49.12.245.219.sslip.io/api/calculate-fit-score";
      try {
        const response = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary_payload: tender.summary.payload,
            company_profile: JSON.stringify(profile),
            callback_url: callbackUrl,
            workflow_id: job.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`Backend API returned HTTP ${response.status}: ${await response.text()}`);
        }

        return { success: true, jobId: job.id };
      } catch (err) {
        // Rollback processing status to completed/failed depending on state
        await ctx.db.tender.update({
          where: { id: tender.id },
          data: { processingStatus: "COMPLETED" },
        });
        await ctx.db.analysisJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            errorCode: "UPSTREAM_UNAVAILABLE",
            errorMessage: err instanceof Error ? err.message : "Failed to start Temporal workflow",
          },
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Failed to trigger fit score calculation in Temporal.",
        });
      }
    }),
});
