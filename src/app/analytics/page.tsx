"use client";

import { useEffect, useMemo, useState } from "react";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { ExportDataButton } from "@/components/analytics/ExportDataButton";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchEntries } from "@/lib/actions/entries";
import { fetchGoals } from "@/lib/actions/goals";
import { fetchProjects } from "@/lib/actions/projects";
import type { DailyEntry, DailyGoal, Project } from "@/lib/types";
import {
  bestStreak,
  completedGoalXP,
  completionPercentage,
  currentStreak,
  exerciseXP,
  exerciseXPForEntry,
  goalStats,
  projectProgress,
  projectXP,
  todayISO,
} from "@/lib/utils/xp";

type Filter = "week" | "month" | "year" | "all";

export default function AnalyticsPage() {
  const [filter, setFilter] = useState<Filter>("week");
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const startDate = useMemo(() => rangeStart(filter), [filter]);
  const today = todayISO();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [goalsData, entriesData, projectData] = await Promise.all([
          fetchGoals(),
          fetchEntries(startDate ?? undefined),
          fetchProjects(),
        ]);
        setGoals(
          goalsData.filter(
            (goal) => (!startDate || goal.goal_date >= startDate) && goal.goal_date <= today,
          ),
        );
        setEntries(entriesData.filter((entry) => entry.entry_date <= today));
        setProjects(projectData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [startDate, today]);

  const stats = useMemo(() => buildStats(goals, entries, projects), [
    entries,
    goals,
    projects,
  ]);
  const chartData = useMemo(
    () => buildTrend(goals, entries, projects),
    [entries, goals, projects],
  );

  if (loading) return <PageShell>Loading analytics...</PageShell>;
  if (error) return <PageShell>{error}</PageShell>;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
            Insights
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Analytics
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grid grid-cols-4 rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-1">
          {(["week", "month", "year", "all"] as Filter[]).map((item) => (
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
              {item === "all" ? "All Time" : item}
            </button>
          ))}
        </div>
        <ExportDataButton />
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
        <Metric label="Projects" value={projects.length} />
        <Metric label="Average Daily XP" value={stats.averageDailyXp} />
        <Metric label="Best XP Day" value={stats.bestXpDay} />
        <Metric label="Total Exercise XP" value={stats.totalExerciseXp} />
        <Metric label="Total Goal XP" value={stats.totalGoalXp} />
        <Metric label="Total Project XP" value={stats.totalProjectXp} />
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
  projects: Project[],
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

  const trend = buildTrend(goals, entries, projects);
  const goalXp = completedGoalXP(goals);
  const entryExerciseXp = exerciseXP(entries);
  const awardedXp = projectXP(projects);

  return {
    totalXp: goalXp + entryExerciseXp + awardedXp,
    totalGoals: stats.total,
    completedGoals: stats.completed,
    missedGoals: stats.missed,
    successRate: stats.percentage,
    currentStreak: currentStreak(goals),
    bestStreak: bestStreak(goals),
    averageSleep: average(sleepScores),
    averageExercise: average(exerciseMinutes),
    averageMood: average(moods),
    projectCount: projects.length,
    averageDailyXp: average(trend.map((day) => day.xp)),
    bestXpDay: Math.max(0, ...trend.map((day) => day.xp)),
    totalExerciseXp: entryExerciseXp,
    totalGoalXp: goalXp,
    totalProjectXp: awardedXp,
  };
}

function buildTrend(
  goals: DailyGoal[],
  entries: DailyEntry[],
  projects: Project[],
) {
  const dates = Array.from(
    new Set([
      ...goals.map((goal) => goal.goal_date),
      ...entries.map((entry) => entry.entry_date),
      ...projects
        .map((project) => project.target_date)
        .filter((date): date is string => Boolean(date)),
    ]),
  ).sort();
  let cumulativeXp = 0;

  return dates.map((date) => {
    const dayGoals = goals.filter((goal) => goal.goal_date === date);
    const entry = entries.find((item) => item.entry_date === date);
    const dayProjectXp = projects
      .filter((project) => project.status === "Completed" && project.target_date === date)
      .reduce((sum, project) => sum + (project.xp_reward || 0), 0);
    const exerciseXp = exerciseXPForEntry(entry);
    const dayXp =
      completedGoalXP(dayGoals) +
      exerciseXp +
      dayProjectXp;
    cumulativeXp += dayXp;
    const completed = dayGoals.filter((goal) => goal.completed).length;
    const completionRate = completionPercentage(completed, dayGoals.length);
    const projectPercents = projects.map((project) => projectProgress(project, goals).percentage);
    const projectProgressAverage = average(projectPercents);

    return {
      date: date.slice(5),
      xp: dayXp,
      xpGrowth: cumulativeXp,
      exerciseXp,
      completed,
      total: dayGoals.length,
      completionRate,
      consistencyScore: consistencyScore(completionRate, entry),
      projectCompletion: completionPercentage(
        projects.filter((project) => project.status === "Completed").length,
        projects.length,
      ),
      projectProgress: Math.round(projectProgressAverage),
      dayRating: entry?.mood ?? null,
      sleep: entry?.sleep_score ?? null,
    };
  });
}

function consistencyScore(goalCompletion: number, entry: DailyEntry | undefined) {
  const sleep = Math.min(entry?.sleep_score ?? 0, 100);
  const exercise = Math.min(((entry?.exercise_minutes ?? 0) / 30) * 100, 100);
  const rating = Math.min(((entry?.mood ?? 0) / 10) * 100, 100);
  return Math.round(goalCompletion * 0.4 + sleep * 0.2 + exercise * 0.2 + rating * 0.2);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function rangeStart(filter: Filter) {
  if (filter === "all") return null;
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
