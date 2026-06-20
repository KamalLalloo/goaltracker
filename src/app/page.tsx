"use client";

import { useEffect, useMemo, useState } from "react";
import { DailyGoalsCard } from "@/components/dashboard/DailyGoalsCard";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { QuoteCard } from "@/components/dashboard/QuoteCard";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { XPCard } from "@/components/dashboard/XPCard";
import { fetchAchievements } from "@/lib/actions/achievements";
import { fetchEntry } from "@/lib/actions/entries";
import { fetchGoals } from "@/lib/actions/goals";
import type { Achievement, DailyEntry, DailyGoal } from "@/lib/types";
import { todayISO, totalXP } from "@/lib/utils/xp";

export default function DashboardPage() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const today = todayISO();
        const [goalsData, entryData, achievementData] = await Promise.all([
          fetchGoals(today),
          fetchEntry(today),
          fetchAchievements(),
        ]);
        setGoals(goalsData);
        setEntry(entryData);
        setAchievements(achievementData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const xp = useMemo(() => totalXP(goals, achievements), [goals, achievements]);

  if (loading) {
    return <PageShell>Loading command center...</PageShell>;
  }

  if (error) {
    return <PageShell>{error}</PageShell>;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <HeroCard totalXp={xp} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <DailyGoalsCard goals={goals} onChange={setGoals} />
        <XPCard totalXp={xp} />
      </div>
      <div className="grid gap-6">
        <QuoteCard quote={entry?.quote} />
        <SummaryCard entry={entry} />
      </div>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-sm text-[#A1A1AA]">
      {children}
    </div>
  );
}
