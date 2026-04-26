/**
 * Schema produced by the AI tender-analysis pipeline (Ervin's service).
 * Mirrors the JSON shape of files in `mock-tender-summaries/<tender>/<tender>_summary.json`.
 *
 * Source of truth: this is the contract between Bidpanion and the AI backend.
 * Any change here must be coordinated with Ervin.
 */

export interface TenderSummaryCitation {
  field: string;
  locator: string;
}

export interface TenderSummaryScopeAndRequirements {
  "Scope & Requirements": string;
  "Contract Volume"?: string;
  "Place of Performance"?: string;
  "Standards & Certifications"?: string;
  "Subcontracting & Consortia"?: string;
  "Forms & e-Submission"?: string;
}

export interface TenderSummaryEconomicStanding {
  "Minimum Turnover"?: string;
  "Turnover in Comparable Services"?: string;
}

export interface TenderSummaryLegalRegistration {
  "Trade/Professional Register Entry"?: string;
  "Self-declarations (GWB §§123/124 or equivalent)"?: string;
  "Subcontractor Identification & Reliance"?: string;
}

export interface TenderSummarySupplierEligibility {
  "Offer Submission Documents"?: string[];
  "List of Documents"?: string[];
  "Economic & Financial Standing"?: TenderSummaryEconomicStanding;
  "Legal & Registration"?: TenderSummaryLegalRegistration;
}

export interface TenderSummaryTechnicalAbility {
  "Personnel Profiles"?: string;
  "Headcount / Staffing"?: string;
  "Reference Projects"?: string;
}

export interface TenderSummary {
  "Contracting Authority": string;
  "Project Description": string;
  "Submission Deadline": string;
  "Important Dates"?: string;
  "Scope & Requirements": TenderSummaryScopeAndRequirements;
  "Supplier Eligibility": TenderSummarySupplierEligibility;
  "Technical & Professional Ability"?: TenderSummaryTechnicalAbility;
  "Company Referrals"?: string;
  "Award Criteria": string;
  citations: TenderSummaryCitation[];
}

/**
 * Job lifecycle for an async tender analysis run.
 * Bidpanion uploads a ZIP/PDF, the AI service processes it, Bidpanion polls or
 * receives a webhook with the final result.
 */
export type TenderAnalysisJobStatus =
  | "queued"
  | "parsing"
  | "chunking"
  | "summarizing"
  | "completed"
  | "failed";

export interface TenderAnalysisJob {
  jobId: string;
  status: TenderAnalysisJobStatus;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  language?: "EN" | "DE";
  profile?: "tight" | "standard" | "rich";
  result?: TenderSummary;
  error?: { code: string; message: string };
}
