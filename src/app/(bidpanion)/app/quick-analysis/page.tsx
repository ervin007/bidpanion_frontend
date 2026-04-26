"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Wand2,
  Trash2,
} from "lucide-react";
import { TenderSummaryView } from "@/components/bidpanion/TenderSummaryView";
import { useAllTenders } from "@/data/session-tenders";
import { pickRandomSample, type QuickAnalysisSample } from "@/data/quick-analysis-samples";
import type { TenderAnalysisJobStatus } from "@/data/tender-summary-schema";
import type { Tender } from "@/data/bidpanion";

type Stage = TenderAnalysisJobStatus;

const STAGE_ORDER: Stage[] = ["queued", "parsing", "chunking", "summarizing", "completed"];
const STAGE_LABEL: Record<Stage, string> = {
  queued: "Queued",
  parsing: "Parsing documents",
  chunking: "Chunking long sections",
  summarizing: "Generating structured summary",
  completed: "Completed",
  failed: "Failed",
};
const STAGE_DURATION_MS: Record<Stage, number> = {
  queued: 600,
  parsing: 1200,
  chunking: 1100,
  summarizing: 1500,
  completed: 0,
  failed: 0,
};

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function inferCountry(authority: string): string {
  if (/österreich|austria|wien|niederösterreich|salzburg|graz|steiermark/i.test(authority)) return "AT";
  if (/schweiz|switzerland|swiss|zürich|bern/i.test(authority)) return "CH";
  return "DE";
}

function tenderFromSample(sample: QuickAnalysisSample): Tender {
  const id = `qa-${sample.slug}-${Date.now().toString(36)}`;
  const summary = sample.summary;
  const titleSource = summary["Project Description"] ?? summary["Contracting Authority"];
  const title = titleSource.split(/\n|\.|—|-/)[0]!.trim().slice(0, 120);
  return {
    id,
    title: title || `Quick Analysis ${sample.slug}`,
    authority: summary["Contracting Authority"].split(",")[0]!.trim(),
    source: "DTVP",
    deadline: null,
    status: "New",
    processingStatus: "Completed",
    owner: "You (Quick Analysis)",
    uploadDate: new Date().toISOString(),
    fitScore: null,
    recommendation: null,
    country: inferCountry(summary["Contracting Authority"]),
    description: summary["Project Description"].slice(0, 280),
    boardColumn: "Backlog",
    tasksCompleted: 0,
    tasksTotal: 0,
    watching: true,
  };
}

export default function QuickAnalysisPage() {
  const { addSessionTender, sessionTenders, removeFromBoard } = useAllTenders();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [stage, setStage] = useState<Stage | null>(null);
  const [stageStartedAt, setStageStartedAt] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<QuickAnalysisSample | null>(null);
  const [createdTender, setCreatedTender] = useState<Tender | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [language, setLanguage] = useState<"EN" | "DE">("EN");
  const [profile, setProfile] = useState<"tight" | "standard" | "rich">("standard");
  const inputRef = useRef<HTMLInputElement>(null);

  const isRunning = stage !== null && stage !== "completed" && stage !== "failed";
  const isDone = stage === "completed" && result !== null;

  const recentSessionTenders = useMemo(
    () => sessionTenders.slice(0, 5),
    [sessionTenders],
  );

  // Drive the mock async pipeline.
  useEffect(() => {
    if (!stage || stage === "completed" || stage === "failed") return;
    const duration = STAGE_DURATION_MS[stage];
    setProgress(0);
    setStageStartedAt(Date.now());

    const tickId = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(99, p + 100 / (duration / 100));
        return next;
      });
    }, 100);

    const advanceId = setTimeout(() => {
      const idx = STAGE_ORDER.indexOf(stage);
      const nextStage = STAGE_ORDER[idx + 1];
      if (nextStage === "completed") {
        const sample = pickRandomSample();
        const tender = tenderFromSample(sample);
        setResult(sample);
        setCreatedTender(tender);
        addSessionTender(tender, sample.summary);
        setStage("completed");
        setProgress(100);
      } else if (nextStage) {
        setStage(nextStage);
      }
    }, duration);

    return () => {
      clearInterval(tickId);
      clearTimeout(advanceId);
    };
  }, [stage, addSessionTender]);

  function handleFiles(picked: FileList | File[]) {
    const arr = Array.from(picked);
    setFiles(
      arr.map((f) => ({ id: `${f.name}-${f.size}-${f.lastModified ?? 0}`, name: f.name, size: f.size })),
    );
  }

  function handleAnalyze() {
    setResult(null);
    setCreatedTender(null);
    setProgress(0);
    setStage("queued");
  }

  function handleReset() {
    setStage(null);
    setProgress(0);
    setResult(null);
    setCreatedTender(null);
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleUseSample() {
    setFiles([
      {
        id: "demo-zip",
        name: "tender-bundle-demo.zip",
        size: 5_483_916,
      },
    ]);
  }

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
            Upload a tender ZIP (or individual PDF/DOCX files) and get a structured one-pager
            summary in under a minute. The result is automatically added to your Dashboard and
            Board so you can decide bid / no-bid quickly.
          </p>
        </div>
        {(files.length > 0 || stage) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            New analysis
          </button>
        )}
      </header>

      {/* Upload zone (hidden once we have a result) */}
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
                ZIP, PDF or DOCX — up to ~200 MB. Multiple files supported.
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
            <button
              type="button"
              onClick={handleUseSample}
              className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Wand2 size={12} /> Use sample
            </button>
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
                    <span className="text-xs text-slate-500 font-mono">{formatBytes(f.size)}</span>
                    <button
                      onClick={() =>
                        setFiles((prev) => prev.filter((p) => p.id !== f.id))
                      }
                      disabled={isRunning}
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
                  disabled={isRunning}
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
                  onChange={(e) => setProfile(e.target.value as typeof profile)}
                  disabled={isRunning}
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
              disabled={files.length === 0 || isRunning}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {isRunning ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Analyze tender
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Progress */}
      {stage && stage !== "completed" && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 font-semibold">Processing</h2>
            <span className="text-xs text-slate-500 font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-100"
              style={{
                width: `${
                  ((STAGE_ORDER.indexOf(stage) + progress / 100) /
                    (STAGE_ORDER.length - 1)) *
                  100
                }%`,
              }}
            />
          </div>
          <ol className="space-y-2">
            {STAGE_ORDER.filter((s) => s !== "completed").map((s) => {
              const idx = STAGE_ORDER.indexOf(s);
              const currentIdx = STAGE_ORDER.indexOf(stage);
              const isDoneStep = idx < currentIdx;
              const isCurrent = idx === currentIdx;
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
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="animate-spin text-blue-500 flex-shrink-0" />
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

      {/* Result */}
      {isDone && result && createdTender && (
        <>
          <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-emerald-900 font-semibold text-sm mb-1">
                Summary generated
              </h2>
              <p className="text-emerald-800 text-sm">
                Added to your Dashboard and Board (column <strong>Backlog</strong>) as{" "}
                <Link
                  href="/app"
                  className="underline underline-offset-2 hover:text-emerald-900"
                >
                  {createdTender.title}
                </Link>
                .
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Link
                  href="/app/board"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-50"
                >
                  Open Board <ArrowRight size={12} />
                </Link>
                <Link
                  href="/app"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-50"
                >
                  Open Dashboard <ArrowRight size={12} />
                </Link>
                <button
                  onClick={() => removeFromBoard(createdTender.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  <Trash2 size={12} /> Remove from board
                </button>
              </div>
            </div>
          </section>
          <TenderSummaryView summary={result.summary} />
        </>
      )}

      {/* Recent */}
      {!stage && recentSessionTenders.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-slate-900 font-semibold text-sm mb-3">
            Recent quick analyses (this session)
          </h2>
          <ul className="divide-y divide-slate-100">
            {recentSessionTenders.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-md bg-violet-50 text-violet-700 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 font-medium truncate">{t.title}</p>
                  <p className="text-xs text-slate-500 truncate">{t.authority}</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(t.uploadDate).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isDone && !stage && files.length === 0 && (
        <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <AlertCircle size={11} />
          This is a mocked pipeline — pick "Use sample" to see the full output flow.
        </p>
      )}
    </div>
  );
}
