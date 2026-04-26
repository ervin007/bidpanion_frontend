"use client";

import { useState, type ReactNode } from "react";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Edit3, Check, X, ChevronDown, AlertTriangle, AlertCircle,
  CheckCircle2, XCircle, Loader2, Clock, Download,
  RefreshCw, Lock, FileText, Eye, ThumbsUp, ThumbsDown,
  MessageSquare, ExternalLink, Star, Info, Flag, Link2,
  BookOpen, Calendar, MapPin, Building2, Hash, Trash2, User2,
  CheckSquare, Square, Plus, Paperclip, Send,
  Activity, ListTodo, CheckCircle, Upload as UploadIcon
} from "lucide-react";
import {
  MOCK_BRIEF_SECTIONS, MOCK_FIT_CATEGORIES, MOCK_DOCUMENTS,
  MOCK_COMPLIANCE_CHECKLIST, MOCK_TASKS, MOCK_ACTIVITY_LOG, MOCK_COMMENTS,
} from "@/data/bidpanion";
import type {
  Tender, TenderStatus, ProcessingStatus, ComplianceItem,
  Task, TaskStatus, TaskPriority, ComplianceStatus, ActivityLog, ActivityComment,
} from "@/data/bidpanion";
import { useAllTenders } from "@/data/session-tenders";
import type { TenderSummary } from "@/data/tender-summary-schema";
import { TenderSummaryView } from "@/components/bidpanion/TenderSummaryView";

// ── Shared helpers ────────────────────────────────────────────────────────
const STATUS_OPTIONS: TenderStatus[] = ["Draft","New","In Review","Bid","No-Bid","Submitted","Won","Lost"];
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
const PROC_COLORS: Record<ProcessingStatus, string> = {
  Queued: "bg-slate-100 text-slate-500",
  Processing: "bg-blue-100 text-blue-600",
  Completed: "bg-emerald-100 text-emerald-700",
  Failed: "bg-red-100 text-red-700",
  "Password Protected": "bg-amber-100 text-amber-700",
};

const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  "To Do": "bg-slate-100 text-slate-600 border-slate-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  "Done": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  "Low": "bg-slate-100 text-slate-600",
  "Medium": "bg-amber-100 text-amber-700",
  "High": "bg-red-100 text-red-700",
};

const COMPLIANCE_STATUS_COLORS: Record<ComplianceStatus, string> = {
  "Missing": "bg-slate-100 text-slate-500",
  "Uploaded": "bg-blue-100 text-blue-700",
  "Verified": "bg-emerald-100 text-emerald-700",
};

function StatusBadge({ status }: { status: TenderStatus }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${STATUS_COLORS[status]}`}>{status}</span>;
}
function ProcBadge({ status }: { status: ProcessingStatus }) {
  const icons: Record<ProcessingStatus, ReactNode> = {
    Queued: <Clock size={10} />,
    Processing: <Loader2 size={10} className="animate-spin" />,
    Completed: <CheckCircle2 size={10} />,
    Failed: <XCircle size={10} />,
    "Password Protected": <Lock size={10} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${PROC_COLORS[status]}`}>
      {icons[status]}{status}
    </span>
  );
}

function CitationChip({ citation, onClick }: { citation: { doc: string; page: number }; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-colors focus-visible:ring-1 focus-visible:ring-blue-500 align-middle mx-0.5"
      title={`Jump to ${citation.doc}, p. ${citation.page}`}
      aria-label={`Citation: ${citation.doc}, page ${citation.page}`}
    >
      <Link2 size={9} />{citation.doc.replace(".pdf","")}, p.{citation.page}
    </button>
  );
}

// ── Tab A: Overview ───────────────────────────────────────────────────────
function OverviewTab({ tender }: { tender: Tender }) {
  type DetailRow = { icon: ReactNode; label: string; value: string; isLink?: boolean };
  const rows: DetailRow[] = [
    { icon: <Building2 size={14} />, label: "Contracting Authority", value: tender.authority },
    { icon: <Calendar size={14} />, label: "Submission Deadline", value: tender.deadline
        ? new Date(tender.deadline).toLocaleString("en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " CET"
        : "Not found" },
    { icon: <Star size={14} />, label: "Estimated Value", value: tender.value ?? "Not specified" },
    { icon: <FileText size={14} />, label: "Notice Type", value: tender.noticeType ?? "–" },
    { icon: <Hash size={14} />, label: "CPV Code", value: tender.cpvCode ?? "–" },
    { icon: <MapPin size={14} />, label: "Country", value: tender.country },
    { icon: <User2 size={14} />, label: "Owner", value: tender.owner },
    { icon: <ExternalLink size={14} />, label: "Source", value: tender.sourceUrl ?? "–", isLink: true },
    { icon: <Clock size={14} />, label: "Uploaded", value: new Date(tender.uploadDate).toLocaleString("en-US") },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-5">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-slate-800">Tender Details</h3>
          </div>
          <dl className="divide-y divide-slate-100">
            {rows.map(row => (
              <div key={row.label} className="flex items-start gap-4 px-5 py-3">
                <dt className="flex items-center gap-1.5 text-slate-500 text-sm min-w-[200px] flex-shrink-0">
                  <span className="text-slate-400">{row.icon}</span>
                  {row.label}
                </dt>
                <dd className={`text-slate-900 text-sm font-medium ${!tender.deadline && row.label.includes("Deadline") ? "text-amber-600 flex items-center gap-1" : ""}`}>
                  {!tender.deadline && row.label.includes("Deadline") && <AlertCircle size={13} />}
                  {row.isLink && row.value !== "–" ? (
                    <a href={row.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      {row.value} <ExternalLink size={12} />
                    </a>
                  ) : row.value}
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
          {tender.processingStatus === "Processing" && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Parsing documents...</span>
                <span>67%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: "67%" }} />
              </div>
            </div>
          )}
          {tender.processingStatus === "Password Protected" && (
            <p className="text-sm text-amber-600 flex items-center gap-2">
              <AlertTriangle size={14} />
              Document requires password
            </p>
          )}
          {tender.processingStatus === "Failed" && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <XCircle size={14} />
              Processing failed. Please re-upload.
            </p>
          )}
          {tender.processingStatus === "Completed" && (
            <p className="text-sm text-emerald-600 flex items-center gap-2">
              <CheckCircle2 size={14} />
              All documents processed
            </p>
          )}
        </div>

        {!tender.deadline && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-900 font-semibold text-sm mb-1">Deadline Not Found</h4>
                <p className="text-amber-700 text-xs leading-relaxed">
                  The submission deadline could not be extracted from the documents. Please verify manually.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab B: Documents ──────────────────────────────────────────────────────
function DocumentsTab() {
  const [docs] = useState(MOCK_DOCUMENTS);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-800">Uploaded Documents ({docs.length})</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <Download size={14} />Download All
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Document</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Pages</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Size</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {docs.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {doc.isPrimary && <Star size={12} className="text-amber-500" />}
                    <span className="font-medium text-slate-900">{doc.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{doc.pages}</td>
                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{doc.size}</td>
                <td className="px-4 py-3">
                  {doc.status === "Processing" && doc.progress !== undefined ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${doc.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-600">{doc.progress}%</span>
                    </div>
                  ) : (
                    <ProcBadge
                      status={
                        doc.status === "Uploaded"
                          ? "Queued"
                          : doc.status === "Processed"
                          ? "Completed"
                          : doc.status
                      }
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="View">
                      <Eye size={14} className="text-slate-500" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Download">
                      <Download size={14} className="text-slate-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab C: Brief ──────────────────────────────────────────────────────────
function BriefTab({
  onCitationClick,
  aiSummary,
}: {
  onCitationClick: (doc: string, page: number) => void;
  aiSummary?: TenderSummary;
}) {
  const [sections] = useState(MOCK_BRIEF_SECTIONS);

  if (aiSummary) {
    return (
      <div className="p-5">
        <TenderSummaryView summary={aiSummary} />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {sections.map(section => (
        <div key={section.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-slate-800">{section.title}</h3>
          </div>
          <dl className="divide-y divide-slate-100">
            {section.fields.map((field, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-3">
                <dt className="text-slate-500 text-sm min-w-[180px] flex-shrink-0">
                  {field.label}
                  {field.needsReview && (
                    <span className="ml-1.5 text-amber-600" title="Needs review">
                      <AlertCircle size={12} className="inline" />
                    </span>
                  )}
                </dt>
                <dd className="text-slate-900 text-sm flex-1">
                  {field.userVerified ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-emerald-700 font-medium">{field.verifiedValue}</span>
                          <p className="text-xs text-slate-500 mt-0.5">Verified by {field.verifiedBy}</p>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 line-through">Original: {field.value}</div>
                    </div>
                  ) : (
                    <span>{field.value}</span>
                  )}
                  {field.citation && (
                    <div className="mt-1">
                      <CitationChip citation={field.citation} onClick={() => onCitationClick(field.citation!.doc, field.citation!.page)} />
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

// ── Tab D: Fit Score ──────────────────────────────────────────────────────
function FitScoreTab({ tender }: { tender: Tender }) {
  const [categories] = useState(MOCK_FIT_CATEGORIES);
  const fitScore = tender.fitScore ?? 0;
  const recommendation = tender.recommendation;

  const getScoreColor = (score: number) =>
    score >= 70 ? "text-emerald-700" : score >= 50 ? "text-amber-600" : "text-red-600";
  const getScoreBg = (score: number) =>
    score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-amber-400" : "bg-red-500";

  return (
    <div className="p-5 space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-slate-800 mb-1">Overall Fit Score</h3>
            <p className="text-slate-500 text-sm">Based on company profile matching</p>
          </div>
          <div className={`text-5xl font-bold ${getScoreColor(fitScore)}`}>{fitScore}</div>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div className={`h-full rounded-full ${getScoreBg(fitScore)}`} style={{ width: `${fitScore}%` }} />
        </div>
        {recommendation && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
            recommendation === "Bid" ? "bg-emerald-50 text-emerald-700" :
            recommendation === "Review" ? "bg-amber-50 text-amber-700" :
            "bg-red-50 text-red-700"
          }`}>
            {recommendation === "Bid" ? <ThumbsUp size={16} /> : recommendation === "Review" ? <Flag size={16} /> : <ThumbsDown size={16} />}
            <span className="font-semibold">Recommendation: {recommendation}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-slate-900 font-semibold">{cat.label}</h4>
                <p className="text-slate-500 text-xs mt-0.5">Weight: {cat.weight}%</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(cat.score)}`}>{cat.score}</div>
                </div>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-3">{cat.details}</p>
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
    </div>
  );
}

// ── Tab E: Activity & Collaboration ───────────────────────────────────────
function ActivityTab() {
  const [comments, setComments] = useState<ActivityComment[]>(MOCK_COMMENTS);
  const [activityLog] = useState<ActivityLog[]>(MOCK_ACTIVITY_LOG);
  const [newComment, setNewComment] = useState("");
  const [showActivity, setShowActivity] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: ActivityComment = {
      id: `com${comments.length + 1}`,
      user: "Lena Hofmann",
      timestamp: new Date().toISOString(),
      content: newComment,
      mentions: [],
    };
    setComments([comment, ...comments]);
    setNewComment("");
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="p-5 space-y-5">
      {/* Comment input */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            LH
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment... Use @mentions to notify team members"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Paperclip size={14} />
                Attach
              </button>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-slate-800">Comments & Activity</h3>
        <button
          onClick={() => setShowActivity(!showActivity)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Activity size={14} />
          {showActivity ? "Hide" : "Show"} System Activity
        </button>
      </div>

      {/* Comments & Activity Feed */}
      <div className="space-y-4">
        {[...comments.map(c => ({ type: 'comment' as const, data: c, timestamp: c.timestamp })),
          ...(showActivity ? activityLog.map(a => ({ type: 'activity' as const, data: a, timestamp: a.timestamp })) : [])]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4">
              {item.type === 'comment' ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                    {item.data.user.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900">{item.data.user}</span>
                      <span className="text-xs text-slate-400">{formatTimestamp(item.data.timestamp)}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{item.data.content}</p>
                    {item.data.attachments && item.data.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.data.attachments.map(att => (
                          <div key={att.id} className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded border border-slate-200 text-xs">
                            <Paperclip size={12} className="text-slate-400" />
                            <span className="text-blue-600 hover:underline cursor-pointer">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Activity size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {item.data.user && <span className="text-sm font-semibold text-slate-700">{item.data.user}</span>}
                      <span className="text-xs text-slate-400">{formatTimestamp(item.data.timestamp)}</span>
                    </div>
                    <p className="text-sm text-slate-600">{item.data.description}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Tab F: Tasks ──────────────────────────────────────────────────────────
function TasksTab({ tenderId }: { tenderId: string }) {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>(MOCK_COMPLIANCE_CHECKLIST);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS.filter(t => t.tenderId === tenderId));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Application Package"]));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const toggleComplianceItem = (id: string) => {
    setComplianceItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === "Verified" ? "Uploaded" : "Verified" as ComplianceStatus }
          : item
      )
    );
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, status: task.status === "Done" ? "To Do" : "Done" as TaskStatus }
          : task
      )
    );
  };

  const complianceSections = Array.from(new Set(complianceItems.map(c => c.section)));
  const aiGeneratedTasks = tasks.filter(t => t.type === "ai-generated");
  const customTasks = tasks.filter(t => t.type === "custom");

  const getCompletionStats = (section: string) => {
    const items = complianceItems.filter(c => c.section === section);
    const verified = items.filter(c => c.status === "Verified").length;
    return { total: items.length, verified };
  };

  const totalCompliance = complianceItems.length;
  const verifiedCompliance = complianceItems.filter(c => c.status === "Verified").length;
  const completedTasks = tasks.filter(t => t.status === "Done").length;
  const totalTasks = tasks.length;
  const compliancePct = totalCompliance === 0 ? 0 : Math.round((verifiedCompliance / totalCompliance) * 100);
  const tasksPct = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="p-5 space-y-5">
      {/* Progress Overview */}
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
            <span className="text-sm font-semibold text-slate-700">{verifiedCompliance}/{totalCompliance}</span>
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
            <span className="text-sm font-semibold text-slate-700">{completedTasks}/{totalTasks}</span>
          </div>
          <p className="text-xs text-slate-500">{tasksPct}% complete</p>
        </div>
      </div>

      {/* 1. Compliance Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-slate-800">1. Compliance Checklist</h3>
          <span className="text-xs text-slate-500">{verifiedCompliance} of {totalCompliance} verified</span>
        </div>
        <div className="divide-y divide-slate-100">
          {complianceSections.map(section => {
            const stats = getCompletionStats(section);
            const isExpanded = expandedSections.has(section);
            return (
              <div key={section}>
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                    <span className="font-semibold text-slate-900">{section}</span>
                  </div>
                  <span className="text-xs text-slate-500">{stats.verified}/{stats.total}</span>
                </button>
                {isExpanded && (
                  <div className="px-5 py-2 space-y-2">
                    {complianceItems.filter(c => c.section === section).map(item => (
                      <div key={item.id} className="flex items-start gap-3 py-2">
                        <button
                          onClick={() => toggleComplianceItem(item.id)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {item.status === "Verified" ? (
                            <CheckSquare size={16} className="text-emerald-600" />
                          ) : item.status === "Uploaded" ? (
                            <Square size={16} className="text-blue-600" />
                          ) : (
                            <Square size={16} className="text-slate-300" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-slate-900">{item.label}</span>
                            <span className="text-xs text-slate-400 font-mono">{item.reference}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${COMPLIANCE_STATUS_COLORS[item.status]}`}>
                              {item.status}
                            </span>
                          </div>
                          {item.reviewer && (
                            <p className="text-xs text-slate-500">Reviewed by {item.reviewer}</p>
                          )}
                        </div>
                        <button className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors">
                          <UploadIcon size={12} />
                          Upload
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. AI-Generated Tasks */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-slate-800">2. AI-Generated Tasks</h3>
          <button className="flex items-center gap-1.5 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <RefreshCw size={12} />
            Regenerate
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {aiGeneratedTasks.map(task => (
            <div key={task.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleTask(task.id)} className="mt-1 flex-shrink-0">
                  {task.status === "Done" ? (
                    <CheckCircle size={16} className="text-emerald-600" />
                  ) : (
                    <Circle size={16} className="text-slate-300" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${task.status === "Done" ? "line-through text-slate-400" : "text-slate-900"}`}>
                      {task.title}
                    </span>
                    {task.priority && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${TASK_PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded border ${TASK_STATUS_COLORS[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-600 mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {task.assignee && (
                      <span className="flex items-center gap-1">
                        <User2 size={12} />
                        {task.assignee}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
          ))}
        </div>
      </div>

      {/* 3. Custom Team Tasks */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-slate-800">3. Custom Team Tasks</h3>
          <button className="flex items-center gap-1.5 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Plus size={12} />
            Add Task
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {customTasks.map(task => (
            <div key={task.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleTask(task.id)} className="mt-1 flex-shrink-0">
                  {task.status === "Done" ? (
                    <CheckCircle size={16} className="text-emerald-600" />
                  ) : (
                    <Circle size={16} className="text-slate-300" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${task.status === "Done" ? "line-through text-slate-400" : "text-slate-900"}`}>
                      {task.title}
                    </span>
                    {task.priority && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${TASK_PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded border ${TASK_STATUS_COLORS[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-600 mb-2">{task.description}</p>
                  )}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {task.subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-2 text-xs">
                          {subtask.completed ? (
                            <CheckSquare size={12} className="text-emerald-600" />
                          ) : (
                            <Square size={12} className="text-slate-300" />
                          )}
                          <span className={subtask.completed ? "line-through text-slate-400" : "text-slate-600"}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {task.assignee && (
                      <span className="flex items-center gap-1">
                        <User2 size={12} />
                        {task.assignee}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
type Tab = "overview" | "documents" | "brief" | "fitscore" | "activity" | "tasks";

// Helper component for Circle icon (not in lucide-react)
function Circle({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function TenderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { tenders, getSummary } = useAllTenders();
  const tender = tenders.find(t => t.id === id);
  const aiSummary = id ? getSummary(id) : undefined;

  const [tab, setTab] = useState<Tab>("overview");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(tender?.title ?? "");
  const [status, setStatus] = useState<TenderStatus>(tender?.status ?? "New");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!tender) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-slate-900 mb-2">Tender not found</h2>
          <button onClick={() => router.push("/app")} className="text-blue-600 hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleCitationClick = (doc: string, page: number) => {
    setTab("documents");
    setTimeout(() => {
      alert(`Would jump to document: ${doc}, page ${page}`);
    }, 300);
  };

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
      {/* Header */}
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
                  onChange={e => setTitleValue(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-blue-500 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => { setEditingTitle(false); }}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => { setEditingTitle(false); setTitleValue(tender.title); }}
                  className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-slate-900 truncate">{titleValue}</h1>
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
                <StatusBadge status={status} />
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {statusMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 min-w-[140px]">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => { setStatus(s); setStatusMenuOpen(false); }}
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

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 -mb-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
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

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "overview" && <OverviewTab tender={tender} />}
        {tab === "documents" && <DocumentsTab />}
        {tab === "brief" && <BriefTab onCitationClick={handleCitationClick} aiSummary={aiSummary} />}
        {tab === "fitscore" && <FitScoreTab tender={tender} />}
        {tab === "activity" && <ActivityTab />}
        {tab === "tasks" && <TasksTab tenderId={tender.id} />}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-slate-900 font-semibold mb-2">Delete Tender?</h3>
            <p className="text-slate-600 text-sm mb-6">
              This action cannot be undone. The tender will be moved to trash.
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
                  router.push("/app");
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
