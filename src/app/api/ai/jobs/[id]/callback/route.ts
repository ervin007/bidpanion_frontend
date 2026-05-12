/**
 * Webhook called by Ervin's AI pipeline when a tender analysis job completes
 * (or fails, or reaches a new progress stage).
 *
 * Contract:
 *   POST /api/ai/jobs/:id/callback
 *     Authorization: Bearer ${AI_PIPELINE_CALLBACK_TOKEN}
 *
 *   Body schema (`AnalysisCallbackPayload`):
 *     status      "queued" | "parsing" | "chunking" | "summarizing" | "completed" | "failed"
 *     progress    number?        // 0..100, per-stage
 *     result      TenderSummary? // present on status === "completed"
 *     error       { code, message }? // present on status === "failed"
 *     enrichTender {              // optional metadata extracted by the pipeline
 *       title?, authority?, deadline?, country?, value?, cpvCode?, noticeType?,
 *       sourceUrl?, description?
 *     }?
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import {
  AnalysisJobStatus,
  TenderProcessingStatus,
} from "@/generated/prisma";

export const runtime = "nodejs";

const statusMap: Record<string, AnalysisJobStatus> = {
  queued: "QUEUED",
  parsing: "PARSING",
  chunking: "CHUNKING",
  summarizing: "SUMMARIZING",
  completed: "COMPLETED",
  failed: "FAILED",
};

const callbackSchema = z.object({
  status: z.enum([
    "queued",
    "parsing",
    "chunking",
    "summarizing",
    "completed",
    "failed",
  ]),
  progress: z.number().int().min(0).max(100).optional(),
  result: z.record(z.unknown()).optional(),
  error: z.object({ code: z.string(), message: z.string() }).optional(),
  enrichTender: z
    .object({
      title: z.string().optional(),
      authority: z.string().optional(),
      deadline: z.string().datetime().optional().nullable(),
      country: z.string().optional(),
      value: z.string().optional(),
      cpvCode: z.string().optional(),
      noticeType: z.string().optional(),
      sourceUrl: z.string().url().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const expected = process.env.AI_PIPELINE_CALLBACK_TOKEN;
  if (expected) {
    const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (got !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const json = await req.json().catch(() => null);
  const parsed = callbackSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { status, progress, result, error, enrichTender } = parsed.data;

  const job = await db.analysisJob.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const nextStatus = statusMap[status];

  await db.$transaction(async (tx) => {
    await tx.analysisJob.update({
      where: { id },
      data: {
        status: nextStatus,
        progress: progress ?? job.progress,
        errorCode: error?.code ?? null,
        errorMessage: error?.message ?? null,
      },
    });

    if (job.tenderId) {
      const tenderProcessing: TenderProcessingStatus =
        status === "completed"
          ? "COMPLETED"
          : status === "failed"
          ? "FAILED"
          : "PROCESSING";

      await tx.tender.update({
        where: { id: job.tenderId },
        data: {
          processingStatus: tenderProcessing,
          ...(enrichTender
            ? {
                title: enrichTender.title ?? undefined,
                authority: enrichTender.authority ?? undefined,
                deadline: enrichTender.deadline
                  ? new Date(enrichTender.deadline)
                  : undefined,
                country: enrichTender.country ?? undefined,
                value: enrichTender.value ?? undefined,
                cpvCode: enrichTender.cpvCode ?? undefined,
                noticeType: enrichTender.noticeType ?? undefined,
                sourceUrl: enrichTender.sourceUrl ?? undefined,
                description: enrichTender.description ?? undefined,
              }
            : {}),
        },
      });

      if (status === "completed" && result) {
        await tx.tenderSummary.upsert({
          where: { tenderId: job.tenderId },
          create: {
            tenderId: job.tenderId,
            payload: result,
            language: job.language,
            profile: job.profile,
          },
          update: {
            payload: result,
            language: job.language,
            profile: job.profile,
          },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
