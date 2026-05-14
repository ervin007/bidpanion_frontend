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
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [tenderId, setTenderId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [finalSummary, setFinalSummary] = useState<TenderSummary | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const saveResult = api.tender.saveQuickAnalysisResult.useMutation();
  const utils = api.useUtils();

  const recentJobsQuery = api.ai.listRecentJobs.useQuery({ limit: 5 });

  const isRunning = status === "RUNNING";
  const isDone = status === "COMPLETED" && finalSummary !== null;
  const isFailed = status === "FAILED" || status === "TERMINATED";

  function handleFiles(picked: FileList | File[]) {
    const file = picked[0];
    if (!file) return;
    setFiles([{
      id: `${file.name}-${file.size}-${file.lastModified ?? 0}`,
      name: file.name,
      size: file.size,
      file: file,
    }]);
    setUploadError(null);
  }

  async function handleAnalyze() {
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    setWorkflowId(null);
    setFilename(null);
    setStatus(null);
    setFinalSummary(null);

    try {
      const form = new FormData();
      form.append("files", files[0].file);

      const res = await fetch("/api/ai/analyze-tender", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        setUploadError(`Upload failed (HTTP ${res.status}). Try again.`);
        return;
      }
      const payload = await res.json() as { workflow_id?: string; filename?: string; tenderId?: string; error?: string };
      if (payload.workflow_id && payload.filename && payload.tenderId) {
        setWorkflowId(payload.workflow_id);
        setFilename(payload.filename);
        setTenderId(payload.tenderId);
        setStatus("RUNNING");
        // Invalidate list so the newly created Tender shows up as processing in the sidebar/dashboard immediately
        void utils.ai.listRecentJobs.invalidate();
      } else {
        setUploadError("Invalid response from server.");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function handleReset() {
    setFiles([]);
    setWorkflowId(null);
    setFilename(null);
    setStatus(null);
    setFinalSummary(null);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  useEffect(() => {
    if (!workflowId || status === "COMPLETED" || status === "FAILED" || status === "TERMINATED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://svakd9lmph7uly1dhcg06t4w.49.12.245.219.sslip.io/api/status/${workflowId}`);
        if (res.ok) {
          const data = await res.json() as { status: string };
          setStatus(data.status);
          
          if (data.status === "COMPLETED" && filename) {
            const resultsRes = await fetch(`http://svakd9lmph7uly1dhcg06t4w.49.12.245.219.sslip.io/api/results/${filename}`);
            if (resultsRes.ok) {
              const summaryData = await resultsRes.json() as TenderSummary;
              setFinalSummary(summaryData);
              
              // Fallback save to database in case webhook didn't reach us (e.g. localhost)
              if (tenderId) {
                saveResult.mutate({ 
                  tenderId, 
                  payload: summaryData 
                }, {
                  onSuccess: () => {
                    void utils.ai.listRecentJobs.invalidate();
                  }
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [workflowId, status, filename]);

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
            Upload a tender text file. The AI pipeline parses
            the document and produces a structured one-pager summary.
          </p>
        </div>
        {(files.length > 0 || workflowId) && (
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
                Drop a tender TXT here, or click to browse
              </p>
              <p className="text-slate-500 text-xs mt-1">
                TXT only — single file supported.
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".txt"
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
                      onClick={() => setFiles([])}
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

          <div className="flex items-end justify-end pt-2 border-t border-slate-100">
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

      {workflowId && isRunning && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 font-semibold">Processing</h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-900 font-medium">
             <Loader2 size={16} className="animate-spin text-blue-500 flex-shrink-0" />
             Extracting tender details via Temporal workflow...
          </div>
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
              The AI pipeline could not process this upload. Status: {status}
            </p>
          </div>
        </section>
      )}

      {isDone && finalSummary && (
        <>
          <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-emerald-900 font-semibold text-sm mb-1">
                Summary generated
              </h2>
              <p className="text-emerald-800 text-sm">
                Successfully processed <strong>{filename}</strong>.
              </p>
            </div>
          </section>
          <TenderSummaryView summary={finalSummary} />
        </>
      )}

      {!isDone && !workflowId && (recentJobsQuery.data?.length ?? 0) > 0 && (
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
