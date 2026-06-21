"use client";

import { useEffect, useMemo, useState } from "react";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchAchievements } from "@/lib/actions/achievements";
import { fetchEntries } from "@/lib/actions/entries";
import { fetchGoals } from "@/lib/actions/goals";
import type { Achievement, DailyEntry, DailyGoal } from "@/lib/types";
import {
  achievementXP,
  bestStreak,
  completedGoalXP,
  completionPercentage,
  currentStreak,
  goalStats,
  todayISO,
} from "@/lib/utils/xp";

type Filter = "week" | "month" | "year";

export default function AnalyticsPage() {
  const [filter, setFilter] = useState<Filter>("week");
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const startDate = useMemo(() => rangeStart(filter), [filter]);
  const today = todayISO();

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
        setGoals(
          goalsData.filter(
            (goal) => goal.goal_date >= startDate && goal.goal_date <= today,
          ),
        );
        setEntries(entriesData.filter((entry) => entry.entry_date <= today));
        setAchievements(
          achievementsData.filter(
            (achievement) =>
              achievement.achieved_date >= startDate &&
              achievement.achieved_date <= today,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [startDate, today]);

  const stats = useMemo(() => buildStats(goals, entries, achievements), [
    achievements,
    entries,
    goals,
  ]);
  const chartData = useMemo(
    () => buildTrend(goals, entries, achievements),
    [achievements, entries, goals],
  );

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
        <Metric label="Total Goals" value={stats.totalGoals} />
        <Metric label="Completed Goals" value={stats.completedGoals} />
        <Metric label="Missed Goals" value={stats.missedGoals} />
        <Metric label="Success Rate" value={`${stats.successRate}%`} />
        <Metric label="Current Streak" value={stats.currentStreak} />
        <Metric label="Best Streak" value={stats.bestStreak} />
        <Metric label="Avg Sleep" value={stats.averageSleep} />
        <Metric label="Avg Exercise" value={`${stats.averageExercise} min`} />
        <Metric label="Avg Day Rating" value={stats.averageMood} />
        <Metric label="Achievements" value={stats.achievementCount} />
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
  const stats = goalStats(goals);
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
    totalGoals: stats.total,
    completedGoals: stats.completed,
    missedGoals: stats.missed,
    successRate: stats.percentage,
    currentStreak: currentStreak(goals),
    bestStreak: bestStreak(goals),
    averageSleep: average(sleepScores),
    averageExercise: average(exerciseMinutes),
    averageMood: average(moods),
    achievementCount: achievements.length,
  };
}

function buildTrend(
  goals: DailyGoal[],
  entries: DailyEntry[],
  achievements: Achievement[],
) {
  const dates = Array.from(
    new Set([
      ...goals.map((goal) => goal.goal_date),
      ...entries.map((entry) => entry.entry_date),
      ...achievements.map((achievement) => achievement.achieved_date),
    ]),
  ).sort();
  let cumulativeXp = 0;

  return dates.map((date) => {
    const dayGoals = goals.filter((goal) => goal.goal_date === date);
    const entry = entries.find((item) => item.entry_date === date);
    const dayAchievements = achievements.filter(
      (achievement) => achievement.achieved_date === date,
    );
    const dayXp = completedGoalXP(dayGoals) + achievementXP(dayAchievements);
    cumulativeXp += dayXp;
    const completed = dayGoals.filter((goal) => goal.completed).length;

    return {
      date: date.slice(5),
      xp: dayXp,
      xpGrowth: cumulativeXp,
      completed,
      total: dayGoals.length,
      completionRate: completionPercentage(completed, dayGoals.length),
      dayRating: entry?.mood ?? null,
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
