"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/login" || pathname.startsWith("/auth/callback");

  if (isAuthRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen pb-24 lg:ml-72 lg:pb-0">{children}</main>
    </>
  );
}
