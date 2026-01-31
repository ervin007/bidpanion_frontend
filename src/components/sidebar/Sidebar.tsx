"use client";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/core/Logo";
import { useSidebar } from "./SidebarContext";
import { SidebarNav } from "./SidebarNav";
import { SidebarToggle } from "./SidebarToggle";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Sidebar() {
  const { isExpanded } = useSidebar();

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "hidden h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 md:flex dark:border-gray-800 dark:bg-gray-950",
          isExpanded ? "w-64" : "w-16",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-800",
            isExpanded ? "justify-between" : "justify-center",
          )}
        >
          {isExpanded && <Logo />}
          <SidebarToggle />
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav />
        </div>
      </aside>
    </TooltipProvider>
  );
}
