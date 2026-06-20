"use client";

import { useEffect, useMemo, useState } from "react";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchAchievements } from "@/lib/actions/achievements";
import { fetchEntries } from "@/lib/actions/entries";
import { fetchGoals } from "@/lib/actions/goals";
import type { Achievement, DailyEntry, DailyGoal } from "@/lib/types";
import { achievementXP, completedGoalXP, completionPercentage } from "@/lib/utils/xp";

type Filter = "week" | "month" | "year";

export default function AnalyticsPage() {
  const [filter, setFilter] = useState<Filter>("week");
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const startDate = useMemo(() => rangeStart(filter), [filter]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [goalsData, entriesData, achievementsData] = await Promise.all([
          fetchGoals(),
          fetchEntries(startDate),
          fetchAchievements(),
        ]);
        setGoals(goalsData.filter((goal) => goal.goal_date >= startDate));
        setEntries(entriesData);
        setAchievements(
          achievementsData.filter(
            (achievement) => achievement.achieved_date >= startDate,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [startDate]);

  const stats = useMemo(() => buildStats(goals, entries, achievements), [
    achievements,
    entries,
    goals,
  ]);
  const chartData = useMemo(() => buildTrend(goals, entries), [entries, goals]);

  if (loading) return <PageShell>Loading analytics...</PageShell>;
  if (error) return <PageShell>{error}</PageShell>;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
            Insights
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Analytics
          </h1>
        </div>
        <div className="grid grid-cols-3 rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-1">
          {(["week", "month", "year"] as Filter[]).map((item) => (
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                filter === item
                  ? "bg-[#34D399] text-black"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total XP" value={stats.totalXp} />
        <Metric label="Goals Completed" value={stats.completedGoals} />
        <Metric label="Completion" value={`${stats.completion}%`} />
        <Metric label="Achievements" value={stats.achievementCount} />
        <Metric label="Avg Sleep" value={stats.averageSleep} />
        <Metric label="Avg Exercise" value={`${stats.averageExercise} min`} />
        <Metric label="Avg Mood" value={stats.averageMood} />
      </div>

      {chartData.length === 0 ? (
        <EmptyState>No analytics data for this period.</EmptyState>
      ) : (
        <AnalyticsCharts data={chartData} />
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-[#A1A1AA]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </Card>
  );
}

function buildStats(
  goals: DailyGoal[],
  entries: DailyEntry[],
  achievements: Achievement[],
) {
  const completedGoals = goals.filter((goal) => goal.completed).length;
  const sleepScores = entries
    .map((entry) => entry.sleep_score)
    .filter((score): score is number => typeof score === "number");
  const exerciseMinutes = entries
    .map((entry) => entry.exercise_minutes)
    .filter((minutes): minutes is number => typeof minutes === "number");
  const moods = entries
    .map((entry) => entry.mood)
    .filter((mood): mood is number => typeof mood === "number");

  return {
    totalXp: completedGoalXP(goals) + achievementXP(achievements),
    completedGoals,
    completion: completionPercentage(completedGoals, goals.length),
    averageSleep: average(sleepScores),
    averageExercise: average(exerciseMinutes),
    averageMood: average(moods),
    achievementCount: achievements.length,
  };
}

function buildTrend(goals: DailyGoal[], entries: DailyEntry[]) {
  const dates = Array.from(
    new Set([...goals.map((goal) => goal.goal_date), ...entries.map((entry) => entry.entry_date)]),
  ).sort();

  return dates.map((date) => {
    const dayGoals = goals.filter((goal) => goal.goal_date === date);
    const entry = entries.find((item) => item.entry_date === date);

    return {
      date: date.slice(5),
      xp: completedGoalXP(dayGoals),
      completed: dayGoals.filter((goal) => goal.completed).length,
      total: dayGoals.length,
      sleep: entry?.sleep_score ?? null,
    };
  });
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function rangeStart(filter: Filter) {
  const date = new Date();
  if (filter === "week") date.setDate(date.getDate() - 6);
  if (filter === "month") date.setMonth(date.getMonth() - 1);
  if (filter === "year") date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().slice(0, 10);
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-sm text-[#A1A1AA]">
      {children}
    </div>
  );
}
