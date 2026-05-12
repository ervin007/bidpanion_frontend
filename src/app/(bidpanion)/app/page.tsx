"use client";

import { useMemo, useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  FileText,
  TrendingUp,
  AlertCircle,
  SlidersHorizontal,
  CalendarDays,
  Users2,
  Eye,
  FolderOpen,
} from "lucide-react";
import { api } from "@/trpc/react";
import {
  BOARD_COLUMN_LABEL,
  PROCESSING_STATUS_LABEL,
  SOURCE_LABEL,
  TENDER_STATUSES,
  TENDER_STATUS_LABEL,
  daysUntil,
} from "@/lib/bidpanion-labels";
import type {
  TenderProcessingStatus,
  TenderSource,
  TenderStatus,
} from "@/generated/prisma";

function DeadlineChip({ deadline }: { deadline: Date | string | null }) {
  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
        <AlertCircle size={10} />
        Not set
      </span>
    );
  }
  const days = daysUntil(deadline);
  if (days === null) return null;
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-400">
        Expired
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <AlertTriangle size={10} />
        {days}d
      </span>
    );
  }
  if (days <= 14) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        <Clock size={10} />
        {days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
      <CalendarDays size={10} />
      {days}d
    </span>
  );
}

const STATUS_COLORS: Record<TenderStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  NEW: "bg-blue-100 text-blue-700 border-blue-200",
  IN_REVIEW: "bg-amber-100 text-amber-700 border-amber-200",
  BID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  NO_BID: "bg-red-100 text-red-700 border-red-200",
  SUBMITTED: "bg-violet-100 text-violet-700 border-violet-200",
  WON: "bg-emerald-100 text-emerald-800 border-emerald-300",
  LOST: "bg-slate-100 text-slate-500 border-slate-200",
};

function StatusBadge({ status }: { status: TenderStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${STATUS_COLORS[status]}`}
    >
      {TENDER_STATUS_LABEL[status]}
    </span>
  );
}

const PROC_COLORS: Record<TenderProcessingStatus, string> = {
  QUEUED: "bg-slate-100 text-slate-500",
  PROCESSING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  PASSWORD_PROTECTED: "bg-amber-100 text-amber-700",
};
const PROC_ICONS: Record<TenderProcessingStatus, React.ReactNode> = {
  QUEUED: <Clock size={10} />,
  PROCESSING: <Loader2 size={10} className="animate-spin" />,
  COMPLETED: <CheckCircle2 size={10} />,
  FAILED: <XCircle size={10} />,
  PASSWORD_PROTECTED: <AlertTriangle size={10} />,
};
function ProcessingBadge({ status }: { status: TenderProcessingStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${PROC_COLORS[status]}`}
    >
      {PROC_ICONS[status]}
      {PROCESSING_STATUS_LABEL[status]}
    </span>
  );
}

const SOURCE_COLORS: Record<TenderSource, string> = {
  TED: "bg-blue-700 text-white",
  DTVP: "bg-slate-700 text-white",
  ANKO: "bg-violet-600 text-white",
  SIMAP: "bg-teal-600 text-white",
  VERGABE24: "bg-orange-600 text-white",
  ETENDERING: "bg-cyan-600 text-white",
  MANUAL: "bg-slate-300 text-slate-700",
};

function SourceBadge({ source }: { source: TenderSource }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wide ${SOURCE_COLORS[source]}`}
    >
      {SOURCE_LABEL[source]}
    </span>
  );
}

function FitScoreCell({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-slate-400 text-xs italic">N/A</span>;
  }
  const color =
    score >= 70 ? "text-emerald-700" : score >= 40 ? "text-amber-600" : "text-red-600";
  const barColor =
    score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-semibold ${color}`}>{score}</span>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
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

function EmptyState() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border-2 border-blue-100">
        <FileText size={28} className="text-blue-500" />
      </div>
      <h2 className="text-slate-900 mb-2">No Tenders Yet</h2>
      <p className="text-slate-500 text-sm max-w-sm mb-8">
        Upload your first tender ZIP to extract documents, generate a structured brief, and
        calculate a fit-score recommendation.
      </p>
      <button
        onClick={() => router.push("/app/quick-analysis")}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 mb-6"
      >
        <Upload size={16} />
        Upload First Tender
      </button>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3.5 bg-slate-200 rounded animate-pulse"
            style={{ width: `${50 + Math.random() * 40}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

type SortKey = "title" | "deadline" | "status" | "fitScore" | "uploadDate";
type SortDir = "asc" | "desc";
type ViewMode = "all" | "watching" | "in-progress" | "submitted";

export default function DashboardPage() {
  const router = useRouter();
  const me = api.user.getCurrentUser.useQuery();
  const tenderQuery = api.tender.list.useQuery({ includeDeleted: false });

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [statusFilter, setStatusFilter] = useState<TenderStatus[]>([]);
  const [sourceFilter, setSourceFilter] = useState<TenderSource[]>([]);
  const [myTenders, setMyTenders] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "uploadDate",
    dir: "desc",
  });
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const PER_PAGE = 10;

  const tenders = tenderQuery.data ?? [];
  const sources = useMemo(
    () => Array.from(new Set(tenders.map((t) => t.source))),
    [tenders],
  );

  const toggleStatus = (s: TenderStatus) =>
    setStatusFilter((f) =>
      f.includes(s) ? f.filter((x) => x !== s) : [...f, s],
    );
  const toggleSource = (s: TenderSource) =>
    setSourceFilter((f) =>
      f.includes(s) ? f.filter((x) => x !== s) : [...f, s],
    );

  const sorted = useMemo(() => {
    let data = [...tenders];
    if (viewMode === "watching") data = data.filter((t) => t.watching);
    else if (viewMode === "in-progress")
      data = data.filter((t) => ["NEW", "IN_REVIEW", "BID"].includes(t.status));
    else if (viewMode === "submitted")
      data = data.filter((t) => ["SUBMITTED", "WON", "LOST"].includes(t.status));

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.authority.toLowerCase().includes(q),
      );
    }
    if (statusFilter.length) data = data.filter((t) => statusFilter.includes(t.status));
    if (sourceFilter.length) data = data.filter((t) => sourceFilter.includes(t.source));
    if (myTenders && me.data) {
      const myId = me.data.id;
      data = data.filter((t) => t.ownerId === myId);
    }

    data.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "deadline") {
        const av = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        const bv = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        return (av - bv) * dir;
      }
      if (sort.key === "uploadDate") {
        return (new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()) * dir;
      }
      if (sort.key === "fitScore") {
        const av = a.fitScore ?? -1;
        const bv = b.fitScore ?? -1;
        return (av - bv) * dir;
      }
      const av = String(a[sort.key] ?? "");
      const bv = String(b[sort.key] ?? "");
      return av.localeCompare(bv) * dir;
    });
    return data;
  }, [tenders, viewMode, search, statusFilter, sourceFilter, myTenders, me.data, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const sortBy = (key: SortKey) => {
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sort.key !== k) return <span className="text-slate-300 ml-1">↕</span>;
    return sort.dir === "asc" ? (
      <ChevronUp size={12} className="ml-0.5 inline text-blue-600" />
    ) : (
      <ChevronDown size={12} className="ml-0.5 inline text-blue-600" />
    );
  };

  const total = tenders.length;
  const activeBids = tenders.filter((t) => ["BID", "SUBMITTED"].includes(t.status)).length;
  const inReview = tenders.filter((t) => t.status === "IN_REVIEW").length;
  const scored = tenders.filter((t) => t.fitScore !== null);
  const avgFit = scored.length
    ? Math.round(scored.reduce((a, b) => a + (b.fitScore ?? 0), 0) / scored.length)
    : 0;
  const watchingCount = tenders.filter((t) => t.watching).length;
  const inProgressCount = tenders.filter((t) =>
    ["NEW", "IN_REVIEW", "BID"].includes(t.status),
  ).length;
  const submittedCount = tenders.filter((t) =>
    ["SUBMITTED", "WON", "LOST"].includes(t.status),
  ).length;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);
  const firstName = me.data?.name?.split(" ")[0] ?? "";

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-slate-900">Tender Pipeline</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {greeting}
            {firstName ? `, ${firstName}` : ""} —{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => tenderQuery.refetch()}
            disabled={tenderQuery.isFetching}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            aria-label="Refresh data"
          >
            <RefreshCw
              size={14}
              className={tenderQuery.isFetching ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => router.push("/app/quick-analysis")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Upload size={15} />
            New Tender
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: "all" as ViewMode, label: "All", icon: <FolderOpen size={14} />, count: total },
          {
            id: "watching" as ViewMode,
            label: "Watching",
            icon: <Eye size={14} />,
            count: watchingCount,
          },
          {
            id: "in-progress" as ViewMode,
            label: "In Progress",
            icon: <Clock size={14} />,
            count: inProgressCount,
          },
          {
            id: "submitted" as ViewMode,
            label: "Submitted",
            icon: <CheckCircle2 size={14} />,
            count: submittedCount,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setViewMode(tab.id);
              setPage(1);
            }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              viewMode === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              <span className="ml-1 text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                {tab.count}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total"
          value={total}
          sub="Tenders"
          icon={<FileText size={20} className="text-blue-600" />}
          accent="bg-blue-50"
        />
        <KpiCard
          label="Active Bids"
          value={activeBids}
          sub="Bid + Submitted"
          icon={<TrendingUp size={20} className="text-emerald-600" />}
          accent="bg-emerald-50"
        />
        <KpiCard
          label="In Review"
          value={inReview}
          sub="Pending Decisions"
          icon={<Clock size={20} className="text-amber-600" />}
          accent="bg-amber-50"
        />
        <KpiCard
          label="Avg Fit Score"
          value={scored.length ? avgFit : "—"}
          sub={scored.length ? "Scored tenders" : "No scored tenders"}
          icon={<CheckCircle2 size={20} className="text-violet-600" />}
          accent="bg-violet-50"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 p-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search title or authority…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <button
            onClick={() => {
              setMyTenders(!myTenders);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
              myTenders
                ? "bg-blue-600 text-white border-blue-600"
                : "text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Users2 size={14} />
            My Tenders
          </button>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
              filterOpen || statusFilter.length || sourceFilter.length
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {statusFilter.length + sourceFilter.length > 0 && (
              <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {statusFilter.length + sourceFilter.length}
              </span>
            )}
          </button>

          {(search || statusFilter.length || sourceFilter.length || myTenders) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter([]);
                setSourceFilter([]);
                setMyTenders(false);
                setPage(1);
              }}
              className="text-slate-400 hover:text-slate-600 text-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Reset filters
            </button>
          )}
        </div>

        {filterOpen && (
          <div className="border-t border-slate-100 p-4 bg-slate-50/50 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
                Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TENDER_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      toggleStatus(s);
                      setPage(1);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors focus-visible:ring-1 focus-visible:ring-blue-500 ${
                      statusFilter.includes(s)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {TENDER_STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
            {sources.length > 0 && (
              <div>
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
                  Source
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sources.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        toggleSource(s);
                        setPage(1);
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium border transition-colors focus-visible:ring-1 focus-visible:ring-blue-500 ${
                        sourceFilter.includes(s)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {SOURCE_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {tenderQuery.isLoading ? (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        ) : tenders.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table" aria-label="Tender Pipeline">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {[
                      {
                        label: "Title / Authority",
                        key: "title" as SortKey,
                        className: "min-w-[280px]",
                      },
                      { label: "Source", key: null },
                      { label: "Deadline", key: "deadline" as SortKey },
                      { label: "Status", key: "status" as SortKey },
                      { label: "Processing", key: null },
                      { label: "Owner", key: null },
                      { label: "Uploaded", key: "uploadDate" as SortKey },
                      { label: "Fit Score", key: "fitScore" as SortKey },
                    ].map((col, i) => (
                      <th
                        key={i}
                        className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${col.className ?? ""} ${
                          col.key ? "cursor-pointer hover:text-slate-700 select-none" : ""
                        }`}
                        onClick={() => col.key && sortBy(col.key)}
                        scope="col"
                        aria-sort={
                          col.key && sort.key === col.key
                            ? sort.dir === "asc"
                              ? "ascending"
                              : "descending"
                            : undefined
                        }
                      >
                        {col.label}
                        {col.key && <SortIcon k={col.key} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <p className="text-slate-500 text-sm">
                          No tenders match the current filters.
                        </p>
                        <button
                          onClick={() => {
                            setSearch("");
                            setStatusFilter([]);
                            setSourceFilter([]);
                            setMyTenders(false);
                            setPage(1);
                          }}
                          className="mt-2 text-blue-600 text-sm hover:underline"
                        >
                          Reset filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paged.map((tender) => {
                      const days = daysUntil(tender.deadline);
                      const rowUrgency =
                        tender.deadline && days !== null && days <= 7 && days >= 0
                          ? "bg-red-50/50"
                          : "";
                      return (
                        <tr
                          key={tender.id}
                          onClick={() => router.push(`/app/tenders/${tender.id}`)}
                          className={`hover:bg-blue-50/40 cursor-pointer transition-colors group ${rowUrgency}`}
                          role="row"
                          tabIndex={0}
                          onKeyDown={(e) =>
                            e.key === "Enter" && router.push(`/app/tenders/${tender.id}`)
                          }
                          aria-label={`Tender: ${tender.title}`}
                        >
                          <td className="px-4 py-3 max-w-xs">
                            <div className="font-medium text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                              {tender.title}
                            </div>
                            <div className="text-slate-500 text-xs mt-0.5 truncate">
                              {tender.authority}
                            </div>
                            {tender.boardColumn && (
                              <div className="text-slate-400 text-xs mt-1">
                                Board: {BOARD_COLUMN_LABEL[tender.boardColumn]}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <SourceBadge source={tender.source} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <DeadlineChip deadline={tender.deadline} />
                              {tender.deadline && (
                                <span className="text-slate-400 text-xs font-mono">
                                  {new Date(tender.deadline).toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={tender.status} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <ProcessingBadge status={tender.processingStatus} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {tender.owner ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                                  {tender.owner.name?.[0] ?? "?"}
                                </div>
                                <span className="text-slate-600 text-xs truncate max-w-[90px]">
                                  {tender.owner.name?.split(" ")[0] ?? "—"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs font-mono">
                            {new Date(tender.uploadDate).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <FitScoreCell score={tender.fitScore} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {sorted.length > PER_PAGE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-slate-500 text-xs">
                  {sorted.length} tenders · Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
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
                    onClick={() => setPage((p) => p + 1)}
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
