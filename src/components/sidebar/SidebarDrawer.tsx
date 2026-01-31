"use client";

import { Drawer } from "vaul";
import { Logo } from "@/components/core/Logo";
import { useSidebar } from "./SidebarContext";
import { SidebarNav } from "./SidebarNav";

export function SidebarDrawer() {
  const { isDrawerOpen, closeDrawer } = useSidebar();

  return (
    <Drawer.Root open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-y-0 left-0 z-[9999] flex w-72 flex-col bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-800">
            <Logo />
          </div>

          <div className="flex-1 overflow-y-auto p-4" onClick={closeDrawer}>
            <SidebarNav />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
