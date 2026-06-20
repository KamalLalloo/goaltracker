"use client";

import { BarChart3, CheckCircle2, LayoutDashboard, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: CheckCircle2 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-[#1A1A1A] bg-[#050505]/95 px-5 py-6 backdrop-blur-xl lg:block">
        <div className="mb-10">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#34D399] text-lg font-black text-black">
            G
          </div>
          <p className="text-sm font-medium text-[#A1A1AA]">Personal OS</p>
          <h1 className="mt-1 text-xl font-semibold text-white">GoalTracker</h1>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-medium transition ${
                  active
                    ? "bg-[#34D399]/12 text-[#34D399]"
                    : "text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-[#1A1A1A] bg-[#050505]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
                active ? "text-[#34D399]" : "text-[#A1A1AA]"
              }`}
            >
              <Icon size={18} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
