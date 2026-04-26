"use client";

import { useState } from "react";
import React from "react";
import {
  Users, UserPlus, MoreHorizontal, Check, X, Mail,
  Edit3, Trash2, RefreshCw, Clock, CheckCircle2,
  AlertTriangle, ChevronDown, Archive
} from "lucide-react";
import { MOCK_TEAM, MOCK_DELETED_TENDERS } from "@/data/bidpanion";
import type { TeamMember, UserRole, MemberStatus } from "@/data/bidpanion";

const ROLE_COLORS: Record<UserRole, string> = {
  Admin: "bg-violet-100 text-violet-700 border-violet-200",
  "Bid Manager": "bg-blue-100 text-blue-700 border-blue-200",
  Analyst: "bg-teal-100 text-teal-700 border-teal-200",
  Viewer: "bg-slate-100 text-slate-600 border-slate-200",
};
const STATUS_COLORS: Record<MemberStatus, string> = {
  Active: "text-emerald-600",
  Pending: "text-amber-500",
  Deactivated: "text-slate-400",
};
const STATUS_ICONS: Record<MemberStatus, React.ReactNode> = {
  Active: <CheckCircle2 size={12} />,
  Pending: <Clock size={12} />,
  Deactivated: <X size={12} />,
};

const ROLES: UserRole[] = ["Admin", "Bid Manager", "Analyst", "Viewer"];

// ── Invite dialog ─────────────────────────────────────────────────────────
function InviteDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Bid Manager");
  const [sent, setSent] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="invite-title">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 id="invite-title" className="text-slate-900">Mitglied einladen</h3>
          <button onClick={onClose} className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Schließen">
            <X size={16} />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-8 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-slate-900 mb-1">Einladung gesendet!</h3>
            <p className="text-slate-500 text-sm">Eine Einladungs-E-Mail wurde an <strong>{email}</strong> gesendet.</p>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="px-6 py-5 space-y-4">
            <div>
              <label htmlFor="invite-email" className="text-slate-700 mb-1.5 block">E-Mail-Adresse</label>
              <input
                id="invite-email"
                type="email"
                placeholder="kollegin@firma.de"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="invite-role" className="text-slate-700 mb-1.5 block">Rolle zuweisen</label>
              <select
                id="invite-role"
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-blue-800 text-xs font-semibold mb-1">Rollenberechtigungen</p>
              <ul className="text-blue-700 text-xs space-y-0.5">
                {role === "Admin" && <><li>• Vollzugriff auf alle Funktionen</li><li>• Team- und Profilmanagement</li><li>• Löschen von Ausschreibungen</li></>}
                {role === "Bid Manager" && <><li>• Ausschreibungen verwalten und hochladen</li><li>• Bid/No-Bid-Entscheidungen treffen</li><li>• Briefs bearbeiten</li></>}
                {role === "Analyst" && <><li>• Ausschreibungen lesen und kommentieren</li><li>• Korrekturen im Brief hinzufügen</li><li>• Fit-Score-Feedback geben</li></>}
                {role === "Viewer" && <><li>• Nur Lesen</li><li>• Keine Bearbeitungsrechte</li></>}
              </ul>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400">Abbrechen</button>
              <button type="submit" disabled={!email} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <Mail size={14} />Einladung senden
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Remove member dialog ──────────────────────────────────────────────────
function RemoveMemberDialog({ member, onClose, onConfirm }: { member: TeamMember; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-slate-900 mb-1">Mitglied entfernen?</h3>
            <p className="text-slate-500 text-sm"><strong>{member.name}</strong> wird aus dem Workspace entfernt. Zugewiesene Ausschreibungen bleiben erhalten.</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400">Abbrechen</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500">Entfernen</button>
        </div>
      </div>
    </div>
  );
}

// ── Deleted tenders view ──────────────────────────────────────────────────
function DeletedTendersView() {
  const [restored, setRestored] = useState<Set<string>>(new Set());

  const getDaysLeft = (deletedAt: string) => {
    const days30Later = new Date(deletedAt).getTime() + 30 * 24 * 60 * 60 * 1000;
    return Math.ceil((days30Later - Date.now()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-800">Gelöschte Ausschreibungen</h3>
            <p className="text-slate-500 text-xs mt-0.5">Ausschreibungen können innerhalb von 30 Tagen nach der Löschung wiederhergestellt werden.</p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">{MOCK_DELETED_TENDERS.length} Einträge</span>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {MOCK_DELETED_TENDERS.map(t => {
          const daysLeft = t.deletedAt ? getDaysLeft(t.deletedAt) : 30;
          const isRestored = restored.has(t.id);
          return (
            <div key={t.id} className={`flex items-center gap-4 px-5 py-4 ${isRestored ? "bg-emerald-50" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isRestored ? "text-emerald-700" : "text-slate-700"}`}>{t.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{t.authority} · Gelöscht am {t.deletedAt ? new Date(t.deletedAt).toLocaleDateString("de-DE") : "–"}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs font-medium ${daysLeft <= 7 ? "text-red-600" : daysLeft <= 14 ? "text-amber-600" : "text-slate-500"}`}>
                  Noch {daysLeft}T
                </span>
                {isRestored ? (
                  <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                    <CheckCircle2 size={13} />Wiederhergestellt
                  </span>
                ) : (
                  <button
                    onClick={() => setRestored(r => new Set([...r, t.id]))}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-300 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <RefreshCw size={12} />Wiederherstellen
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Member row ─────────────────────────────────────────────────────────────
function MemberRow({ member, onRemove }: { member: TeamMember; onRemove: () => void }) {
  const [role, setRole] = useState<UserRole>(member.role);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = member.name.split(" ").map(n => n[0]).join("").toUpperCase();

  const avatarColors = ["bg-blue-500", "bg-violet-500", "bg-teal-500", "bg-amber-500", "bg-rose-500"];
  const colorIdx = member.name.charCodeAt(0) % avatarColors.length;

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${avatarColors[colorIdx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {initials}
          </div>
          <div>
            <p className="text-slate-800 text-sm font-medium">{member.name}</p>
            <p className="text-slate-400 text-xs">{member.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            aria-haspopup="listbox"
            aria-expanded={roleMenuOpen}
          >
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold ${ROLE_COLORS[role]}`}>{role}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
          {roleMenuOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-[140px]" role="listbox">
              {ROLES.map(r => (
                <button
                  key={r}
                  role="option"
                  aria-selected={role === r}
                  onClick={() => { setRole(r); setRoleMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 ${role === r ? "text-blue-600 font-semibold" : "text-slate-700"}`}
                >
                  {role === r && <Check size={11} />}
                  {role !== r && <span className="w-3" />}
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${STATUS_COLORS[member.status]}`}>
          {STATUS_ICONS[member.status]}
          {member.status}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-slate-500 text-xs font-mono">
          {member.lastActive === "-" ? (
            <span className="text-slate-300 italic">Noch nicht aktiv</span>
          ) : (
            new Date(member.lastActive).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
          )}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Mitglied-Optionen"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
              <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <Edit3 size={13} />Profil bearbeiten
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <Mail size={13} />Erneut einladen
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={() => { setMenuOpen(false); onRemove(); }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={13} />Entfernen
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
type TeamTab = "members" | "deleted";

export default function TeamManagementPage() {
  const [teamTab, setTeamTab] = useState<TeamTab>("members");
  const [members, setMembers] = useState(MOCK_TEAM);
  const [showInvite, setShowInvite] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  const handleRemove = (member: TeamMember) => setRemoveTarget(member);
  const confirmRemove = () => {
    if (removeTarget) {
      setMembers(m => m.filter(x => x.id !== removeTarget.id));
      setRemoveTarget(null);
    }
  };

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-slate-900">Team-Verwaltung</h1>
            <p className="text-slate-500 text-sm mt-0.5">Acme GmbH — {members.length} Mitglieder</p>
          </div>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <UserPlus size={15} />Mitglied einladen
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {([
          { id: "members" as TeamTab, label: "Mitglieder", icon: <Users size={14} />, count: members.length },
          { id: "deleted" as TeamTab, label: "Papierkorb", icon: <Archive size={14} />, count: MOCK_DELETED_TENDERS.length },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTeamTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
              teamTab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
            role="tab"
            aria-selected={teamTab === t.id}
          >
            {t.icon}{t.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${teamTab === t.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {teamTab === "members" && (
        <>
          {/* Pending invitations notice */}
          {members.some(m => m.status === "Pending") && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
              <p className="text-amber-800 text-sm">
                {members.filter(m => m.status === "Pending").length} ausstehende Einladung(en). Diese Mitglieder haben noch keinen Zugang zum Workspace.
              </p>
            </div>
          )}

          {/* Member table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table" aria-label="Team-Mitglieder">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" scope="col">Mitglied</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" scope="col">Rolle</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" scope="col">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" scope="col">Zuletzt aktiv</th>
                    <th className="w-12" scope="col" aria-label="Aktionen"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map(member => (
                    <MemberRow key={member.id} member={member} onRemove={() => handleRemove(member)} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-slate-400 text-xs">
                {members.filter(m => m.status === "Active").length} aktiv ·{" "}
                {members.filter(m => m.status === "Pending").length} ausstehend ·{" "}
                {members.filter(m => m.status === "Deactivated").length} deaktiviert
              </p>
            </div>
          </div>

          {/* Role overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(["Admin", "Bid Manager", "Analyst", "Viewer"] as UserRole[]).map(r => {
              const count = members.filter(m => m.role === r).length;
              return (
                <div key={r} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold ${ROLE_COLORS[r]}`}>{r}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-slate-500 text-xs mt-0.5">Mitglied{count !== 1 ? "er" : ""}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {teamTab === "deleted" && <DeletedTendersView />}

      {/* Dialogs */}
      {showInvite && <InviteDialog onClose={() => setShowInvite(false)} />}
      {removeTarget && (
        <RemoveMemberDialog
          member={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onConfirm={confirmRemove}
        />
      )}
    </div>
  );
}