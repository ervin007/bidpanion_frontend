/**
 * Thin client for Ervin's AI pipeline.
 *
 * Configure with env var `AI_PIPELINE_URL` (and optionally `AI_PIPELINE_TOKEN`).
 * When unset, calls fail fast so the UI displays the job as FAILED with a
 * clear error code (`UPSTREAM_UNAVAILABLE`) instead of returning dummy data.
 *
 * Endpoints expected on the upstream:
 *   POST   {AI_PIPELINE_URL}/analyze-tender   → { jobId, status, ... }
 *   GET    {AI_PIPELINE_URL}/jobs/:id          → { jobId, status, progress?, result?, error? }
 *   POST   {AI_PIPELINE_URL}/score-fit         → { fitScore, recommendation, categories[] }
 *
 * Upstream calls our callback when work completes:
 *   POST   {APP_URL}/api/ai/jobs/:id/callback  → see route handler for the schema
 */

import type { AnalysisJobStatus } from "@/generated/prisma";
import type { TenderSummary } from "@/data/tender-summary-schema";

export interface StartAnalysisArgs {
  jobId: string;
  workspaceId: string;
  tenderId?: string;
  language: "EN" | "DE";
  profile: "tight" | "standard" | "rich";
  documentIds: string[];
}

export interface RemoteJobStatus {
  jobId: string;
  status: AnalysisJobStatus;
  progress?: number;
  result?: TenderSummary;
  error?: { code: string; message: string };
}

function baseUrl(): string {
  const url = process.env.AI_PIPELINE_URL;
  if (!url) {
    throw new Error(
      "AI_PIPELINE_URL is not configured. Set it to Ervin's pipeline base URL.",
    );
  }
  return url.replace(/\/$/, "");
}

function authHeaders(): Record<string, string> {
  const token = process.env.AI_PIPELINE_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function startTenderAnalysis(args: StartAnalysisArgs): Promise<void> {
  const res = await fetch(`${baseUrl()}/analyze-tender`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    throw new Error(`Upstream ${res.status}: ${await res.text()}`);
  }
}

export async function fetchJobStatus(jobId: string): Promise<RemoteJobStatus | null> {
  const res = await fetch(`${baseUrl()}/jobs/${encodeURIComponent(jobId)}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Upstream ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as RemoteJobStatus;
}
