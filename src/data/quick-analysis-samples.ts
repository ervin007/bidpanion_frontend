import type { TenderSummary } from "./tender-summary-schema";

import sampleEvn from "./mock-tender-summaries/_samples/sample-evn-sap-rpa.json";
import sampleBezirk from "./mock-tender-summaries/_samples/sample-bezirkskliniken-iam.json";
import sampleGvh from "./mock-tender-summaries/_samples/sample-gvh-idp-saas.json";

export interface QuickAnalysisSample {
  slug: string;
  filename: string;
  summary: TenderSummary;
}

export const QUICK_ANALYSIS_SAMPLES: QuickAnalysisSample[] = [
  {
    slug: "evn-sap-rpa",
    filename: "EVN_SAP_RPA_2024-01.zip",
    summary: sampleEvn as TenderSummary,
  },
  {
    slug: "bezirkskliniken-iam",
    filename: "Bezirkskliniken_Schwaben_IAM_2024-09.zip",
    summary: sampleBezirk as TenderSummary,
  },
  {
    slug: "gvh-idp-saas",
    filename: "GVH_Identity_Provider_SaaS_2024-12.zip",
    summary: sampleGvh as TenderSummary,
  },
];

export function pickRandomSample(): QuickAnalysisSample {
  const idx = Math.floor(Math.random() * QUICK_ANALYSIS_SAMPLES.length);
  return QUICK_ANALYSIS_SAMPLES[idx]!;
}
