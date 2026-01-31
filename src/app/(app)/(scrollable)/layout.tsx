import AppHeader from "@/components/core/AppHeader";
import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="vertical mx-auto mt-[var(--header-height)] w-full max-w-[var(--container-max-width)] flex-1 px-4 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
