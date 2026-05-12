import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, workspaceProcedure } from "@/server/api/trpc";
import { startTenderAnalysis, fetchJobStatus } from "@/server/ai/client";

const cuid = z.string().min(1);

export const aiRouter = createTRPCRouter({
  /**
   * Kick off an analysis job. The actual upload happens through `/api/ai/analyze-tender`
   * (it accepts multipart). This procedure exists so the client can also start a job
   * referencing already-uploaded documents on an existing tender.
   */
  startAnalysis: workspaceProcedure
    .input(
      z.object({
        tenderId: cuid.optional(),
        language: z.enum(["EN", "DE"]).default("EN"),
        profile: z.enum(["tight", "standard", "rich"]).default("standard"),
        documentIds: z.array(cuid).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.tenderId) {
        const t = await ctx.db.tender.findFirst({
          where: { id: input.tenderId, workspaceId: ctx.workspace.id },
          select: { id: true },
        });
        if (!t) throw new TRPCError({ code: "NOT_FOUND" });
      }

      const job = await ctx.db.analysisJob.create({
        data: {
          workspaceId: ctx.workspace.id,
          tenderId: input.tenderId,
          language: input.language,
          profile: input.profile,
          status: "QUEUED",
        },
      });

      // Hand off to Ervin's pipeline. The client may return immediately (the job
      // is QUEUED); the worker updates rows through `/api/ai/jobs/:id/callback`.
      try {
        await startTenderAnalysis({
          jobId: job.id,
          workspaceId: ctx.workspace.id,
          tenderId: input.tenderId,
          language: input.language,
          profile: input.profile,
          documentIds: input.documentIds,
        });
      } catch (err) {
        await ctx.db.analysisJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            errorCode: "UPSTREAM_UNAVAILABLE",
            errorMessage: err instanceof Error ? err.message : "Unknown error",
          },
        });
      }

      return job;
    }),

  getJob: workspaceProcedure
    .input(z.object({ id: cuid }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.analysisJob.findFirst({
        where: { id: input.id, workspaceId: ctx.workspace.id },
      });
      if (!job) throw new TRPCError({ code: "NOT_FOUND" });

      // If the worker doesn't push status, pull on demand.
      if (job.status !== "COMPLETED" && job.status !== "FAILED") {
        const remote = await fetchJobStatus(job.id).catch(() => null);
        if (remote) {
          const updated = await ctx.db.analysisJob.update({
            where: { id: job.id },
            data: {
              status: remote.status,
              progress: remote.progress ?? null,
              errorCode: remote.error?.code ?? null,
              errorMessage: remote.error?.message ?? null,
            },
          });
          return updated;
        }
      }
      return job;
    }),

  listRecentJobs: workspaceProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).default({ limit: 10 }))
    .query(({ ctx, input }) => {
      return ctx.db.analysisJob.findMany({
        where: { workspaceId: ctx.workspace.id },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        include: { tender: { select: { id: true, title: true } } },
      });
    }),
});
