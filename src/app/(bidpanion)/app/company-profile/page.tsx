"use client";

import { useState } from "react";
import {
  Lock, AlertCircle, CheckCircle2, Save, Plus, X,
  Clock, ChevronDown, AlertTriangle, History, Building2
} from "lucide-react";
import { COMPANY_PROFILE_SECTIONS, FIT_WEIGHTS } from "@/data/bidpanion";
import type { CompanyProfileSection } from "@/data/bidpanion";

// ── Completeness bar ──────────────────────────────────────────────────────
function CompletenessBar({ sections }: { sections: CompanyProfileSection[] }) {
  const avg = Math.round(sections.reduce((a, b) => a + b.completion, 0) / sections.length);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-slate-800">Profilstatus</h3>
          <p className="text-slate-500 text-xs mt-0.5">Vollständigkeit beeinflusst die Qualität der Fit-Score-Berechnungen.</p>
        </div>
        <span className={`text-2xl font-bold ${avg >= 80 ? "text-emerald-600" : avg >= 50 ? "text-amber-500" : "text-red-600"}`}>{avg}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all ${avg >= 80 ? "bg-emerald-500" : avg >= 50 ? "bg-amber-400" : "bg-red-500"}`}
          style={{ width: `${avg}%` }}
        />
      </div>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
        {sections.map(s => (
          <div key={s.id} className="flex flex-col items-center gap-1">
            <div
              className={`w-full h-1.5 rounded-full ${s.completion >= 80 ? "bg-emerald-500" : s.completion >= 50 ? "bg-amber-400" : "bg-red-400"}`}
            />
            <span className="text-slate-400 text-xs truncate w-full text-center leading-tight hidden md:block" style={{ fontSize: "9px" }}>{s.label.split(" ")[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Fit weight editor ─────────────────────────────────────────────────────
function FitWeightEditor() {
  const [weights, setWeights] = useState(FIT_WEIGHTS.map(w => ({ ...w })));
  const [saved, setSaved] = useState(false);
  const total = weights.reduce((a, b) => a + b.weight, 0);
  const isValid = total === 100;

  const update = (id: string, val: number) => {
    setWeights(ws => ws.map(w => w.id === id ? { ...w, weight: Math.max(0, Math.min(100, val)) } : w));
    setSaved(false);
  };

  const handleSave = () => {
    if (isValid) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-800">Fit-Gewichtungen</h3>
          <p className="text-slate-500 text-xs mt-0.5">Definieren Sie, welche Kategorien für Ihre Bid-Entscheidungen am wichtigsten sind.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
            isValid ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {total} / 100 %
          </span>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
          >
            {saved ? <><CheckCircle2 size={14} />Gespeichert</> : <><Save size={14} />Speichern</>}
          </button>
        </div>
      </div>

      {!isValid && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">Die Gewichtungen müssen in Summe genau 100 % ergeben (aktuell: {total} %).</p>
        </div>
      )}

      <div className="space-y-3">
        {weights.map(w => (
          <div key={w.id} className="flex items-center gap-4">
            <span className="text-slate-700 text-sm min-w-[140px]">{w.label}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${w.weight}%` }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => update(w.id, w.weight - 5)}
                className="w-6 h-6 rounded border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 text-xs"
                aria-label={`${w.label} verringern`}
              >-</button>
              <input
                type="number"
                value={w.weight}
                onChange={e => update(w.id, parseInt(e.target.value) || 0)}
                min={0} max={100}
                className="w-14 text-center border border-slate-300 rounded-md py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`${w.label} Gewichtung`}
              />
              <span className="text-slate-400 text-sm">%</span>
              <button
                onClick={() => update(w.id, w.weight + 5)}
                className="w-6 h-6 rounded border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 text-xs"
                aria-label={`${w.label} erhöhen`}
              >+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile lock banner ───────────────────────────────────────────────────
function ProfileLockBanner({ locked, lockUser }: { locked: boolean; lockUser?: string }) {
  if (!locked) return null;
  return (
    <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-4">
      <Lock size={16} className="text-amber-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-amber-800 text-sm font-semibold">Profil wird gerade bearbeitet</p>
        <p className="text-amber-700 text-xs mt-0.5">Derzeit bearbeitet von <strong>{lockUser}</strong>. Bitte warten Sie oder fordern Sie den Zugriff an.</p>
      </div>
      <button className="px-3 py-1.5 border border-amber-300 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500">
        Zugriff anfordern
      </button>
    </div>
  );
}

// ── Version history ───────────────────────────────────────────────────────
function VersionHistory() {
  const [open, setOpen] = useState(false);
  const versions = [
    { version: "v3", date: "23.02.2026, 09:15", user: "Lena Hofmann", change: "Zertifizierungen aktualisiert, ITIL v4 hinzugefügt" },
    { version: "v2", date: "15.01.2026, 14:30", user: "Markus Bauer", change: "Geographie-Profil auf DACH erweitert" },
    { version: "v1", date: "02.12.2025, 11:00", user: "Lena Hofmann", change: "Erstanlage des Firmenprofils" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          <History size={15} className="text-slate-500" />
          <h3 className="text-slate-800">Versionshistorie</h3>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">{versions.length} Versionen</span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {versions.map(v => (
            <div key={v.version} className="flex items-start gap-4 px-5 py-3">
              <span className="font-mono text-xs text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">{v.version}</span>
              <div className="flex-1 min-w-0">
                <p className="text-slate-700 text-sm">{v.change}</p>
                <p className="text-slate-400 text-xs mt-0.5">{v.user} · {v.date}</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-xs font-medium focus-visible:ring-2 focus-visible:ring-blue-500 rounded flex-shrink-0">
                Wiederherstellen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section editors ───────────────────────────────────────────────────────
function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) { onChange([...values, trimmed]); setInput(""); }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map(v => (
          <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
            {v}
            <button onClick={() => onChange(values.filter(x => x !== v))} className="hover:text-red-500 focus-visible:ring-1 focus-visible:ring-red-400 rounded-full" aria-label={`${v} entfernen`}>
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? "Hinzufügen…"}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
        />
        <button
          onClick={add}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Hinzufügen"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

type SectionData = Record<string, string[]>;

function SectionEditor({ section, data, onChange, locked }: {
  section: CompanyProfileSection;
  data: SectionData;
  onChange: (d: SectionData) => void;
  locked: boolean;
}) {
  const fields: { key: string; label: string; placeholder: string }[] =
    section.id === "services" ? [
      { key: "primary", label: "Kernleistungen", placeholder: "z.B. IT-Helpdesk, Cloud Infrastructure" },
      { key: "secondary", label: "Ergänzende Leistungen", placeholder: "z.B. Schulungen, Beratung" },
    ]
    : section.id === "certifications" ? [
      { key: "certs", label: "Zertifizierungen", placeholder: "z.B. ISO 27001, ITIL v4" },
      { key: "expiry", label: "Ablaufdaten (Format: Zertifikat:JJJJ-MM)", placeholder: "z.B. ISO 27001:2027-04" },
    ]
    : section.id === "geography" ? [
      { key: "countries", label: "Länder (ISO 3166-1)", placeholder: "z.B. DE, AT, CH" },
      { key: "regions", label: "Regionen / Bundesländer", placeholder: "z.B. Bayern, Wien, Zürich" },
    ]
    : section.id === "languages" ? [
      { key: "languages", label: "Sprachen (ISO 639-1)", placeholder: "z.B. de, en, fr" },
      { key: "levels", label: "Niveaus (Format: Sprache:Niveau)", placeholder: "z.B. de:C2, en:B2" },
    ]
    : [
      { key: "values", label: `${section.label}`, placeholder: "Einträge hinzufügen…" },
    ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${section.completion >= 80 ? "bg-emerald-500" : section.completion >= 50 ? "bg-amber-400" : "bg-red-400"}`} />
        <span className="text-slate-500">{section.completion}% vollständig</span>
        {section.completion < 50 && (
          <span className="flex items-center gap-1 text-amber-600 text-xs"><AlertTriangle size={11} />Unvollständig – beeinträchtigt Fit-Score</span>
        )}
      </div>

      {fields.map(field => (
        <div key={field.key}>
          <label className="text-slate-700 mb-2 block">{field.label}</label>
          {locked ? (
            <div className="flex flex-wrap gap-1.5">
              {(data[field.key] ?? []).map(v => (
                <span key={v} className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs">{v}</span>
              ))}
              {(data[field.key]?.length ?? 0) === 0 && (
                <span className="text-slate-400 text-xs italic">Keine Einträge</span>
              )}
            </div>
          ) : (
            <TagInput
              values={data[field.key] ?? []}
              onChange={vals => onChange({ ...data, [field.key]: vals })}
              placeholder={field.placeholder}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function CompanyProfilePage() {
  const [activeSection, setActiveSection] = useState("services");
  const [locked] = useState(false);
  const [sectionData, setSectionData] = useState<Record<string, SectionData>>({
    services: { primary: ["IT-Helpdesk & Support", "Cloud Infrastructure", "DevOps", "IT-Consulting", "Cybersecurity"], secondary: ["ERP-Implementierung", "Change Management", "Schulungen"] },
    industries: { values: ["Öffentliche Verwaltung (O84)", "IT-Dienstleistungen (J62)", "Finanzdienstleistungen (K64)"] },
    geography: { countries: ["DE", "AT", "CH"], regions: ["Bayern", "Baden-Württemberg", "Wien", "Zürich"] },
    languages: { languages: ["de", "en", "fr"], levels: ["de:C2", "en:B2", "fr:A2"] },
    certifications: { certs: ["ISO 9001", "Microsoft Silver Partner IT Infrastructure", "ITIL v4 Foundation"], expiry: ["ISO 9001:2027-03", "Microsoft Silver:2026-06"] },
    security: { values: ["DSGVO-konform", "EU-Hosting", "ISO 27001 (in Vorbereitung)", "Auftragsverarbeitungsvertrag"] },
    delivery: { values: ["Vor-Ort", "Remote", "Hybrid", "Managed Service"] },
    capacity: { values: ["ca. 50 FTE IT-Consulting", "max. 5.000 PT / Jahr", "verfügbare FTE Q2/2026: ~15"] },
    commercial: { values: ["Zahlungsziel: 30 Tage", "Skonto: 2% bei 10 Tagen", "SEPA-Lastschrift möglich"] },
    references: { values: ["Bundesministerium Wien (2022–2025)", "Bayerische Landesbank (2023–laufend)", "Stadt Frankfurt (2021–2023)"] },
  });
  const [saved, setSaved] = useState(false);

  const sections = COMPANY_PROFILE_SECTIONS;
  const current = (sections.find(s => s.id === activeSection) ?? sections[0])!;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-slate-900">Firmenprofil</h1>
            <p className="text-slate-500 text-sm mt-0.5">Acme GmbH — Verwaltet von Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Clock size={13} />Zuletzt geändert: 23.02.2026, 09:15
          </div>
          {!locked && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {saved ? <><CheckCircle2 size={14} />Gespeichert</> : <><Save size={14} />Änderungen speichern</>}
            </button>
          )}
        </div>
      </div>

      <ProfileLockBanner locked={locked} lockUser="Markus Bauer" />
      <CompletenessBar sections={sections} />

      {/* Main editor layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left nav */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Abschnitte</p>
            </div>
            <nav className="py-1" aria-label="Profilabschnitte">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    activeSection === s.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                  aria-current={activeSection === s.id ? "true" : undefined}
                >
                  <span className="truncate">{s.label}</span>
                  <span className={`flex-shrink-0 ml-2 text-xs font-medium ${
                    s.completion >= 80 ? "text-emerald-600" : s.completion >= 50 ? "text-amber-500" : "text-red-500"
                  }`}>
                    {s.completion}%
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-slate-900">{current.label}</h2>
                {locked && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Lock size={12} className="text-amber-500" />
                    <span className="text-amber-600 text-xs">Nur-Lesen (Profil gesperrt)</span>
                  </div>
                )}
              </div>
              {!locked && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Save size={13} />Abschnitt speichern
                </button>
              )}
            </div>
            <SectionEditor
              section={current}
              data={sectionData[activeSection] ?? {}}
              onChange={d => setSectionData(sd => ({ ...sd, [activeSection]: d }))}
              locked={locked}
            />
          </div>

          <FitWeightEditor />
          <VersionHistory />
        </div>
      </div>

      {/* Unsupported language warning example */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-amber-800 text-sm font-semibold">Nicht unterstützte Sprache erkannt</p>
          <p className="text-amber-700 text-xs mt-0.5">
            Eine Ausschreibung enthält Dokumente auf Rumänisch (ro). Bidpanion unterstützt derzeit Deutsch (de), Englisch (en), Französisch (fr) und Italienisch (it). Die Brief-Extraktion kann unvollständig sein.
          </p>
        </div>
      </div>
    </div>
  );
}
