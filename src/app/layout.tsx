import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoalTracker",
  description: "A personal command center for self-improvement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#050505] text-white">
        <Sidebar />
        <main className="min-h-screen pb-24 lg:ml-72 lg:pb-0">{children}</main>
      </body>
    </html>
  );
}
