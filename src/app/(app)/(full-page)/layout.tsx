import AppHeader from "@/components/core/AppHeader";
import { Sidebar } from "@/components/sidebar";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen max-h-screen min-h-screen overflow-hidden">
      <Sidebar />
      <div className="grid flex-1 grid-rows-[auto_1fr_auto] overflow-hidden">
        <AppHeader />
        {children}
      </div>
    </div>
  );
}
