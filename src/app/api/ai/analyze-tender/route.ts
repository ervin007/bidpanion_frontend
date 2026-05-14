/**
 * Multipart upload endpoint for kicking off an analysis on a freshly uploaded
 * tender bundle. The frontend POSTs files here; we persist a placeholder
 * Tender + AnalysisJob, then hand the bundle off to the AI pipeline.
 *
 * Contract:
 *   POST /api/ai/analyze-tender  (multipart/form-data)
 *     files[]   one or more File entries (PDF, DOCX or ZIP)
 *     language  "EN" | "DE"      (optional, default "EN")
 *     profile   "tight" | "standard" | "rich"  (optional, default "standard")
 *
 *   Response 202: { jobId: string, tenderId: string }
 *   Response 401 / 4xx / 5xx: { error: string }
 */

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { requireWorkspaceForUser } from "@/server/bidpanion/workspace-setup";
import { startTenderAnalysis } from "@/server/ai/client";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspace } = await requireWorkspaceForUser(session.user.id);

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const language = (form.get("language")?.toString() ?? "EN") as "EN" | "DE";
  const profile = (form.get("profile")?.toString() ?? "standard") as
    | "tight"
    | "standard"
    | "rich";

  const placeholderTitle =
    files[0]?.name.replace(/\.[a-z0-9]+$/i, "") ?? "Untitled tender";

  const tender = await db.tender.create({
    data: {
      workspaceId: workspace.id,
      title: placeholderTitle.slice(0, 200),
      authority: "Pending analysis",
      source: "MANUAL",
      processingStatus: "PROCESSING",
      status: "NEW",
      boardColumn: "BACKLOG",
      ownerId: session.user.id,
      documents: {
        create: files.map((f, i) => ({
          name: f.name,
          sizeBytes: f.size,
          isPrimary: i === 0,
          status: "UPLOADED",
          uploadedById: session.user.id,
        })),
      },
    },
    include: { documents: true },
  });

  const job = await db.analysisJob.create({
    data: {
      workspaceId: workspace.id,
      tenderId: tender.id,
      language,
      profile,
      status: "QUEUED",
    },
  });

  try {
    // Determine the absolute URL for the webhook callback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${baseUrl}/api/ai/jobs/${job.id}/callback`;

    // Prepare form data for the Python backend
    const pythonForm = new FormData();
    pythonForm.append("file", files[0]);
    pythonForm.append("callback_url", callbackUrl);

    // Proxy the upload to the Temporal backend
    const res = await fetch("http://svakd9lmph7uly1dhcg06t4w.49.12.245.219.sslip.io/api/process", {
      method: "POST",
      body: pythonForm,
    });

    if (!res.ok) {
      throw new Error(`Python API responded with ${res.status}`);
    }

    const payload = (await res.json()) as { workflow_id?: string; filename?: string };

    if (!payload.workflow_id || !payload.filename) {
      throw new Error("Invalid response from Python API (missing workflow_id or filename)");
    }

    return NextResponse.json(
      { 
        jobId: job.id, 
        tenderId: tender.id,
        workflow_id: payload.workflow_id,
        filename: payload.filename 
      },
      { status: 202 },
    );
  } catch (err) {
    await db.analysisJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        errorCode: "UPSTREAM_UNAVAILABLE",
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      },
    });
    await db.tender.update({
      where: { id: tender.id },
      data: { processingStatus: "FAILED" },
    });
    return NextResponse.json(
      {
        error: "AI pipeline is not reachable. " + (err instanceof Error ? err.message : ""),
        jobId: job.id,
        tenderId: tender.id,
      },
      { status: 502 },
    );
  }
}
