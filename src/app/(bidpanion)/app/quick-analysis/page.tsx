"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Upload,
  File as FileIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  ArrowRight,
} from "lucide-react";
import { TenderSummaryView } from "@/components/bidpanion/TenderSummaryView";
import { api } from "@/trpc/react";
import type { AnalysisJobStatus } from "@/generated/prisma";
import type { TenderSummary } from "@/data/tender-summary-schema";

const STAGE_ORDER: AnalysisJobStatus[] = [
  "QUEUED",
  "PARSING",
  "CHUNKING",
  "SUMMARIZING",
  "COMPLETED",
];
const STAGE_LABEL: Record<AnalysisJobStatus, string> = {
  QUEUED: "Queued",
  PARSING: "Parsing documents",
  CHUNKING: "Chunking long sections",
  SUMMARIZING: "Generating structured summary",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function QuickAnalysisPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [language, setLanguage] = useState<"EN" | "DE">("EN");
  const [profile, setProfile] = useState<"tight" | "standard" | "rich">("standard");
  const [jobId, setJobId] = useState<string | null>(null);
  const [tenderId, setTenderId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const jobQuery = api.ai.getJob.useQuery(
    { id: jobId ?? "" },
    {
      enabled: !!jobId,
      refetchInterval: (q) => {
        const data = q.state.data;
        if (!data) return 1500;
        if (data.status === "COMPLETED" || data.status === "FAILED") return false;
        return 2000;
      },
    },
  );

  const tenderQuery = api.tender.get.useQuery(
    { id: tenderId ?? "" },
    { enabled: !!tenderId && jobQuery.data?.status === "COMPLETED" },
  );

  const recentJobsQuery = api.ai.listRecentJobs.useQuery({ limit: 5 });

  const stage: AnalysisJobStatus | null = jobQuery.data?.status ?? null;
  const isRunning =
    stage !== null && stage !== "COMPLETED" && stage !== "FAILED";
  const isDone = stage === "COMPLETED" && tenderQuery.data;
  const isFailed = stage === "FAILED";

  function handleFiles(picked: FileList | File[]) {
    const arr = Array.from(picked);
    setFiles(
      arr.map((f) => ({
        id: `${f.name}-${f.size}-${f.lastModified ?? 0}`,
        name: f.name,
        size: f.size,
        file: f,
      })),
    );
    setUploadError(null);
  }

  async function handleAnalyze() {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    setJobId(null);
    setTenderId(null);

    try {
      const form = new FormData();
      for (const f of files) form.append("files", f.file);
      form.append("language", language);
      form.append("profile", profile);

      const res = await fetch("/api/ai/analyze-tender", {
        method: "POST",
        body: form,
      });
      const payload = (await res.json()) as {
        jobId?: string;
        tenderId?: string;
        error?: string;
      };
      if (!res.ok) {
        setUploadError(
          payload.error ?? `Upload failed (HTTP ${res.status}). Try again.`,
        );
        if (payload.jobId) setJobId(payload.jobId);
        if (payload.tenderId) setTenderId(payload.tenderId);
        return;
      }
      if (payload.jobId) setJobId(payload.jobId);
      if (payload.tenderId) setTenderId(payload.tenderId);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function handleReset() {
    setFiles([]);
    setJobId(null);
    setTenderId(null);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Refresh recent list when a job finishes.
  useEffect(() => {
    if (stage === "COMPLETED" || stage === "FAILED") {
      recentJobsQuery.refetch();
    }
  }, [stage, recentJobsQuery]);

  const summary =
    (tenderQuery.data?.summary?.payload as TenderSummary | undefined) ?? null;

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-5">
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold">
              <Sparkles size={12} /> AI
            </span>
            <h1 className="text-slate-900 text-2xl font-bold">Quick Analysis</h1>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl">
            Upload a tender ZIP (or individual PDF/DOCX files). The AI pipeline parses,
            chunks, and produces a structured one-pager. The result lands on your
            Dashboard and Board automatically.
          </p>
        </div>
        {(files.length > 0 || jobId) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            New analysis
          </button>
        )}
      </header>

      {!isDone && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
            }}
            className={`relative rounded-xl border-2 border-dashed transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50/40"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
            }`}
          >
            <label className="flex flex-col items-center justify-center px-6 py-10 cursor-pointer text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Upload size={20} className="text-blue-600" />
              </div>
              <p className="text-slate-900 font-semibold text-sm">
                Drop a tender ZIP here, or click to browse
              </p>
              <p className="text-slate-500 text-xs mt-1">
                ZIP, PDF or DOCX — multiple files supported.
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".zip,.pdf,.docx"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Selected files ({files.length})
              </p>
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {files.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50"
                  >
                    <FileIcon size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="flex-1 text-sm text-slate-800 truncate">{f.name}</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {formatBytes(f.size)}
                    </span>
                    <button
                      onClick={() =>
                        setFiles((prev) => prev.filter((p) => p.id !== f.id))
                      }
                      disabled={isRunning || isUploading}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-end justify-between flex-wrap gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Output language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "EN" | "DE")}
                  disabled={isRunning || isUploading}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="EN">English</option>
                  <option value="DE">Deutsch</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Detail profile
                </label>
                <select
                  value={profile}
                  onChange={(e) =>
                    setProfile(e.target.value as typeof profile)
                  }
                  disabled={isRunning || isUploading}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="tight">Tight</option>
                  <option value="standard">Standard</option>
                  <option value="rich">Rich</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={files.length === 0 || isRunning || isUploading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {isUploading || isRunning ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {isUploading ? "Uploading…" : "Analyzing…"}
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Analyze tender
                </>
              )}
            </button>
          </div>

          {uploadError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Upload failed</p>
                <p className="text-red-600 text-xs mt-0.5">{uploadError}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {jobId && stage && stage !== "COMPLETED" && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 font-semibold">Processing</h2>
            {jobQuery.data?.progress !== null && jobQuery.data?.progress !== undefined && (
              <span className="text-xs text-slate-500 font-mono">
                {jobQuery.data.progress}%
              </span>
            )}
          </div>
          <ol className="space-y-2">
            {STAGE_ORDER.filter((s) => s !== "COMPLETED").map((s) => {
              const idx = STAGE_ORDER.indexOf(s);
              const currentIdx = stage ? STAGE_ORDER.indexOf(stage) : -1;
              const isDoneStep = currentIdx > idx;
              const isCurrent = currentIdx === idx;
              return (
                <li
                  key={s}
                  className={`flex items-center gap-3 text-sm ${
                    isCurrent
                      ? "text-slate-900 font-medium"
                      : isDoneStep
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                >
                  {isDoneStep ? (
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 flex-shrink-0"
                    />
                  ) : isCurrent ? (
                    <Loader2
                      size={16}
                      className="animate-spin text-blue-500 flex-shrink-0"
                    />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
                  )}
                  {STAGE_LABEL[s]}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {isFailed && (
        <section className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h2 className="text-red-900 font-semibold text-sm mb-1">
              Analysis failed
            </h2>
            <p className="text-red-700 text-sm">
              {jobQuery.data?.errorMessage ?? "The AI pipeline could not process this upload."}
            </p>
            {jobQuery.data?.errorCode && (
              <p className="text-red-600 text-xs mt-1 font-mono">
                Code: {jobQuery.data.errorCode}
              </p>
            )}
          </div>
        </section>
      )}

      {isDone && tenderQuery.data && (
        <>
          <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-emerald-900 font-semibold text-sm mb-1">
                Summary generated
              </h2>
              <p className="text-emerald-800 text-sm">
                Added to your pipeline as{" "}
                <Link
                  href={`/app/tenders/${tenderQuery.data.id}`}
                  className="underline underline-offset-2 hover:text-emerald-900"
                >
                  {tenderQuery.data.title}
                </Link>
                .
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Link
                  href={`/app/tenders/${tenderQuery.data.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-50"
                >
                  Open tender <ArrowRight size={12} />
                </Link>
                <Link
                  href="/app/board"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-50"
                >
                  Open Board <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </section>
          {summary && <TenderSummaryView summary={summary} />}
        </>
      )}

      {!isDone && !jobId && (recentJobsQuery.data?.length ?? 0) > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-slate-900 font-semibold text-sm mb-3">
            Recent analyses
          </h2>
          <ul className="divide-y divide-slate-100">
            {recentJobsQuery.data?.map((j) => (
              <li key={j.id} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-md bg-violet-50 text-violet-700 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 font-medium truncate">
                    {j.tender?.title ?? "Untitled"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {STAGE_LABEL[j.status]} ·{" "}
                    {new Date(j.createdAt).toLocaleString()}
                  </p>
                </div>
                {j.tenderId && (
                  <Link
                    href={`/app/tenders/${j.tenderId}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
