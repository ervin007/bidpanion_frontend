"use client";

import { Menu } from "lucide-react";
import { Logo } from "./Logo";
import { AppHeaderUser } from "./HeaderUser";
import { blogLink, chatLink, homeLink } from "@/config/links";
import { useKitzeUI } from "@/components/KitzeUIContext";
import { ThemeSwitchMinimalNextThemes } from "@/components/ThemeSwitchMinimalNextThemes";
import { HeaderCustomized } from "@/components/core/HeaderCustomized";
import { HeaderLinks } from "@/components/core/HeaderLinks";
import { useSidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  const { isMobile } = useKitzeUI();
  const { openDrawer } = useSidebar();

  // Links are filtered inside the respective components
  const userLinks = [homeLink, blogLink];
  const headerLinks = [chatLink];

  return (
    <HeaderCustomized
      classNames={{
        root: "relative",
      }}
      leftSide={
        <div className="horizontal center-v gap-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={openDrawer}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {isMobile && <Logo />}
        </div>
      }
      renderRightSide={() => (
        <div className="horizontal center-v gap-4">
          {!isMobile && <HeaderLinks links={headerLinks} />}
          <ThemeSwitchMinimalNextThemes buttonProps={{ variant: "ghost" }} />
          <AppHeaderUser links={userLinks} />
        </div>
      )}
    />
  );
}
