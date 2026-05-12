"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  ChevronDown,
  LogOut,
  Settings,
  Menu,
  X,
  Shield,
  Kanban,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/server/auth/client";
import { api } from "@/trpc/react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/app", icon: <LayoutDashboard size={16} /> },
  { label: "Board", path: "/app/board", icon: <Kanban size={16} /> },
  { label: "Quick Analysis", path: "/app/quick-analysis", icon: <Sparkles size={16} /> },
  { label: "Company Profile", path: "/app/company-profile", icon: <Building2 size={16} /> },
];

const SETTINGS_NAV_ITEMS: NavItem[] = [
  { label: "Team & Users", path: "/app/team", icon: <Users size={14} /> },
];

const BREADCRUMB_LABELS: Record<string, string> = {
  "/app": "Dashboard",
  "/app/board": "Board",
  "/app/quick-analysis": "Quick Analysis",
  "/app/company-profile": "Company Profile",
  "/app/team": "Team & Users",
};

function breadcrumbFor(pathname: string): string {
  if (pathname.startsWith("/app/tenders/")) return "Tender Detail";
  return BREADCRUMB_LABELS[pathname] ?? "Dashboard";
}

function NavItemLink({
  item,
  pathname,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  onClick?: () => void;
}) {
  const isActive =
    item.path === "/app" ? pathname === "/app" : pathname.startsWith(item.path);
  return (
    <Link
      href={item.path}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 ${
        isActive
          ? "bg-blue-600 text-white"
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
      }`}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  );
}

export function BidpanionShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const settingsActive = SETTINGS_NAV_ITEMS.some((i) => pathname.startsWith(i.path));
  const [settingsOpen, setSettingsOpen] = useState(settingsActive);

  const { data: session } = authClient.useSession();
  const user = session?.user;
  const workspace = api.workspace.current.useQuery(undefined, {
    enabled: !!user,
  });
  const isWorkspaceAdmin = workspace.data?.role === "ADMIN";
  const displayName = user?.name ?? user?.email ?? "—";
  const displayRole = workspace.data?.role
    ? workspace.data.role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "Member";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/signin");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-slate-900 flex flex-col transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Side navigation"
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-base tracking-tight">
              Bidpanion
            </span>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5"
          aria-label="Main navigation"
        >
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
            Overview
          </p>
          {NAV_ITEMS.map((item) => (
            <NavItemLink
              key={item.path}
              item={item}
              pathname={pathname}
              onClick={() => setSidebarOpen(false)}
            />
          ))}

          {isWorkspaceAdmin && (
            <>
              <div className="h-px bg-slate-800 my-3" />
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                Admin
              </p>
              <button
                onClick={() => setSettingsOpen((o) => !o)}
                aria-expanded={settingsOpen}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  settingsActive
                    ? "text-slate-100 bg-slate-800"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                }`}
              >
                <Settings size={16} />
                <span className="flex-1 text-left">Settings</span>
                <ChevronDown
                  size={14}
                  className={`text-slate-500 transition-transform ${
                    settingsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {settingsOpen && (
                <div className="ml-3 mt-1 pl-3 border-l border-slate-800 space-y-0.5">
                  {SETTINGS_NAV_ITEMS.map((item) => (
                    <NavItemLink
                      key={item.path}
                      item={item}
                      pathname={pathname}
                      onClick={() => setSidebarOpen(false)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </nav>

        {workspace.data && (
          <div className="px-3 py-2 mx-3 mb-2 rounded-md bg-slate-800 border border-slate-700">
            <p className="text-slate-400 text-xs font-medium">Workspace</p>
            <p className="text-slate-200 text-sm font-semibold truncate">
              {workspace.data.name}
            </p>
          </div>
        )}

        <div className="px-3 pb-4 relative">
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate leading-tight">
                {displayName}
              </p>
              <p className="text-slate-500 text-xs truncate leading-tight">
                {displayRole}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-500 transition-transform flex-shrink-0 ${
                userMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {userMenuOpen && (
            <div
              className="absolute bottom-full left-3 right-3 mb-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50"
              role="menu"
            >
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 text-sm transition-colors"
                onClick={handleSignOut}
                role="menuitem"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1 text-sm">
                <li className="text-slate-700 font-medium">
                  {breadcrumbFor(pathname)}
                </li>
              </ol>
            </nav>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
