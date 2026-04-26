"use client";

import { useState, useMemo } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Upload, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  AlertTriangle, Clock, CheckCircle2, XCircle, Loader2, MoreHorizontal,
  RefreshCw, FileText, TrendingUp, AlertCircle,
  SlidersHorizontal, CalendarDays, Users2, Eye, FolderOpen
} from "lucide-react";
import { CURRENT_USER } from "@/data/bidpanion";
import { useAllTenders } from "@/data/session-tenders";
import type { TenderStatus, ProcessingStatus } from "@/data/bidpanion";

// ── Helpers ────────────────────────────────────────────────────────────────
function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function DeadlineChip({ deadline }: { deadline: string | null }) {
  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
        <AlertCircle size={10} />Not found
      </span>
    );
  }
  const days = getDaysUntilDeadline(deadline);
  if (days === null) return null;

  if (days < 0) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-400">Expired</span>;
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <AlertTriangle size={10} />{days}d
      </span>
    );
  }
  if (days <= 14) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        <Clock size={10} />{days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
      <CalendarDays size={10} />{days}d
    </span>
  );
}

const STATUS_COLORS: Record<TenderStatus, string> = {
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  New: "bg-blue-100 text-blue-700 border-blue-200",
  "In Review": "bg-amber-100 text-amber-700 border-amber-200",
  Bid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "No-Bid": "bg-red-100 text-red-700 border-red-200",
  Submitted: "bg-violet-100 text-violet-700 border-violet-200",
  Won: "bg-emerald-100 text-emerald-800 border-emerald-300",
  Lost: "bg-slate-100 text-slate-500 border-slate-200",
};

function StatusBadge({ status }: { status: TenderStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}

const PROC_COLORS: Record<ProcessingStatus, string> = {
  Queued: "bg-slate-100 text-slate-500",
  Processing: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Failed: "bg-red-100 text-red-700",
  "Password Protected": "bg-amber-100 text-amber-700",
};

const PROC_ICONS: Record<ProcessingStatus, React.ReactNode> = {
  Queued: <Clock size={10} />,
  Processing: <Loader2 size={10} className="animate-spin" />,
  Completed: <CheckCircle2 size={10} />,
  Failed: <XCircle size={10} />,
  "Password Protected": <AlertTriangle size={10} />,
};

function ProcessingBadge({ status }: { status: ProcessingStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${PROC_COLORS[status]}`}>
      {PROC_ICONS[status]}{status}
    </span>
  );
}

const SOURCE_COLORS: Record<string, string> = {
  TED: "bg-blue-700 text-white",
  DTVP: "bg-slate-700 text-white",
  ANKÖ: "bg-violet-600 text-white",
  SIMAP: "bg-teal-600 text-white",
  Vergabe24: "bg-orange-600 text-white",
  eTendering: "bg-cyan-600 text-white",
};

function SourceBadge({ source }: { source: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wide ${SOURCE_COLORS[source] ?? "bg-slate-200 text-slate-700"}`}>
      {source}
    </span>
  );
}

function FitScoreCell({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-slate-400 text-xs italic">N/A</span>;
  }
  const color = score >= 70 ? "text-emerald-700" : score >= 40 ? "text-amber-600" : "text-red-600";
  const barColor = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-semibold ${color}`}>{score}</span>
    </div>
  );
}

// ── KPI Cards ──────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider truncate">{label}</p>
        <p className="text-slate-900 text-2xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────
function EmptyState() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    router.push("/app/quick-analysis");
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border-2 border-blue-100">
        <FileText size={28} className="text-blue-500" />
      </div>
      <h2 className="text-slate-900 mb-2">No Tenders Yet</h2>
      <p className="text-slate-500 text-sm max-w-sm mb-8">
        Upload your first tender ZIP to extract documents, generate a structured brief, and calculate a fit score recommendation.
      </p>
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 mb-6 disabled:opacity-50"
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {uploading ? "Processing..." : "Upload First Tender ZIP"}
      </button>
    </div>
  );
}

// ── Skeleton Rows ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5,6,7,8,9].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 bg-slate-200 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
type SortKey = "title" | "authority" | "deadline" | "status" | "fitScore" | "uploadDate";
type SortDir = "asc" | "desc";
type ViewMode = "all" | "watching" | "in-progress" | "submitted";

export default function DashboardPage() {
  const router = useRouter();
  const { tenders: ALL_TENDERS } = useAllTenders();
  const [loading, setLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [statusFilter, setStatusFilter] = useState<TenderStatus[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [myTenders, setMyTenders] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "uploadDate", dir: "desc" });
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const PER_PAGE = 10;

  const allStatuses: TenderStatus[] = ["Draft", "New", "In Review", "Bid", "No-Bid", "Submitted", "Won", "Lost"];
  const allSources = [...new Set(ALL_TENDERS.map(t => t.source))];

  const toggleStatus = (s: TenderStatus) =>
    setStatusFilter(f => f.includes(s) ? f.filter(x => x !== s) : [...f, s]);
  const toggleSource = (s: string) =>
    setSourceFilter(f => f.includes(s) ? f.filter(x => x !== s) : [...f, s]);

  const handleUpload = () => {
    router.push("/app/quick-analysis");
  };

  const sorted = useMemo(() => {
    let data = [...ALL_TENDERS];
    
    // Apply view mode filter
    if (viewMode === "watching") {
      data = data.filter(t => t.watching);
    } else if (viewMode === "in-progress") {
      data = data.filter(t => ["New", "In Review", "Bid"].includes(t.status));
    } else if (viewMode === "submitted") {
      data = data.filter(t => ["Submitted", "Won", "Lost"].includes(t.status));
    }
    
    if (search) data = data.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.authority.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter.length) data = data.filter(t => statusFilter.includes(t.status));
    if (sourceFilter.length) data = data.filter(t => sourceFilter.includes(t.source));
    if (myTenders) data = data.filter(t => t.owner === CURRENT_USER.name);

    data.sort((a, b) => {
      let av: string | number = a[sort.key] ?? "";
      let bv: string | number = b[sort.key] ?? "";
      if (sort.key === "fitScore") { av = a.fitScore ?? -1; bv = b.fitScore ?? -1; }
      if (typeof av === "string" && typeof bv === "string") return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sort.dir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return data;
  }, [ALL_TENDERS, search, viewMode, statusFilter, sourceFilter, myTenders, sort]);

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const sortBy = (key: SortKey) => {
    setSort(s => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
    setPage(1);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sort.key !== k) return <span className="text-slate-300 ml-1">↕</span>;
    return sort.dir === "asc" ? <ChevronUp size={12} className="ml-0.5 inline text-blue-600" /> : <ChevronDown size={12} className="ml-0.5 inline text-blue-600" />;
  };

  // KPI stats
  const total = ALL_TENDERS.length;
  const activeBids = ALL_TENDERS.filter(t => ["Bid", "Submitted"].includes(t.status)).length;
  const inReview = ALL_TENDERS.filter(t => t.status === "In Review").length;
  const scored = ALL_TENDERS.filter(t => t.fitScore !== null);
  const avgFit = scored.length ? Math.round(scored.reduce((a, b) => a + (b.fitScore ?? 0), 0) / scored.length) : 0;

  const watchingCount = ALL_TENDERS.filter(t => t.watching).length;
  const inProgressCount = ALL_TENDERS.filter(t => ["New", "In Review", "Bid"].includes(t.status)).length;
  const submittedCount = ALL_TENDERS.filter(t => ["Submitted", "Won", "Lost"].includes(t.status)).length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-slate-900">Tender Pipeline</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Good morning, {CURRENT_USER.name.split(" ")[0]} — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Refresh data"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {/* Demo toggle */}
          <button
            onClick={() => setShowEmpty(!showEmpty)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {showEmpty ? "Show Data" : "Empty State"}
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploading ? "Processing..." : "New Tender"}
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => { setViewMode("all"); setPage(1); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            viewMode === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <FolderOpen size={14} />
            All <span className="ml-1 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{total}</span>
          </span>
        </button>
        <button
          onClick={() => { setViewMode("watching"); setPage(1); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            viewMode === "watching"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <Eye size={14} />
            Watching <span className="ml-1 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{watchingCount}</span>
          </span>
        </button>
        <button
          onClick={() => { setViewMode("in-progress"); setPage(1); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            viewMode === "in-progress"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <Clock size={14} />
            In Progress <span className="ml-1 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{inProgressCount}</span>
          </span>
        </button>
        <button
          onClick={() => { setViewMode("submitted"); setPage(1); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            viewMode === "submitted"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 size={14} />
            Submitted <span className="ml-1 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{submittedCount}</span>
          </span>
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total" value={total} sub="Tenders" icon={<FileText size={20} className="text-blue-600" />} accent="bg-blue-50" />
        <KpiCard label="Active Bids" value={activeBids} sub="Bid + Submitted" icon={<TrendingUp size={20} className="text-emerald-600" />} accent="bg-emerald-50" />
        <KpiCard label="In Review" value={inReview} sub="Pending Decisions" icon={<Clock size={20} className="text-amber-600" />} accent="bg-amber-50" />
        <KpiCard label="Avg Fit Score" value={avgFit} sub="Scored Tenders" icon={<CheckCircle2 size={20} className="text-violet-600" />} accent="bg-violet-50" />
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 p-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search title or authority…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* My tenders toggle */}
          <button
            onClick={() => { setMyTenders(!myTenders); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
              myTenders ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Users2 size={14} />My Tenders
          </button>

          {/* Advanced filter toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
              filterOpen || statusFilter.length || sourceFilter.length
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={14} />Filters
            {(statusFilter.length + sourceFilter.length) > 0 && (
              <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {statusFilter.length + sourceFilter.length}
              </span>
            )}
          </button>

          {/* Clear filters */}
          {(search || statusFilter.length || sourceFilter.length || myTenders) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter([]); setSourceFilter([]); setMyTenders(false); setPage(1); }}
              className="text-slate-400 hover:text-slate-600 text-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Advanced filters panel */}
        {filterOpen && (
          <div className="border-t border-slate-100 p-4 bg-slate-50/50 grid grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {allStatuses.map(s => (
                  <button
                    key={s}
                    onClick={() => { toggleStatus(s); setPage(1); }}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors focus-visible:ring-1 focus-visible:ring-blue-500 ${
                      statusFilter.includes(s)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">Source</p>
              <div className="flex flex-wrap gap-1.5">
                {allSources.map(s => (
                  <button
                    key={s}
                    onClick={() => { toggleSource(s); setPage(1); }}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors focus-visible:ring-1 focus-visible:ring-blue-500 ${
                      sourceFilter.includes(s)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">CPV Code</p>
              <input
                type="text"
                placeholder="e.g. 72000000"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table / Empty */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {showEmpty ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table" aria-label="Tender Pipeline">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {[
                      { label: "Title / Authority", key: "title" as SortKey, className: "min-w-[280px]" },
                      { label: "Source", key: null },
                      { label: "Deadline", key: "deadline" as SortKey },
                      { label: "Status", key: "status" as SortKey },
                      { label: "Processing", key: null },
                      { label: "Owner", key: null },
                      { label: "Uploaded", key: "uploadDate" as SortKey },
                      { label: "Fit Score", key: "fitScore" as SortKey },
                      { label: "", key: null },
                    ].map((col, i) => (
                      <th
                        key={i}
                        className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${col.className ?? ""} ${col.key ? "cursor-pointer hover:text-slate-700 select-none" : ""}`}
                        onClick={() => col.key && sortBy(col.key)}
                        scope="col"
                        aria-sort={col.key && sort.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                      >
                        {col.label}
                        {col.key && <SortIcon k={col.key} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                    : paged.length === 0
                    ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center">
                          <p className="text-slate-500 text-sm">No tenders found.</p>
                          <button onClick={() => { setSearch(""); setStatusFilter([]); setSourceFilter([]); }} className="mt-2 text-blue-600 text-sm hover:underline">Reset filters</button>
                        </td>
                      </tr>
                    )
                    : paged.map(tender => {
                      const days = getDaysUntilDeadline(tender.deadline);
                      const rowUrgency = tender.deadline && days !== null && days <= 7 && days >= 0 ? "bg-red-50/50" : "";
                      return (
                        <tr
                          key={tender.id}
                          onClick={() => router.push(`/app/tenders/${tender.id}`)}
                          className={`hover:bg-blue-50/40 cursor-pointer transition-colors group ${rowUrgency}`}
                          role="row"
                          tabIndex={0}
                          onKeyDown={e => e.key === "Enter" && router.push(`/app/tenders/${tender.id}`)}
                          aria-label={`Tender: ${tender.title}`}
                        >
                          <td className="px-4 py-3 max-w-xs">
                            <div className="font-medium text-slate-900 truncate group-hover:text-blue-700 transition-colors">{tender.title}</div>
                            <div className="text-slate-500 text-xs mt-0.5 truncate">{tender.authority}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap"><SourceBadge source={tender.source} /></td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <DeadlineChip deadline={tender.deadline} />
                              {tender.deadline && (
                                <span className="text-slate-400 text-xs font-mono">
                                  {new Date(tender.deadline).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={tender.status} /></td>
                          <td className="px-4 py-3 whitespace-nowrap"><ProcessingBadge status={tender.processingStatus} /></td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                                {tender.owner[0]}
                              </div>
                              <span className="text-slate-600 text-xs truncate max-w-[90px]">{tender.owner.split(" ")[0]}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs font-mono">
                            {new Date(tender.uploadDate).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <FitScoreCell score={tender.fitScore} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              className="p-1.5 rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500"
                              aria-label="Options"
                              onClick={e => { e.stopPropagation(); }}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && sorted.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-slate-500 text-xs">
                  {sorted.length} tenders · Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded text-xs font-medium focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors ${
                          page === p ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"
                        }`}
                        aria-current={page === p ? "page" : undefined}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
