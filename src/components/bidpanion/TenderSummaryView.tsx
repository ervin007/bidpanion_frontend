"use client";

import type { ReactNode } from "react";
import { FileText, Link2 } from "lucide-react";
import type { TenderSummary } from "@/data/tender-summary-schema";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-slate-800 font-semibold text-sm">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-3 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
      <dt className="text-slate-500 text-xs font-semibold uppercase tracking-wider sm:min-w-[200px] flex-shrink-0">
        {label}
      </dt>
      <dd className="text-slate-900 whitespace-pre-wrap leading-relaxed">{value}</dd>
    </div>
  );
}

function ListField({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
      <dt className="text-slate-500 text-xs font-semibold uppercase tracking-wider sm:min-w-[200px] flex-shrink-0">
        {label}
      </dt>
      <dd className="text-slate-900 flex-1">
        <ul className="space-y-1 list-disc list-inside marker:text-slate-300">
          {items.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

export function TenderSummaryView({ summary }: { summary: TenderSummary }) {
  const scope = summary["Scope & Requirements"];
  const elig = summary["Supplier Eligibility"];
  const econ = elig["Economic & Financial Standing"];
  const legal = elig["Legal & Registration"];
  const tech = summary["Technical & Professional Ability"];

  return (
    <div className="space-y-4">
      <Section title="Headline">
        <Field label="Contracting Authority" value={summary["Contracting Authority"]} />
        <Field label="Project Description" value={summary["Project Description"]} />
        <Field label="Submission Deadline" value={summary["Submission Deadline"]} />
        <Field label="Important Dates" value={summary["Important Dates"]} />
      </Section>

      <Section title="Scope & Requirements">
        <Field label="Scope" value={scope["Scope & Requirements"]} />
        <Field label="Contract Volume" value={scope["Contract Volume"]} />
        <Field label="Place of Performance" value={scope["Place of Performance"]} />
        <Field label="Standards & Certifications" value={scope["Standards & Certifications"]} />
        <Field label="Subcontracting & Consortia" value={scope["Subcontracting & Consortia"]} />
        <Field label="Forms & e-Submission" value={scope["Forms & e-Submission"]} />
      </Section>

      <Section title="Supplier Eligibility">
        <ListField label="Offer Submission Documents" items={elig["Offer Submission Documents"]} />
        <ListField label="List of Documents" items={elig["List of Documents"]} />
        {econ && (
          <>
            <Field label="Minimum Turnover" value={econ["Minimum Turnover"]} />
            <Field
              label="Turnover in Comparable Services"
              value={econ["Turnover in Comparable Services"]}
            />
          </>
        )}
        {legal && (
          <>
            <Field
              label="Trade/Professional Register Entry"
              value={legal["Trade/Professional Register Entry"]}
            />
            <Field
              label="Self-declarations"
              value={legal["Self-declarations (GWB §§123/124 or equivalent)"]}
            />
            <Field
              label="Subcontractor Identification & Reliance"
              value={legal["Subcontractor Identification & Reliance"]}
            />
          </>
        )}
      </Section>

      {tech && (
        <Section title="Technical & Professional Ability">
          <Field label="Personnel Profiles" value={tech["Personnel Profiles"]} />
          <Field label="Headcount / Staffing" value={tech["Headcount / Staffing"]} />
          <Field label="Reference Projects" value={tech["Reference Projects"]} />
        </Section>
      )}

      {summary["Company Referrals"] && (
        <Section title="Company Referrals">
          <p className="whitespace-pre-wrap leading-relaxed">{summary["Company Referrals"]}</p>
        </Section>
      )}

      <Section title="Award Criteria">
        <p className="whitespace-pre-wrap leading-relaxed">{summary["Award Criteria"]}</p>
      </Section>

      {summary.citations.length > 0 && (
        <Section title="Citations">
          <ul className="space-y-2">
            {summary.citations.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <Link2 size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-slate-700">{c.field}</span>
                  <span className="text-slate-400 mx-1.5">→</span>
                  <span className="font-mono text-slate-600 break-all">{c.locator}</span>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <p className="text-xs text-slate-400 text-center pt-2">
        <FileText size={11} className="inline mb-0.5 mr-1" />
        Generated by the AI tender-analysis pipeline. Verify critical details against source documents.
      </p>
    </div>
  );
}
