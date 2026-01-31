"use client";

import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  Shield,
} from "lucide-react";
import { clientEnv } from "@/env/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSettingsDialog } from "@/hooks/useSettingsDialog";
import { SidebarNavItem } from "./SidebarNavItem";

export function SidebarNav() {
  const user = useCurrentUser();
  const { openSettings } = useSettingsDialog();
  const isAdmin = user?.isAdmin;

  const isChatEnabled = clientEnv.NEXT_PUBLIC_ENABLE_CHAT_PAGE;
  const isBlogEnabled = clientEnv.NEXT_PUBLIC_ENABLE_BLOG_PAGE;

  return (
    <nav className="flex flex-col gap-1">
      <SidebarNavItem
        href="/app"
        icon={LayoutDashboard}
        label="Dashboard"
      />

      {isChatEnabled && (
        <SidebarNavItem
          href="/chat"
          icon={MessageSquare}
          label="Chat"
        />
      )}

      {isBlogEnabled && (
        <SidebarNavItem
          href="/blog"
          icon={FileText}
          label="Blog"
        />
      )}

      <SidebarNavItem
        icon={Settings}
        label="Settings"
        onClick={openSettings}
      />

      {isAdmin && (
        <SidebarNavItem
          href="/admin"
          icon={Shield}
          label="Admin"
        />
      )}
    </nav>
  );
}
