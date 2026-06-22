"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/login" || pathname.startsWith("/auth/callback");

  if (isAuthRoute) {
    return (
      <main className="min-h-screen overflow-x-hidden">
        {children}
        <InstallPrompt />
      </main>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen overflow-x-hidden pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(72px+env(safe-area-inset-top))] lg:ml-72 lg:pb-0 lg:pt-0">
        {children}
      </main>
      <InstallPrompt />
    </>
  );
}
