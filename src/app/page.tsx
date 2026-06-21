"use client";

import { useEffect, useMemo, useState } from "react";
import { DailyGoalsCard } from "@/components/dashboard/DailyGoalsCard";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { QuoteCard } from "@/components/dashboard/QuoteCard";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { UpcomingGoalsCard } from "@/components/dashboard/UpcomingGoalsCard";
import { XPCard } from "@/components/dashboard/XPCard";
import { fetchAchievements } from "@/lib/actions/achievements";
import { fetchEntry } from "@/lib/actions/entries";
import { fetchGoals } from "@/lib/actions/goals";
import type { Achievement, DailyEntry, DailyGoal } from "@/lib/types";
import {
  addDaysISO,
  currentStreak,
  goalStats,
  levelFromXP,
  todayISO,
  totalXP,
} from "@/lib/utils/xp";

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
          fetchGoals(),
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
  const today = todayISO();
  const todayGoals = useMemo(
    () => goals.filter((goal) => goal.goal_date === today),
    [goals, today],
  );
  const upcomingGoals = useMemo(
    () =>
      goals.filter(
        (goal) =>
          goal.goal_date > today && goal.goal_date <= addDaysISO(today, 7),
      ),
    [goals, today],
  );
  const todayStats = useMemo(() => goalStats(todayGoals), [todayGoals]);
  const dueGoals = useMemo(
    () => goals.filter((goal) => goal.goal_date <= today),
    [goals, today],
  );
  const overallStats = useMemo(() => goalStats(dueGoals), [dueGoals]);
  const streak = useMemo(() => currentStreak(dueGoals, today), [dueGoals, today]);

  if (loading) {
    return <PageShell>Loading command center...</PageShell>;
  }

  if (error) {
    return <PageShell>{error}</PageShell>;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <HeroCard totalXp={xp} />
      <QuickStats
        stats={[
          { key: "level", label: "Current Level", value: levelFromXP(xp) },
          { key: "xp", label: "Total XP", value: xp },
          { key: "streak", label: "Current Streak", value: streak },
          { key: "rate", label: "Overall Success Rate", value: `${overallStats.percentage}%` },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <DailyGoalsCard goals={todayGoals} onChange={(nextTodayGoals) => {
          setGoals((current) => [
            ...current.filter((goal) => goal.goal_date !== today),
            ...nextTodayGoals,
          ]);
        }} />
        <div className="grid gap-6">
          <ProgressCard
            completed={todayStats.completed}
            percentage={todayStats.percentage}
            total={todayStats.total}
          />
          <XPCard totalXp={xp} />
        </div>
      </div>
      <UpcomingGoalsCard goals={upcomingGoals} />
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
