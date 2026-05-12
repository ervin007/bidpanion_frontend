"use client";

import { useState } from "react";
import React from "react";
import {
  CheckCircle2, XCircle, Clock, Loader2, AlertTriangle, Lock,
  CalendarDays, Link2, AlertCircle, Shield, Star, FileText,
  TrendingUp, Search, Upload
} from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-slate-800 border-b border-slate-200 pb-2">{title}</h2>
      {children}
    </div>
  );
}

function TokenRow({ name, value, preview }: { name: string; value: string; preview: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-8 h-8 rounded-md border border-slate-200 flex-shrink-0 overflow-hidden">{preview}</div>
      <div className="flex-1">
        <p className="text-slate-800 text-sm font-mono font-medium">{name}</p>
        <p className="text-slate-400 text-xs font-mono">{value}</p>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  const [tabDemo, setTabDemo] = useState(0);

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <h1 className="text-slate-900">Design System</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-xl">
          Bidpanion Design Tokens, Komponenten und UI-Patterns. Typografie: <strong>Plus Jakarta Sans</strong> (UI) + <strong>JetBrains Mono</strong> (Daten/Code).
        </p>
      </div>

      {/* ── Colors ── */}
      <Section title="Farb-Tokens">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-3">Brand</p>
            <div className="space-y-1">
              <TokenRow name="brand-600" value="#2563eb" preview={<div className="w-full h-full bg-blue-600" />} />
              <TokenRow name="brand-700" value="#1d4ed8" preview={<div className="w-full h-full bg-blue-700" />} />
              <TokenRow name="brand-50" value="#eff6ff" preview={<div className="w-full h-full bg-blue-50" />} />
            </div>
          </div>
          {/* Semantic */}
          <div>
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-3">Semantisch</p>
            <div className="space-y-1">
              <TokenRow name="fit-good" value="#059669" preview={<div className="w-full h-full bg-emerald-600" />} />
              <TokenRow name="fit-review" value="#d97706" preview={<div className="w-full h-full bg-amber-600" />} />
              <TokenRow name="fit-risk" value="#dc2626" preview={<div className="w-full h-full bg-red-600" />} />
            </div>
          </div>
          {/* Neutral */}
          <div>
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-3">Neutral (Slate)</p>
            <div className="space-y-1">
              <TokenRow name="slate-900" value="#0f172a" preview={<div className="w-full h-full bg-slate-900" />} />
              <TokenRow name="slate-600" value="#475569" preview={<div className="w-full h-full bg-slate-600" />} />
              <TokenRow name="slate-200" value="#e2e8f0" preview={<div className="w-full h-full bg-slate-200" />} />
              <TokenRow name="slate-50" value="#f8fafc" preview={<div className="w-full h-full bg-slate-50 border border-slate-100" />} />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Typography ── */}
      <Section title="Typografie">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div>
            <p className="text-slate-400 text-xs font-mono mb-1">h1 — Plus Jakarta Sans 700, 1.5rem</p>
            <h1 className="text-slate-900">Ausschreibungs-Pipeline</h1>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-mono mb-1">h2 — Plus Jakarta Sans 600, 1.25rem</p>
            <h2 className="text-slate-900">Tender Detail Ansicht</h2>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-mono mb-1">h3 — Plus Jakarta Sans 600, 1.05rem</p>
            <h3 className="text-slate-900">Abschnitt: Leistungsumfang</h3>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-mono mb-1">body/sm — Plus Jakarta Sans 400, 0.875rem</p>
            <p className="text-slate-700 text-sm">IT-Systembetreuung und 2nd-Level-Helpdesk für die gesamte IT-Infrastruktur des Ministeriums an zwei Standorten in Wien.</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-mono mb-1">mono — JetBrains Mono 400, 0.8125rem</p>
            <p className="font-mono text-sm text-slate-600">BMDW-2026-IT-0042 · CPV: 72253200-5 · 2026-02-26</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-mono mb-1">caption — Plus Jakarta Sans 400, 0.75rem</p>
            <p className="text-xs text-slate-400">Hochgeladen am 18.02.2026 von Lena Hofmann</p>
          </div>
        </div>
      </Section>

      {/* ── Status Badges ── */}
      <Section title="Status-Badges">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Workflow-Status</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Draft", cls: "bg-slate-100 text-slate-600 border-slate-200" },
                { label: "New", cls: "bg-blue-100 text-blue-700 border-blue-200" },
                { label: "In Review", cls: "bg-amber-100 text-amber-700 border-amber-200" },
                { label: "Bid", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                { label: "No-Bid", cls: "bg-red-100 text-red-700 border-red-200" },
                { label: "Submitted", cls: "bg-violet-100 text-violet-700 border-violet-200" },
                { label: "Won", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
                { label: "Lost", cls: "bg-slate-100 text-slate-500 border-slate-200" },
              ].map(s => (
                <span key={s.label} className={`inline-flex items-center px-2.5 py-1 rounded border text-xs font-semibold ${s.cls}`}>{s.label}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">KI-Verarbeitungsstatus</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Queued", icon: <Clock size={11} />, cls: "bg-slate-100 text-slate-500" },
                { label: "Processing", icon: <Loader2 size={11} className="animate-spin" />, cls: "bg-blue-100 text-blue-600" },
                { label: "Completed", icon: <CheckCircle2 size={11} />, cls: "bg-emerald-100 text-emerald-700" },
                { label: "Failed", icon: <XCircle size={11} />, cls: "bg-red-100 text-red-700" },
                { label: "Password Protected", icon: <Lock size={11} />, cls: "bg-amber-100 text-amber-700" },
              ].map(s => (
                <span key={s.label} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${s.cls}`}>{s.icon}{s.label}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Quellen-Badges</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "TED", cls: "bg-blue-700 text-white" },
                { label: "DTVP", cls: "bg-slate-700 text-white" },
                { label: "ANKÖ", cls: "bg-violet-600 text-white" },
                { label: "SIMAP", cls: "bg-teal-600 text-white" },
                { label: "Vergabe24", cls: "bg-orange-600 text-white" },
                { label: "eTendering", cls: "bg-cyan-600 text-white" },
              ].map(s => (
                <span key={s.label} className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold tracking-wide ${s.cls}`}>{s.label}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Deadline-Dringlichkeit</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                <AlertTriangle size={11} />2T — Kritisch (&lt;7 Tage)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                <Clock size={11} />10T — Bald (&lt;14 Tage)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                <CalendarDays size={11} />25T — Normal
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                <AlertCircle size={10} />Nicht gefunden
              </span>
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Fit-Score-Empfehlung</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Bid", score: 81, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                { label: "Review", score: 55, cls: "bg-amber-50 text-amber-700 border-amber-200" },
                { label: "No-Bid", score: 28, cls: "bg-red-50 text-red-700 border-red-200" },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${r.cls}`}>{r.label}</span>
                  <span className={`text-sm font-bold ${r.score >= 70 ? "text-emerald-600" : r.score >= 40 ? "text-amber-600" : "text-red-600"}`}>{r.score}/100</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Zitat-Chip</p>
            <div className="flex items-center gap-2">
              <span className="text-slate-700 text-sm">Einreichfrist: 26.02.2026, 12:00 Uhr CET</span>
              <button className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">
                <Link2 size={9} />Bekanntmachung, S.4
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Buttons ── */}
      <Section title="Schaltflächen & Aktionen">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Primär / Sekundär / Destruktiv</p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <Upload size={15} />PDF hochladen
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500">
                <Search size={15} />Suchen
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-red-500">
                Löschen
              </button>
              <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed">
                Deaktiviert
              </button>
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Fit-Score Aktionen</p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500">
                <CheckCircle2 size={15} />Bid bestätigen
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500">
                <XCircle size={15} />No-Bid
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── KPI Card ── */}
      <Section title="KPI-Karten">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Gesamt", value: "24", sub: "Ausschreibungen", icon: <FileText size={20} className="text-blue-600" />, accent: "bg-blue-50" },
            { label: "Aktive Gebote", value: "8", sub: "Bid + Eingereicht", icon: <TrendingUp size={20} className="text-emerald-600" />, accent: "bg-emerald-50" },
            { label: "In Prüfung", value: "6", sub: "Ausstehende Entscheidungen", icon: <Clock size={20} className="text-amber-600" />, accent: "bg-amber-50" },
            { label: "Ø Fit-Score", value: "67", sub: "Bewertete Ausschreibungen", icon: <Star size={20} className="text-violet-600" />, accent: "bg-violet-50" },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.accent}`}>{card.icon}</div>
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{card.label}</p>
                <p className="text-slate-900 text-2xl font-bold leading-tight">{card.value}</p>
                <p className="text-slate-500 text-xs">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Table row ── */}
      <Section title="Tabellenzeile — Beispiel">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Titel / Auftraggeber", "Quelle", "Deadline", "Status", "KI-Status", "Fit-Score"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap" scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Normal row */}
              <tr className="border-b border-slate-100 hover:bg-blue-50/40 cursor-pointer transition-colors">
                <td className="px-4 py-3"><div className="font-medium text-slate-900">IT-Systembetreuung und Helpdesk</div><div className="text-slate-500 text-xs">Bundesministerium für Digitalisierung</div></td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-700 text-white">DTVP</span></td>
                <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200"><AlertTriangle size={10} />3T</span></td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded border text-xs font-semibold bg-amber-100 text-amber-700 border-amber-200">In Review</span></td>
                <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle2 size={10} />Completed</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: "81%" }} /></div><span className="text-sm font-semibold text-emerald-700">81</span></div></td>
              </tr>
              {/* Skeleton row */}
              <tr className="border-b border-slate-100">
                {[280, 60, 80, 80, 100, 70].map((w, i) => (
                  <td key={i} className="px-4 py-3">
                    <div className="h-3.5 bg-slate-200 rounded animate-pulse" style={{ width: w }} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Tabs ── */}
      <Section title="Tab-Navigation">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex border-b border-slate-200 mb-5">
            {["Überblick", "Dokumente", "Brief", "Fit Score"].map((t, i) => (
              <button
                key={t}
                onClick={() => setTabDemo(i)}
                className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-sm font-medium transition-colors ${
                  tabDemo === i ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >{t}</button>
            ))}
          </div>
          <p className="text-slate-500 text-sm">Aktiver Tab: <span className="font-semibold text-slate-700">
            {["Überblick", "Dokumente", "Brief", "Fit Score"][tabDemo]}
          </span></p>
        </div>
      </Section>

      {/* ── UI States ── */}
      <Section title="UI-Zustände">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Error */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <XCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold text-sm">Fehler beim Laden</p>
                <p className="text-red-700 text-xs mt-0.5">Die Daten konnten nicht geladen werden. Bitte versuchen Sie es erneut.</p>
                <button className="mt-2 text-red-600 hover:text-red-700 text-xs font-semibold underline-offset-2 hover:underline">Erneut versuchen</button>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-semibold text-sm">Prüfung erforderlich</p>
                <p className="text-amber-700 text-xs mt-0.5">2 extrahierte Felder konnten nicht mit Sicherheit zugeordnet werden.</p>
              </div>
            </div>
          </div>

          {/* Profile incomplete */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-600 font-semibold text-sm">Firmenprofil unvollständig</p>
                <p className="text-slate-500 text-xs mt-0.5">Kategorie „Kapazität&ldquo;: <em>N/A – Profil unvollständig</em>. Fit-Score-Berechnung eingeschränkt.</p>
              </div>
            </div>
          </div>

          {/* Session ended */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Lock size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold text-sm">Sitzung beendet</p>
                <p className="text-red-700 text-xs mt-0.5">Anmeldung auf einem anderen Gerät erkannt. Bitte erneut anmelden.</p>
              </div>
            </div>
          </div>

          {/* Deadline missing */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <CalendarDays size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-semibold text-sm">Deadline: Nicht gefunden</p>
                <p className="text-amber-700 text-xs mt-0.5">Kein Datum im Dokument erkannt. Fit-Score-Berechnung gesperrt bis Datum manuell eingetragen.</p>
                <button className="mt-2 px-2.5 py-1 border border-amber-300 text-amber-700 rounded text-xs font-medium hover:bg-amber-100">Datum manuell eingeben</button>
              </div>
            </div>
          </div>

          {/* Processing progress */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Loader2 size={18} className="text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
              <div className="flex-1">
                <p className="text-blue-800 font-semibold text-sm">Verarbeitung läuft…</p>
                <p className="text-blue-700 text-xs mt-0.5 mb-2">Leistungsbeschreibung.pdf wird analysiert (65%)</p>
                <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-2/3 transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}