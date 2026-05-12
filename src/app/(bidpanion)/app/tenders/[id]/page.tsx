"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Check,
  X,
  ChevronDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Lock,
  FileText,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ExternalLink,
  Star,
  Info,
  Flag,
  Link2,
  BookOpen,
  Calendar,
  MapPin,
  Building2,
  Hash,
  Trash2,
  User2,
  CheckSquare,
  Square,
  Plus,
  Send,
  Activity,
  ListTodo,
  CheckCircle,
} from "lucide-react";
import { api, type RouterOutputs } from "@/trpc/react";
import { TenderSummaryView } from "@/components/bidpanion/TenderSummaryView";
import {
  CHECKLIST_STATUS_LABEL,
  PROCESSING_STATUS_LABEL,
  RECOMMENDATION_LABEL,
  TASK_PRIORITY_LABEL,
  TASK_STATUSES,
  TASK_STATUS_LABEL,
  TENDER_STATUSES,
  TENDER_STATUS_LABEL,
} from "@/lib/bidpanion-labels";
import type {
  ChecklistStatus,
  TaskStatus,
  TaskPriority,
  TenderProcessingStatus,
  TenderStatus,
} from "@/generated/prisma";
import type { TenderSummary } from "@/data/tender-summary-schema";

type TenderDetail = RouterOutputs["tender"]["get"];
type DocumentRow = TenderDetail["documents"][number];
type FitCat = TenderDetail["fitCategories"][number];
type TaskRow = TenderDetail["tasks"][number];
type ChecklistRow = TenderDetail["checklist"][number];
type CommentRow = TenderDetail["comments"][number];
type ActivityRow = TenderDetail["activity"][number];

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
const PROC_COLORS: Record<TenderProcessingStatus, string> = {
  QUEUED: "bg-slate-100 text-slate-500",
  PROCESSING: "bg-blue-100 text-blue-600",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  PASSWORD_PROTECTED: "bg-amber-100 text-amber-700",
};
const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-slate-100 text-slate-600 border-slate-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  DONE: "bg-emerald-100 text-emerald-700 border-emerald-200",
};
const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};
const COMPLIANCE_STATUS_COLORS: Record<ChecklistStatus, string> = {
  MISSING: "bg-slate-100 text-slate-500",
  UPLOADED: "bg-blue-100 text-blue-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
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

function ProcBadge({ status }: { status: TenderProcessingStatus }) {
  const icons: Record<TenderProcessingStatus, ReactNode> = {
    QUEUED: <Clock size={10} />,
    PROCESSING: <Loader2 size={10} className="animate-spin" />,
    COMPLETED: <CheckCircle2 size={10} />,
    FAILED: <XCircle size={10} />,
    PASSWORD_PROTECTED: <Lock size={10} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${PROC_COLORS[status]}`}
    >
      {icons[status]}
      {PROCESSING_STATUS_LABEL[status]}
    </span>
  );
}

function Circle({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function CitationChip({ doc, page }: { doc: string; page: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 align-middle mx-0.5"
      title={`${doc}, p. ${page}`}
    >
      <Link2 size={9} />
      {doc.replace(".pdf", "")}, p.{page}
    </span>
  );
}

function formatRelative(ts: Date | string): string {
  const date = new Date(ts);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function OverviewTab({ tender }: { tender: TenderDetail }) {
  const rows = [
    { icon: <Building2 size={14} />, label: "Contracting Authority", value: tender.authority },
    {
      icon: <Calendar size={14} />,
      label: "Submission Deadline",
      value: tender.deadline
        ? new Date(tender.deadline).toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Not set",
    },
    { icon: <Star size={14} />, label: "Estimated Value", value: tender.value ?? "Not specified" },
    { icon: <FileText size={14} />, label: "Notice Type", value: tender.noticeType ?? "—" },
    { icon: <Hash size={14} />, label: "CPV Code", value: tender.cpvCode ?? "—" },
    { icon: <MapPin size={14} />, label: "Country", value: tender.country },
    {
      icon: <User2 size={14} />,
      label: "Owner",
      value: tender.owner?.name ?? "Unassigned",
    },
    {
      icon: <ExternalLink size={14} />,
      label: "Source URL",
      value: tender.sourceUrl ?? "—",
      isLink: !!tender.sourceUrl,
    },
    {
      icon: <Clock size={14} />,
      label: "Uploaded",
      value: new Date(tender.uploadDate).toLocaleString("en-US"),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-slate-800">Tender Details</h3>
          </div>
          <dl className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={row.label} className="flex items-start gap-4 px-5 py-3">
                <dt className="flex items-center gap-1.5 text-slate-500 text-sm min-w-[200px] flex-shrink-0">
                  <span className="text-slate-400">{row.icon}</span>
                  {row.label}
                </dt>
                <dd className="text-slate-900 text-sm font-medium">
                  {row.isLink ? (
                    <a
                      href={row.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {row.value} <ExternalLink size={12} />
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {tender.description && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-slate-800 mb-3">Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{tender.description}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800">Processing Status</h3>
            <ProcBadge status={tender.processingStatus} />
          </div>
          {tender.processingStatus === "PROCESSING" && (
            <p className="text-sm text-blue-600 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              The AI pipeline is still processing this tender.
            </p>
          )}
          {tender.processingStatus === "PASSWORD_PROTECTED" && (
            <p className="text-sm text-amber-600 flex items-center gap-2">
              <AlertTriangle size={14} />
              Document requires a password.
            </p>
          )}
          {tender.processingStatus === "FAILED" && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <XCircle size={14} />
              Processing failed. Re-upload the bundle to try again.
            </p>
          )}
          {tender.processingStatus === "COMPLETED" && (
            <p className="text-sm text-emerald-600 flex items-center gap-2">
              <CheckCircle2 size={14} />
              All documents processed.
            </p>
          )}
        </div>

        {!tender.deadline && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-900 font-semibold text-sm mb-1">
                  Deadline missing
                </h4>
                <p className="text-amber-700 text-xs leading-relaxed">
                  The submission deadline isn't on this tender yet. Set it manually so the
                  pipeline can prioritise it correctly.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentsTab({ docs }: { docs: DocumentRow[] }) {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-800">Uploaded Documents ({docs.length})</h3>
      </div>

      {docs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-500 text-sm">No documents linked to this tender yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Document
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Pages
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {doc.isPrimary && <Star size={12} className="text-amber-500" />}
                      <span className="font-medium text-slate-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{doc.pages ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                    {(doc.sizeBytes / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {doc.status}
                    </span>
                    {doc.status === "PROCESSING" && doc.progress != null && (
                      <span className="ml-2 text-xs text-slate-500">
                        {doc.progress}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BriefTab({ tender }: { tender: TenderDetail }) {
  const aiSummary = tender.summary?.payload as TenderSummary | undefined;
  if (aiSummary) {
    return (
      <div className="p-5">
        <TenderSummaryView summary={aiSummary} />
      </div>
    );
  }
  if (tender.briefSections.length === 0) {
    return (
      <div className="p-5">
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
          <BookOpen size={36} className="text-slate-300 mx-auto" />
          <h3 className="text-slate-700 font-semibold">No brief generated yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            The AI pipeline hasn't produced a structured summary for this tender. Run an
            analysis from the Quick Analysis page or wait for the current job to complete.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-5 space-y-5">
      {tender.briefSections.map((section) => (
        <div
          key={section.id}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-slate-800">{section.title}</h3>
          </div>
          <dl className="divide-y divide-slate-100">
            {section.fields.map((field) => (
              <div key={field.id} className="flex items-start gap-4 px-5 py-3">
                <dt className="text-slate-500 text-sm min-w-[180px] flex-shrink-0">
                  {field.label}
                  {field.needsReview && (
                    <span className="ml-1.5 text-amber-600" title="Needs review">
                      <AlertCircle size={12} className="inline" />
                    </span>
                  )}
                </dt>
                <dd className="text-slate-900 text-sm flex-1">
                  {field.userVerified && field.verifiedValue ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="text-emerald-600 mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <span className="text-emerald-700 font-medium">
                            {field.verifiedValue}
                          </span>
                          {field.verifiedBy && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Verified by {field.verifiedBy.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 line-through">
                        Original: {field.value}
                      </div>
                    </div>
                  ) : (
                    <span>{field.value}</span>
                  )}
                  {field.citationDoc && field.citationPage && (
                    <div className="mt-1">
                      <CitationChip
                        doc={field.citationDoc}
                        page={field.citationPage}
                      />
                    </div>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

function FitScoreTab({
  tender,
  categories,
}: {
  tender: TenderDetail;
  categories: FitCat[];
}) {
  const fitScore = tender.fitScore;
  const recommendation = tender.recommendation;
  const scoreColor =
    fitScore == null
      ? "text-slate-400"
      : fitScore >= 70
      ? "text-emerald-700"
      : fitScore >= 50
      ? "text-amber-600"
      : "text-red-600";
  const scoreBg =
    fitScore == null
      ? "bg-slate-200"
      : fitScore >= 70
      ? "bg-emerald-500"
      : fitScore >= 50
      ? "bg-amber-400"
      : "bg-red-500";

  return (
    <div className="p-5 space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-slate-800 mb-1">Overall Fit Score</h3>
            <p className="text-slate-500 text-sm">
              {fitScore == null
                ? "No score yet — the AI pipeline hasn't run a match against your company profile."
                : "Based on company profile matching."}
            </p>
          </div>
          <div className={`text-5xl font-bold ${scoreColor}`}>{fitScore ?? "—"}</div>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full ${scoreBg}`}
            style={{ width: `${fitScore ?? 0}%` }}
          />
        </div>
        {recommendation && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
              recommendation === "BID"
                ? "bg-emerald-50 text-emerald-700"
                : recommendation === "REVIEW"
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {recommendation === "BID" ? (
              <ThumbsUp size={16} />
            ) : recommendation === "REVIEW" ? (
              <Flag size={16} />
            ) : (
              <ThumbsDown size={16} />
            )}
            <span className="font-semibold">
              Recommendation: {RECOMMENDATION_LABEL[recommendation]}
            </span>
          </div>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          No category breakdown available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-slate-900 font-semibold">{cat.label}</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Weight: {cat.weight}%</p>
                </div>
                <div
                  className={`text-lg font-bold ${
                    cat.score >= 70
                      ? "text-emerald-700"
                      : cat.score >= 50
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {cat.score}
                </div>
              </div>
              {cat.details && <p className="text-slate-600 text-sm mb-3">{cat.details}</p>}
              {cat.matchedItems.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">✓ Matched:</p>
                  <ul className="text-xs text-slate-600 space-y-0.5">
                    {cat.matchedItems.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {cat.unmatchedItems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-1">✗ Missing:</p>
                  <ul className="text-xs text-slate-600 space-y-0.5">
                    {cat.unmatchedItems.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityTab({
  tenderId,
  comments,
  activity,
  currentUserName,
}: {
  tenderId: string;
  comments: CommentRow[];
  activity: ActivityRow[];
  currentUserName: string;
}) {
  const utils = api.useUtils();
  const [newComment, setNewComment] = useState("");
  const [showActivity, setShowActivity] = useState(false);

  const addComment = api.comment.create.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.tender.get.invalidate({ id: tenderId });
    },
  });

  const initials = currentUserName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const feed = useMemo(() => {
    const c = comments.map((x) => ({
      kind: "comment" as const,
      data: x,
      ts: new Date(x.createdAt).getTime(),
    }));
    const a = showActivity
      ? activity.map((x) => ({
          kind: "activity" as const,
          data: x,
          ts: new Date(x.createdAt).getTime(),
        }))
      : [];
    return [...c, ...a].sort((x, y) => y.ts - x.ts);
  }, [comments, activity, showActivity]);

  return (
    <div className="p-5 space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials || "?"}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment…"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex items-center justify-end mt-2">
              <button
                onClick={() =>
                  addComment.mutate({ tenderId, content: newComment.trim() })
                }
                disabled={!newComment.trim() || addComment.isPending}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addComment.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-slate-800">Comments & Activity</h3>
        <button
          onClick={() => setShowActivity(!showActivity)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Activity size={14} />
          {showActivity ? "Hide" : "Show"} system activity
        </button>
      </div>

      <div className="space-y-4">
        {feed.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
            No comments yet. Start the conversation.
          </div>
        )}
        {feed.map((item) =>
          item.kind === "comment" ? (
            <div
              key={`c-${item.data.id}`}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                  {(item.data.author.name ?? "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900">
                      {item.data.author.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatRelative(item.data.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {item.data.content}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={`a-${item.data.id}`}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <Activity size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {item.data.actor?.name && (
                      <span className="text-sm font-semibold text-slate-700">
                        {item.data.actor.name}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {formatRelative(item.data.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{item.data.description}</p>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function TasksTab({
  tenderId,
  checklist,
  tasks,
}: {
  tenderId: string;
  checklist: ChecklistRow[];
  tasks: TaskRow[];
}) {
  const utils = api.useUtils();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    if (checklist.length > 0 && expanded.size === 0) {
      setExpanded(new Set([checklist[0]!.section]));
    }
  }, [checklist, expanded.size]);

  const setChecklistStatus = api.checklist.setStatus.useMutation({
    onSuccess: () => utils.tender.get.invalidate({ id: tenderId }),
  });
  const updateTask = api.task.update.useMutation({
    onSuccess: () => utils.tender.get.invalidate({ id: tenderId }),
  });
  const createTask = api.task.create.useMutation({
    onSuccess: () => {
      setNewTaskTitle("");
      setShowAddTask(false);
      utils.tender.get.invalidate({ id: tenderId });
    },
  });

  const toggleSection = (section: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });

  const cycleChecklist = (item: ChecklistRow) => {
    const next: ChecklistStatus =
      item.status === "MISSING"
        ? "UPLOADED"
        : item.status === "UPLOADED"
        ? "VERIFIED"
        : "MISSING";
    setChecklistStatus.mutate({ id: item.id, status: next });
  };

  const toggleTask = (task: TaskRow) => {
    const next: TaskStatus = task.status === "DONE" ? "TODO" : "DONE";
    updateTask.mutate({ id: task.id, status: next });
  };

  const sections = Array.from(new Set(checklist.map((c) => c.section)));
  const aiTasks = tasks.filter((t) => t.type === "AI_GENERATED");
  const customTasks = tasks.filter((t) => t.type === "CUSTOM");

  const totalCompliance = checklist.length;
  const verifiedCompliance = checklist.filter((c) => c.status === "VERIFIED").length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const totalTasks = tasks.length;
  const compliancePct = totalCompliance === 0 ? 0 : Math.round((verifiedCompliance / totalCompliance) * 100);
  const tasksPct = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="p-5 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h4 className="text-slate-800 font-semibold mb-3">Compliance Checklist</h4>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${compliancePct}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {verifiedCompliance}/{totalCompliance}
            </span>
          </div>
          <p className="text-xs text-slate-500">{compliancePct}% complete</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h4 className="text-slate-800 font-semibold mb-3">Tasks Progress</h4>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${tasksPct}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <p className="text-xs text-slate-500">{tasksPct}% complete</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-slate-800">Compliance Checklist</h3>
          <span className="text-xs text-slate-500">
            {verifiedCompliance} of {totalCompliance} verified
          </span>
        </div>
        {checklist.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No compliance items yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sections.map((section) => {
              const items = checklist.filter((c) => c.section === section);
              const verified = items.filter((i) => i.status === "VERIFIED").length;
              const isExpanded = expanded.has(section);
              return (
                <div key={section}>
                  <button
                    onClick={() => toggleSection(section)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform ${
                          isExpanded ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                      <span className="font-semibold text-slate-900">{section}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {verified}/{items.length}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="px-5 py-2 space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 py-2">
                          <button
                            onClick={() => cycleChecklist(item)}
                            disabled={setChecklistStatus.isPending}
                            className="mt-0.5 flex-shrink-0 disabled:opacity-50"
                            aria-label={`Cycle status for ${item.label}`}
                          >
                            {item.status === "VERIFIED" ? (
                              <CheckSquare size={16} className="text-emerald-600" />
                            ) : item.status === "UPLOADED" ? (
                              <Square size={16} className="text-blue-600" />
                            ) : (
                              <Square size={16} className="text-slate-300" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm text-slate-900">{item.label}</span>
                              {item.reference && (
                                <span className="text-xs text-slate-400 font-mono">
                                  {item.reference}
                                </span>
                              )}
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${COMPLIANCE_STATUS_COLORS[item.status]}`}
                              >
                                {CHECKLIST_STATUS_LABEL[item.status]}
                              </span>
                            </div>
                            {item.reviewer && (
                              <p className="text-xs text-slate-500">
                                Reviewed by {item.reviewer.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {aiTasks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-slate-800">AI-Generated Tasks</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {aiTasks.map((task) => (
              <TaskRowView key={task.id} task={task} onToggle={() => toggleTask(task)} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-slate-800">Custom Team Tasks</h3>
          <button
            onClick={() => setShowAddTask((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus size={12} />
            Add Task
          </button>
        </div>
        {showAddTask && (
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title…"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (newTaskTitle.trim()) {
                  createTask.mutate({ tenderId, title: newTaskTitle.trim() });
                }
              }}
              disabled={!newTaskTitle.trim() || createTask.isPending}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50"
            >
              {createTask.isPending ? <Loader2 size={14} className="animate-spin" /> : "Create"}
            </button>
          </div>
        )}
        {customTasks.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            No custom tasks yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {customTasks.map((task) => (
              <TaskRowView key={task.id} task={task} onToggle={() => toggleTask(task)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRowView({
  task,
  onToggle,
}: {
  task: TaskRow;
  onToggle: () => void;
}) {
  return (
    <div className="px-5 py-3 hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className="mt-1 flex-shrink-0">
          {task.status === "DONE" ? (
            <CheckCircle size={16} className="text-emerald-600" />
          ) : (
            <Circle size={16} className="text-slate-300" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-sm font-medium ${
                task.status === "DONE" ? "line-through text-slate-400" : "text-slate-900"
              }`}
            >
              {task.title}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${TASK_PRIORITY_COLORS[task.priority]}`}
            >
              {TASK_PRIORITY_LABEL[task.priority]}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded border ${TASK_STATUS_COLORS[task.status]}`}
            >
              {TASK_STATUS_LABEL[task.status]}
            </span>
          </div>
          {task.description && (
            <p className="text-xs text-slate-600 mb-2">{task.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {task.assignee && (
              <span className="flex items-center gap-1">
                <User2 size={12} />
                {task.assignee.name}
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {task.effort && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {task.effort}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type Tab = "overview" | "documents" | "brief" | "fitscore" | "activity" | "tasks";

export default function TenderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const utils = api.useUtils();

  const me = api.user.getCurrentUser.useQuery();
  const tenderQuery = api.tender.get.useQuery({ id }, { enabled: !!id });
  const updateTender = api.tender.update.useMutation({
    onSuccess: () => utils.tender.get.invalidate({ id }),
  });
  const softDelete = api.tender.softDelete.useMutation({
    onSuccess: () => {
      utils.tender.list.invalidate();
      router.push("/app");
    },
  });

  const [tab, setTab] = useState<Tab>("overview");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (tenderQuery.data) setTitleValue(tenderQuery.data.title);
  }, [tenderQuery.data?.id, tenderQuery.data?.title]);

  if (tenderQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="text-slate-300 animate-spin" size={28} />
      </div>
    );
  }
  if (!tenderQuery.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-slate-900 mb-2">Tender not found</h2>
          <button
            onClick={() => router.push("/app")}
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  const tender = tenderQuery.data;

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Info size={14} /> },
    { id: "documents", label: "Documents", icon: <FileText size={14} /> },
    { id: "brief", label: "Brief", icon: <BookOpen size={14} /> },
    { id: "fitscore", label: "Fit Score", icon: <Star size={14} /> },
    { id: "activity", label: "Activity", icon: <MessageSquare size={14} /> },
    { id: "tasks", label: "Tasks", icon: <ListTodo size={14} /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => router.push("/app")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-blue-500 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (titleValue.trim() && titleValue !== tender.title) {
                      updateTender.mutate({ id: tender.id, title: titleValue.trim() });
                    }
                    setEditingTitle(false);
                  }}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditingTitle(false);
                    setTitleValue(tender.title);
                  }}
                  className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-slate-900 truncate">{tender.title}</h1>
                <button
                  onClick={() => setEditingTitle(true)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                  aria-label="Edit title"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}
            <p className="text-slate-500 text-sm truncate">{tender.authority}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
              >
                <StatusBadge status={tender.status} />
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {statusMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 min-w-[140px]">
                  {TENDER_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        if (s !== tender.status) {
                          updateTender.mutate({ id: tender.id, status: s });
                        }
                        setStatusMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <StatusBadge status={s} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete tender"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-slate-200 -mb-4 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "overview" && <OverviewTab tender={tender} />}
        {tab === "documents" && <DocumentsTab docs={tender.documents} />}
        {tab === "brief" && <BriefTab tender={tender} />}
        {tab === "fitscore" && (
          <FitScoreTab tender={tender} categories={tender.fitCategories} />
        )}
        {tab === "activity" && (
          <ActivityTab
            tenderId={tender.id}
            comments={tender.comments}
            activity={tender.activity}
            currentUserName={me.data?.name ?? ""}
          />
        )}
        {tab === "tasks" && (
          <TasksTab
            tenderId={tender.id}
            checklist={tender.checklist}
            tasks={tender.tasks}
          />
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-slate-900 font-semibold mb-2">Delete tender?</h3>
            <p className="text-slate-600 text-sm mb-6">
              The tender will be moved to trash and can be restored from the Team page
              within 30 days.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  softDelete.mutate({ id: tender.id });
                }}
                disabled={softDelete.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {softDelete.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
