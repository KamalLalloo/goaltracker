"use client";

import { useEffect, useMemo, useState } from "react";
import { DailyGoalsCard } from "@/components/dashboard/DailyGoalsCard";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { OverdueGoalsCard } from "@/components/dashboard/OverdueGoalsCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { QuoteCard } from "@/components/dashboard/QuoteCard";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { UpcomingGoalsCard } from "@/components/dashboard/UpcomingGoalsCard";
import { XPBreakdownCard } from "@/components/dashboard/XPBreakdownCard";
import { XPCard } from "@/components/dashboard/XPCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fetchEntries, fetchEntry } from "@/lib/actions/entries";
import { fetchGoals } from "@/lib/actions/goals";
import { fetchProjects } from "@/lib/actions/projects";
import type { DailyEntry, DailyGoal, Project } from "@/lib/types";
import {
  addDaysISO,
  completedGoalXP,
  exerciseXP,
  exerciseXPForEntry,
  goalStats,
  projectProgress,
  projectXP,
  todayISO,
  totalXP,
} from "@/lib/utils/xp";

export default function DashboardPage() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const today = todayISO();
        const [goalsData, entryData, entriesData, projectData] = await Promise.all([
          fetchGoals(),
          fetchEntry(today),
          fetchEntries(),
          fetchProjects(),
        ]);
        setGoals(goalsData);
        setEntry(entryData);
        setEntries(entriesData);
        setProjects(projectData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const goalXp = useMemo(() => completedGoalXP(goals), [goals]);
  const exerciseXp = useMemo(() => exerciseXP(entries), [entries]);
  const projectRewardXp = useMemo(() => projectXP(projects), [projects]);
  const xp = useMemo(
    () => totalXP(goals, projects, entries),
    [entries, goals, projects],
  );
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
  const overdueGoals = useMemo(
    () =>
      goals.filter((goal) => goal.goal_date < today && !goal.completed),
    [goals, today],
  );
  const todayStats = useMemo(() => goalStats(todayGoals), [todayGoals]);
  const activeProjects = useMemo(
    () =>
      projects.filter((project) =>
        ["Planning", "Active"].includes(String(project.status)),
      ),
    [projects],
  );
  const focusGoal = useMemo(() => highestPriorityGoal(todayGoals, projects), [
    projects,
    todayGoals,
  ]);
  const consistency = useMemo(
    () => consistencyScore(todayStats.percentage, entry),
    [entry, todayStats.percentage],
  );
  const insights = useMemo(
    () => buildInsights(goals, entries, today),
    [entries, goals, today],
  );

  if (loading) {
    return <PageShell>Loading command center...</PageShell>;
  }

  if (error) {
    return <PageShell>{error}</PageShell>;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <HeroCard totalXp={xp} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Today's Progress" value={`${todayStats.completed}/${todayStats.total}`} detail={`${todayStats.percentage}% complete`} />
        <MetricCard label="Projects" value={activeProjects.length} detail="Planning or active" />
        <MetricCard label="Today's Goals" value={todayGoals.length} detail="Scheduled today" />
        <MetricCard label="Consistency Score" value={`${consistency}`} detail="out of 100" />
        <MetricCard label="Insights" value={insights.length} detail="Signals today" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <TodayFocusCard goal={focusGoal} />
        <ActiveProjectsCard goals={goals} projects={activeProjects} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <DailyGoalsCard
          goals={todayGoals}
          onChange={(nextTodayGoals) => {
            setGoals((current) => [
              ...current.filter((goal) => goal.goal_date !== today),
              ...nextTodayGoals,
            ]);
          }}
        />
        <div className="grid gap-6">
          <ProgressCard
            completed={todayStats.completed}
            percentage={todayStats.percentage}
            total={todayStats.total}
          />
          <CardExerciseXP value={exerciseXPForEntry(entry)} />
          <XPCard totalXp={xp} />
        </div>
      </div>
      <XPBreakdownCard
        exerciseXp={exerciseXp}
        goalXp={goalXp}
        projectXp={projectRewardXp}
      />
      <InsightsCard insights={insights} />
      <div className="grid gap-6 xl:grid-cols-2">
        <UpcomingGoalsCard goals={upcomingGoals} />
        <OverdueGoalsCard goals={overdueGoals} />
      </div>
      <div className="grid gap-6">
        <QuoteCard quote={entry?.quote} />
        <SummaryCard entry={entry} />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-[#A1A1AA]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-[#A1A1AA]">{detail}</p>
    </Card>
  );
}

function TodayFocusCard({ goal }: { goal: DailyGoal | null }) {
  return (
    <Card title="Today's Focus">
      {goal ? (
        <div>
          <p className="text-2xl font-semibold text-white">{goal.title}</p>
          <p className="mt-2 text-sm text-[#A1A1AA]">{goal.xp_value} XP</p>
        </div>
      ) : (
        <EmptyState>All goals completed for today.</EmptyState>
      )}
    </Card>
  );
}

function ActiveProjectsCard({
  projects,
  goals,
}: {
  projects: Project[];
  goals: DailyGoal[];
}) {
  return (
    <Card title="Active Projects">
      {projects.length === 0 ? (
        <EmptyState>No active projects.</EmptyState>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const progress = projectProgress(project, goals);
            return (
              <div key={project.id}>
                <div className="mb-2 flex justify-between gap-4 text-sm">
                  <span className="font-medium text-white">{project.title}</span>
                  <span className="text-[#34D399]">{progress.percentage}%</span>
                </div>
                <ProgressBar value={progress.percentage} />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function InsightsCard({ insights }: { insights: string[] }) {
  return (
    <Card title="Insights">
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            className="rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4 text-sm text-white"
            key={insight}
          >
            {insight}
          </div>
        ))}
      </div>
    </Card>
  );
}

function highestPriorityGoal(goals: DailyGoal[], projects: Project[]) {
  const incomplete = goals.filter((goal) => !goal.completed);
  if (!incomplete.length) return null;
  const rank: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  return [...incomplete].sort((a, b) => {
    const projectA = projects.find((project) => project.id === a.project_id);
    const projectB = projects.find((project) => project.id === b.project_id);
    return (
      (rank[String(projectB?.priority ?? "Medium")] ?? 2) -
        (rank[String(projectA?.priority ?? "Medium")] ?? 2) ||
      b.xp_value - a.xp_value
    );
  })[0];
}

function consistencyScore(goalCompletion: number, entry: DailyEntry | null) {
  const sleep = Math.min(entry?.sleep_score ?? 0, 100);
  const exercise = Math.min(((entry?.exercise_minutes ?? 0) / 30) * 100, 100);
  const rating = Math.min(((entry?.mood ?? 0) / 10) * 100, 100);
  return Math.round(goalCompletion * 0.4 + sleep * 0.2 + exercise * 0.2 + rating * 0.2);
}

function buildInsights(goals: DailyGoal[], entries: DailyEntry[], today: string) {
  const weekStart = addDaysISO(today, -6);
  const priorStart = addDaysISO(today, -13);
  const todayGoals = goals.filter((goal) => goal.goal_date === today);
  const weekGoals = goals.filter(
    (goal) => goal.goal_date >= weekStart && goal.goal_date < today,
  );
  const priorEntries = entries.filter(
    (entry) => entry.entry_date >= priorStart && entry.entry_date < weekStart,
  );
  const weekEntries = entries.filter(
    (entry) => entry.entry_date >= weekStart && entry.entry_date <= today,
  );
  const insights: string[] = [];
  const todayCompleted = todayGoals.filter((goal) => goal.completed).length;
  const weeklyAverage = weekGoals.length
    ? weekGoals.filter((goal) => goal.completed).length / 6
    : 0;
  if (todayCompleted > weeklyAverage) {
    insights.push("You completed more goals than your weekly average.");
  }
  const weekExercise = average(weekEntries.map((entry) => entry.exercise_minutes ?? 0));
  const priorExercise = average(priorEntries.map((entry) => entry.exercise_minutes ?? 0));
  if (weekExercise > priorExercise) {
    insights.push("Exercise increased compared to last week.");
  }
  const weekSleep = average(weekEntries.map((entry) => entry.sleep_score ?? 0));
  const priorSleep = average(priorEntries.map((entry) => entry.sleep_score ?? 0));
  if (weekSleep > priorSleep) {
    insights.push("Sleep has improved over the past month.");
  }
  if (!insights.length) {
    insights.push("Keep logging consistently to unlock better insights.");
  }
  return insights;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function CardExerciseXP({ value }: { value: number }) {
  return (
    <div className="rounded-[22px] border border-[#1A1A1A] bg-[#0D0D0D] p-5">
      <p className="text-sm text-[#A1A1AA]">Exercise XP Today</p>
      <p className="mt-2 text-3xl font-semibold text-[#34D399]">{value}</p>
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
