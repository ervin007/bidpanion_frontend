"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

export function SidebarToggle() {
  const { isExpanded, toggleExpanded } = useSidebar();

  return (
    <button
      onClick={toggleExpanded}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg",
        "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
        "dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
        "transition-colors",
      )}
      aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isExpanded ? (
        <ChevronLeft className="h-5 w-5" />
      ) : (
        <ChevronRight className="h-5 w-5" />
      )}
    </button>
  );
}
