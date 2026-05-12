import type {
  BoardColumn,
  ChecklistStatus,
  DocumentStatus,
  FitStatus,
  Recommendation,
  TaskPriority,
  TaskStatus,
  TaskType,
  TenderProcessingStatus,
  TenderSource,
  TenderStatus,
  WorkspaceMemberStatus,
  WorkspaceRole,
} from "@/generated/prisma";

export const TENDER_STATUS_LABEL: Record<TenderStatus, string> = {
  DRAFT: "Draft",
  NEW: "New",
  IN_REVIEW: "In Review",
  BID: "Bid",
  NO_BID: "No-Bid",
  SUBMITTED: "Submitted",
  WON: "Won",
  LOST: "Lost",
};
export const TENDER_STATUSES = Object.keys(TENDER_STATUS_LABEL) as TenderStatus[];

export const BOARD_COLUMN_LABEL: Record<BoardColumn, string> = {
  BACKLOG: "Backlog",
  SCREENING: "Screening",
  GO_NO_GO: "Go / No-Go",
  DRAFTING: "Drafting",
  REVIEW: "Review",
  SUBMITTED: "Submitted",
  WON: "Won",
  LOST: "Lost",
};
export const BOARD_COLUMNS = Object.keys(BOARD_COLUMN_LABEL) as BoardColumn[];

export const PROCESSING_STATUS_LABEL: Record<TenderProcessingStatus, string> = {
  QUEUED: "Queued",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  PASSWORD_PROTECTED: "Password Protected",
};

export const SOURCE_LABEL: Record<TenderSource, string> = {
  TED: "TED",
  DTVP: "DTVP",
  ANKO: "ANKÖ",
  SIMAP: "SIMAP",
  VERGABE24: "Vergabe24",
  ETENDERING: "eTendering",
  MANUAL: "Manual",
};

export const RECOMMENDATION_LABEL: Record<Recommendation, string> = {
  BID: "Bid",
  REVIEW: "Review",
  NO_BID: "No-Bid",
};

export const DOC_STATUS_LABEL: Record<DocumentStatus, string> = {
  UPLOADED: "Uploaded",
  PROCESSING: "Processing",
  PROCESSED: "Processed",
  FAILED: "Failed",
  PASSWORD_PROTECTED: "Password Protected",
};

export const CHECKLIST_STATUS_LABEL: Record<ChecklistStatus, string> = {
  MISSING: "Missing",
  UPLOADED: "Uploaded",
  VERIFIED: "Verified",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};
export const TASK_STATUSES = Object.keys(TASK_STATUS_LABEL) as TaskStatus[];

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  COMPLIANCE: "Compliance",
  AI_GENERATED: "AI-Generated",
  CUSTOM: "Custom",
};

export const FIT_STATUS_LABEL: Record<FitStatus, string> = {
  MATCHED: "Matched",
  PARTIAL: "Partial",
  UNMATCHED: "Unmatched",
  NA: "N/A",
};

export const ROLE_LABEL: Record<WorkspaceRole, string> = {
  ADMIN: "Admin",
  BID_MANAGER: "Bid Manager",
  ANALYST: "Analyst",
  VIEWER: "Viewer",
};
export const WORKSPACE_ROLES = Object.keys(ROLE_LABEL) as WorkspaceRole[];

export const MEMBER_STATUS_LABEL: Record<WorkspaceMemberStatus, string> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  DEACTIVATED: "Deactivated",
};

export function daysUntil(date: Date | string | null): number | null {
  if (!date) return null;
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
