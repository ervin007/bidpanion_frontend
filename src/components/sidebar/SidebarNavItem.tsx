"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarNavItemProps {
  href?: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
  onClick,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const { isExpanded } = useSidebar();
  const isActive = href ? pathname === href : false;

  const content = (
    <div
      className={cn(
        "flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive
          ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
          : "text-gray-700 dark:text-gray-300",
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {isExpanded && <span className="truncate">{label}</span>}
    </div>
  );

  const wrappedContent = href ? (
    <Link href={href}>{content}</Link>
  ) : (
    content
  );

  if (!isExpanded) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{wrappedContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return wrappedContent;
}
