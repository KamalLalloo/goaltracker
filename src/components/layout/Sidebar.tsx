"use client";

import {
  BarChart3,
  CheckCircle2,
  BookOpenText,
  LayoutDashboard,
  LogOut,
  Trophy,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth/client";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: CheckCircle2 },
  { href: "/journal", label: "Journal", icon: BookOpenText },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        setUser(await getCurrentUser());
      } catch {
        setUser(null);
      }
    }

    loadUser();
  }, []);

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Signed in";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col border-r border-[#1A1A1A] bg-[#050505]/95 px-5 py-6 backdrop-blur-xl lg:flex">
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

        <div className="mt-auto rounded-[22px] border border-[#1A1A1A] bg-[#0D0D0D] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.06] text-[#A1A1AA]">
              {avatar ? (
                <span
                  aria-label={name}
                  className="h-full w-full bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${avatar})` }}
                />
              ) : (
                <UserCircle2 size={22} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{name}</p>
              <p className="truncate text-xs text-[#A1A1AA]">{user?.email}</p>
            </div>
          </div>
          <button
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-[#A1A1AA] transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            disabled={signingOut}
            onClick={signOut}
            type="button"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-6 border-t border-[#1A1A1A] bg-[#050505]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
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
        <button
          className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-[#A1A1AA] transition"
          disabled={signingOut}
          onClick={signOut}
          type="button"
        >
          <LogOut size={18} />
          <span className="truncate">Sign Out</span>
        </button>
      </nav>
    </>
  );
}
