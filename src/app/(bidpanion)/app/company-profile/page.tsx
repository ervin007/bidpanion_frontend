"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Save,
  Plus,
  X,
  Building2,
  Loader2,
} from "lucide-react";
import { api } from "@/trpc/react";

type SectionData = Record<string, string[] | string>;

interface SectionMeta {
  id: string;
  slug: string;
  label: string;
  data: Record<string, unknown>;
  completion: number;
  updatedAt: Date;
}

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
}

const FIELD_DEFS: Record<string, FieldDef[]> = {
  services: [
    { key: "primary", label: "Core Services", placeholder: "IT Helpdesk, Cloud Infrastructure…" },
    { key: "secondary", label: "Supporting Services", placeholder: "Training, Consulting…" },
  ],
  industries: [
    { key: "values", label: "Industries / NACE codes", placeholder: "Public Administration (O84)…" },
  ],
  geography: [
    { key: "countries", label: "Countries (ISO 3166-1)", placeholder: "DE, AT, CH" },
    { key: "regions", label: "Regions / States", placeholder: "Bavaria, Vienna, Zürich" },
  ],
  languages: [
    { key: "languages", label: "Languages (ISO 639-1)", placeholder: "de, en, fr" },
    { key: "levels", label: "Proficiency levels", placeholder: "de:C2, en:B2, fr:A2" },
  ],
  delivery: [
    { key: "values", label: "Delivery Models", placeholder: "On-site, Remote, Hybrid…" },
  ],
  certifications: [
    { key: "certs", label: "Certifications", placeholder: "ISO 27001, ITIL v4…" },
    { key: "expiry", label: "Expiry (cert:YYYY-MM)", placeholder: "ISO 27001:2027-04" },
  ],
  security: [
    { key: "values", label: "Security & Data Protection", placeholder: "GDPR-compliant, EU hosting…" },
  ],
  capacity: [
    { key: "values", label: "Capacity", placeholder: "50 FTE consulting, 5,000 PD/year…" },
  ],
  commercial: [
    { key: "values", label: "Commercial Terms", placeholder: "Net 30, 2% early-pay discount…" },
  ],
  references: [
    { key: "values", label: "Reference Projects", placeholder: "Federal Ministry Vienna (2022–2025)…" },
  ],
};

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  return [];
}

function CompletenessBar({ sections }: { sections: SectionMeta[] }) {
  if (sections.length === 0) return null;
  const avg = Math.round(
    sections.reduce((a, b) => a + b.completion, 0) / sections.length,
  );
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-slate-800">Profile completeness</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            More complete profiles produce more accurate fit-score calculations.
          </p>
        </div>
        <span
          className={`text-2xl font-bold ${
            avg >= 80
              ? "text-emerald-600"
              : avg >= 50
              ? "text-amber-500"
              : "text-red-600"
          }`}
        >
          {avg}%
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all ${
            avg >= 80
              ? "bg-emerald-500"
              : avg >= 50
              ? "bg-amber-400"
              : "bg-red-500"
          }`}
          style={{ width: `${avg}%` }}
        />
      </div>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
        {sections.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-1">
            <div
              className={`w-full h-1.5 rounded-full ${
                s.completion >= 80
                  ? "bg-emerald-500"
                  : s.completion >= 50
                  ? "bg-amber-400"
                  : "bg-red-400"
              }`}
            />
            <span
              className="text-slate-400 text-xs truncate w-full text-center leading-tight hidden md:block"
              style={{ fontSize: "9px" }}
            >
              {s.label.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FitWeights({
  weights,
}: {
  weights: { slug: string; label: string; weight: number }[];
}) {
  const total = weights.reduce((a, b) => a + b.weight, 0);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-800">Fit-score weights</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            The weight each profile dimension carries when scoring a tender against your
            company.
          </p>
        </div>
        <span className="text-sm font-bold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
          {total} / 100 %
        </span>
      </div>
      <div className="space-y-3">
        {weights.map((w) => (
          <div key={w.slug} className="flex items-center gap-4">
            <span className="text-slate-700 text-sm min-w-[140px]">{w.label}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${w.weight}%` }}
              />
            </div>
            <span className="text-slate-500 text-sm font-mono w-12 text-right">
              {w.weight}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput("");
    }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium"
          >
            {v}
            <button
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="hover:text-red-500 focus-visible:ring-1 focus-visible:ring-red-400 rounded-full"
              aria-label={`Remove ${v}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? "Add an entry…"}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
        />
        <button
          onClick={add}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Add"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function CompanyProfilePage() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const utils = api.useUtils();
  const workspace = api.workspace.current.useQuery();
  const profile = api.companyProfile.get.useQuery();
  const updateSection = api.companyProfile.updateSection.useMutation({
    onSuccess: () => {
      utils.companyProfile.get.invalidate();
      setSaveError(null);
    },
    onError: (err) => setSaveError(err.message),
  });

  const sections: SectionMeta[] = useMemo(() => {
    return (profile.data?.sections ?? []).map((s) => ({
      id: s.id,
      slug: s.slug,
      label: s.label,
      data: s.data ?? {},
      completion: s.completion,
      updatedAt: new Date(s.updatedAt),
    }));
  }, [profile.data]);

  useEffect(() => {
    if (!activeSlug && sections.length > 0) {
      setActiveSlug(sections[0]!.slug);
    }
  }, [activeSlug, sections]);

  const current = sections.find((s) => s.slug === activeSlug);

  useEffect(() => {
    if (current) setDraft(current.data ?? {});
  }, [current?.id]);

  const fields: FieldDef[] = current ? FIELD_DEFS[current.slug] ?? [
    { key: "values", label: current.label, placeholder: "Add entries…" },
  ] : [];

  const isDirty = current
    ? JSON.stringify(draft) !== JSON.stringify(current.data ?? {})
    : false;

  function handleSave() {
    if (!current) return;
    updateSection.mutate({ slug: current.slug, data: draft });
  }

  if (profile.isLoading) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-slate-900">Company Profile</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {workspace.data?.name ?? "Workspace"}
            </p>
          </div>
        </div>
      </div>

      <CompletenessBar sections={sections} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
                Sections
              </p>
            </div>
            <nav className="py-1" aria-label="Profile sections">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlug(s.slug)}
                  className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    activeSlug === s.slug
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                  aria-current={activeSlug === s.slug ? "true" : undefined}
                >
                  <span className="truncate">{s.label}</span>
                  <span
                    className={`flex-shrink-0 ml-2 text-xs font-medium ${
                      s.completion >= 80
                        ? "text-emerald-600"
                        : s.completion >= 50
                        ? "text-amber-500"
                        : "text-red-500"
                    }`}
                  >
                    {s.completion}%
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {current && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-slate-900">{current.label}</h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Last updated{" "}
                    {current.updatedAt.toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={!isDirty || updateSection.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {updateSection.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving…
                    </>
                  ) : updateSection.isSuccess && !isDirty ? (
                    <>
                      <CheckCircle2 size={14} />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save changes
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-5">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="text-slate-700 mb-2 block">{field.label}</label>
                    <TagInput
                      values={toStringArray(draft[field.key])}
                      onChange={(vals) =>
                        setDraft((d) => ({ ...d, [field.key]: vals }))
                      }
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>

              {saveError && (
                <div className="flex items-start gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{saveError}</p>
                </div>
              )}
            </div>
          )}

          {profile.data && (
            <FitWeights weights={[...profile.data.fitWeights]} />
          )}
        </div>
      </div>
    </div>
  );
}
