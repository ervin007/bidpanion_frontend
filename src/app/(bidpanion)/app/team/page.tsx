"use client";

import { useState } from "react";
import React from "react";
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Check,
  X,
  Mail,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Archive,
  Loader2,
} from "lucide-react";
import { api, type RouterOutputs } from "@/trpc/react";
import {
  MEMBER_STATUS_LABEL,
  ROLE_LABEL,
  WORKSPACE_ROLES,
} from "@/lib/bidpanion-labels";
import type { WorkspaceRole } from "@/generated/prisma";

type MemberRow = RouterOutputs["team"]["listMembers"][number];
type InviteRow = RouterOutputs["team"]["listInvitations"][number];
type TrashRow = RouterOutputs["tender"]["trash"][number];

const ROLE_COLORS: Record<WorkspaceRole, string> = {
  ADMIN: "bg-violet-100 text-violet-700 border-violet-200",
  BID_MANAGER: "bg-blue-100 text-blue-700 border-blue-200",
  ANALYST: "bg-teal-100 text-teal-700 border-teal-200",
  VIEWER: "bg-slate-100 text-slate-600 border-slate-200",
};

function InviteDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("BID_MANAGER");

  const utils = api.useUtils();
  const invite = api.team.invite.useMutation({
    onSuccess: () => {
      utils.team.listMembers.invalidate();
      utils.team.listInvitations.invalidate();
      onClose();
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    invite.mutate({ email, role });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 id="invite-title" className="text-slate-900">
            Invite member
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleInvite} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="invite-email" className="text-slate-700 mb-1.5 block">
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="invite-role" className="text-slate-700 mb-1.5 block">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as WorkspaceRole)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {WORKSPACE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
          {invite.error && (
            <p className="text-red-600 text-sm">{invite.error.message}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!email || invite.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {invite.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Mail size={14} />
              )}
              Send invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RemoveMemberDialog({
  member,
  onClose,
  onConfirm,
  isPending,
}: {
  member: MemberRow;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-slate-900 mb-1">Remove member?</h3>
            <p className="text-slate-500 text-sm">
              <strong>{member.user.name}</strong> will lose access to this workspace.
              Tenders they own stay in place.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function MemberRowView({
  member,
  canManage,
  onRemove,
}: {
  member: MemberRow;
  canManage: boolean;
  onRemove: () => void;
}) {
  const utils = api.useUtils();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (member.user.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const avatarColors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-teal-500",
    "bg-amber-500",
    "bg-rose-500",
  ];
  const colorIdx = (member.user.name ?? "?").charCodeAt(0) % avatarColors.length;

  const updateRole = api.team.updateMemberRole.useMutation({
    onSuccess: () => utils.team.listMembers.invalidate(),
  });

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full ${avatarColors[colorIdx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
          >
            {initials}
          </div>
          <div>
            <p className="text-slate-800 text-sm font-medium">{member.user.name}</p>
            <p className="text-slate-400 text-xs">{member.user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="relative">
          <button
            onClick={() => canManage && setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-blue-500 rounded disabled:cursor-default"
            aria-haspopup="listbox"
            aria-expanded={roleMenuOpen}
            disabled={!canManage}
          >
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-semibold ${ROLE_COLORS[member.role]}`}
            >
              {ROLE_LABEL[member.role]}
            </span>
            {canManage && <ChevronDown size={12} className="text-slate-400" />}
          </button>
          {canManage && roleMenuOpen && (
            <div
              className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-[140px]"
              role="listbox"
            >
              {WORKSPACE_ROLES.map((r) => (
                <button
                  key={r}
                  role="option"
                  aria-selected={member.role === r}
                  onClick={() => {
                    updateRole.mutate({ id: member.id, role: r });
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 ${
                    member.role === r ? "text-blue-600 font-semibold" : "text-slate-700"
                  }`}
                >
                  {member.role === r ? <Check size={11} /> : <span className="w-3" />}
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            member.status === "ACTIVE"
              ? "text-emerald-600"
              : member.status === "PENDING"
              ? "text-amber-500"
              : "text-slate-400"
          }`}
        >
          {member.status === "ACTIVE" && <CheckCircle2 size={12} />}
          {member.status === "PENDING" && <Clock size={12} />}
          {member.status === "DEACTIVATED" && <X size={12} />}
          {MEMBER_STATUS_LABEL[member.status]}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-slate-500 text-xs font-mono">
          {member.lastActiveAt ? (
            new Date(member.lastActiveAt).toLocaleString("en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          ) : (
            <span className="text-slate-300 italic">Never</span>
          )}
        </span>
      </td>
      <td className="px-5 py-3.5">
        {canManage && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Member options"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onRemove();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

function PendingInvitations({
  invitations,
  canManage,
}: {
  invitations: InviteRow[];
  canManage: boolean;
}) {
  const utils = api.useUtils();
  const cancel = api.team.cancelInvite.useMutation({
    onSuccess: () => utils.team.listInvitations.invalidate(),
  });

  if (invitations.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-slate-800 text-sm font-semibold">Pending invitations</h3>
      </div>
      <ul className="divide-y divide-slate-100">
        {invitations.map((inv) => (
          <li key={inv.id} className="flex items-center gap-3 px-5 py-3">
            <Mail size={14} className="text-amber-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 truncate">{inv.email}</p>
              <p className="text-xs text-slate-400">
                {ROLE_LABEL[inv.role]} · expires{" "}
                {new Date(inv.expiresAt).toLocaleDateString()}
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => cancel.mutate({ id: inv.id })}
                disabled={cancel.isPending}
                className="text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrashView() {
  const utils = api.useUtils();
  const trashQuery = api.tender.trash.useQuery();
  const restore = api.tender.restore.useMutation({
    onSuccess: () => {
      utils.tender.trash.invalidate();
      utils.tender.list.invalidate();
    },
  });
  const hardDelete = api.tender.hardDelete.useMutation({
    onSuccess: () => utils.tender.trash.invalidate(),
  });

  const items: TrashRow[] = trashQuery.data ?? [];

  function daysLeft(deletedAt: Date | string) {
    const cutoff = new Date(deletedAt).getTime() + 30 * 24 * 60 * 60 * 1000;
    return Math.ceil((cutoff - Date.now()) / (1000 * 60 * 60 * 24));
  }

  if (trashQuery.isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex justify-center">
        <Loader2 size={20} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-800">Deleted tenders</h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Restore within 30 days of deletion.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
            {items.length} entries
          </span>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-400">
          Nothing in the trash.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((t) => {
            const left = t.deletedAt ? daysLeft(t.deletedAt) : 30;
            return (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-slate-700">
                    {t.title}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {t.authority} · Deleted{" "}
                    {t.deletedAt
                      ? new Date(t.deletedAt).toLocaleDateString("en-US")
                      : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-xs font-medium ${
                      left <= 7
                        ? "text-red-600"
                        : left <= 14
                        ? "text-amber-600"
                        : "text-slate-500"
                    }`}
                  >
                    {left}d left
                  </span>
                  <button
                    onClick={() => restore.mutate({ id: t.id })}
                    disabled={restore.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-300 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-50 disabled:opacity-50"
                  >
                    <RefreshCw size={12} />
                    Restore
                  </button>
                  <button
                    onClick={() => hardDelete.mutate({ id: t.id })}
                    disabled={hardDelete.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Delete forever
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

type TeamTab = "members" | "deleted";

export default function TeamManagementPage() {
  const utils = api.useUtils();
  const workspace = api.workspace.current.useQuery();
  const membersQuery = api.team.listMembers.useQuery();
  const invitationsQuery = api.team.listInvitations.useQuery();
  const trashQuery = api.tender.trash.useQuery();
  const removeMember = api.team.removeMember.useMutation({
    onSuccess: () => utils.team.listMembers.invalidate(),
  });

  const [teamTab, setTeamTab] = useState<TeamTab>("members");
  const [showInvite, setShowInvite] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<MemberRow | null>(null);

  const members = membersQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];
  const canManage = workspace.data?.role === "ADMIN";

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-slate-900">Team & Users</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {workspace.data?.name ?? "Workspace"} — {members.length} members
            </p>
          </div>
        </div>
        {canManage && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <UserPlus size={15} />
            Invite member
          </button>
        )}
      </div>

      <div className="flex border-b border-slate-200">
        {(
          [
            { id: "members", label: "Members", icon: <Users size={14} />, count: members.length },
            {
              id: "deleted",
              label: "Trash",
              icon: <Archive size={14} />,
              count: trashQuery.data?.length ?? 0,
            },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTeamTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
              teamTab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
            role="tab"
            aria-selected={teamTab === t.id}
          >
            {t.icon}
            {t.label}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                teamTab === t.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {teamTab === "members" && (
        <>
          {members.some((m) => m.status === "PENDING") && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
              <p className="text-amber-800 text-sm">
                {members.filter((m) => m.status === "PENDING").length} pending invitation(s).
                These members don't have workspace access yet.
              </p>
            </div>
          )}

          <PendingInvitations invitations={invitations} canManage={canManage} />

          {membersQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table" aria-label="Team members">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Last active
                      </th>
                      <th className="w-12" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map((member) => (
                      <MemberRowView
                        key={member.id}
                        member={member}
                        canManage={canManage}
                        onRemove={() => setRemoveTarget(member)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-slate-400 text-xs">
                  {members.filter((m) => m.status === "ACTIVE").length} active ·{" "}
                  {members.filter((m) => m.status === "PENDING").length} pending ·{" "}
                  {members.filter((m) => m.status === "DEACTIVATED").length} deactivated
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {teamTab === "deleted" && <TrashView />}

      {showInvite && <InviteDialog onClose={() => setShowInvite(false)} />}
      {removeTarget && (
        <RemoveMemberDialog
          member={removeTarget}
          isPending={removeMember.isPending}
          onClose={() => setRemoveTarget(null)}
          onConfirm={() =>
            removeMember.mutate(
              { id: removeTarget.id },
              { onSuccess: () => setRemoveTarget(null) },
            )
          }
        />
      )}
    </div>
  );
}
