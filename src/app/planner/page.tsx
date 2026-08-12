"use client";

import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createGoal, deleteGoal, fetchGoals } from "@/lib/actions/goals";
import { fetchProjects } from "@/lib/actions/projects";
import type { DailyGoal, Project } from "@/lib/types";
import { addDaysISO, todayISO } from "@/lib/utils/xp";

function orderKey(date: string) {
  return `goaltracker:planner-order:${date}`;
}

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState(() => addDaysISO(todayISO(), 1));
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [xp, setXp] = useState(5);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [goalData, projectData] = await Promise.all([
          fetchGoals(selectedDate),
          fetchProjects(),
        ]);
        setGoals(goalData);
        setProjects(projectData);
        setOrderedIds(readStoredOrder(selectedDate, goalData));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load planner.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [selectedDate]);

  const orderedGoals = useMemo(() => {
    const goalsById = new Map(goals.map((goal) => [goal.id, goal]));
    const ordered = orderedIds
      .map((id) => goalsById.get(id))
      .filter((goal): goal is DailyGoal => Boolean(goal));
    const missing = goals.filter((goal) => !orderedIds.includes(goal.id));
    return [...ordered, ...missing];
  }, [goals, orderedIds]);

  const totalXp = useMemo(
    () => orderedGoals.reduce((total, goal) => total + (goal.xp_value || 0), 0),
    [orderedGoals],
  );
  const completed = orderedGoals.filter((goal) => goal.completed).length;
  const completion = orderedGoals.length
    ? Math.round((completed / orderedGoals.length) * 100)
    : 0;

  async function addGoal(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      setError("");
      const goal = await createGoal({
        goal_date: selectedDate,
        title: title.trim(),
        xp_value: xp,
        project_id: projectId || null,
      });
      const nextGoals = [...goals, goal];
      const nextOrder = [...orderedIds, goal.id];
      setGoals(nextGoals);
      setOrderedIds(nextOrder);
      writeStoredOrder(selectedDate, nextOrder);
      setTitle("");
      setXp(5);
      setProjectId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add goal.");
    } finally {
      setSaving(false);
    }
  }

  async function removeGoal(goal: DailyGoal) {
    const nextGoals = goals.filter((item) => item.id !== goal.id);
    const nextOrder = orderedIds.filter((id) => id !== goal.id);
    setGoals(nextGoals);
    setOrderedIds(nextOrder);
    writeStoredOrder(selectedDate, nextOrder);

    try {
      await deleteGoal(goal.id);
    } catch (err) {
      setGoals(goals);
      setOrderedIds(orderedIds);
      writeStoredOrder(selectedDate, orderedIds);
      setError(err instanceof Error ? err.message : "Failed to delete goal.");
    }
  }

  function move(goalId: string, direction: -1 | 1) {
    const currentOrder = orderedGoals.map((goal) => goal.id);
    const index = currentOrder.indexOf(goalId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= currentOrder.length) return;

    const nextOrder = [...currentOrder];
    const [item] = nextOrder.splice(index, 1);
    nextOrder.splice(nextIndex, 0, item);
    setOrderedIds(nextOrder);
    writeStoredOrder(selectedDate, nextOrder);
  }

  if (loading) return <PageShell>Loading planner...</PageShell>;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
            Plan ahead
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Planner
          </h1>
        </div>
        <Input
          label="Plan Date"
          onChange={(event) => setSelectedDate(event.target.value)}
          type="date"
          value={selectedDate}
        />
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card title="Plan Goals">
          <form
            className="grid gap-4 md:grid-cols-[1fr_160px_220px_auto]"
            onSubmit={addGoal}
          >
            <Input
              label="Goal"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Deep work block"
              value={title}
            />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                XP Value: {xp}
              </span>
              <input
                className="h-11 w-full"
                max={10}
                min={1}
                onChange={(event) => setXp(Number(event.target.value))}
                type="range"
                value={xp}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                Project
              </span>
              <select
                className="h-11 w-full rounded-2xl border border-[#1A1A1A] bg-black/40 px-4 text-sm text-white outline-none focus:border-[#34D399]/70"
                onChange={(event) => setProjectId(event.target.value)}
                value={projectId}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>
            <Button className="self-end" disabled={saving} type="submit">
              <Plus size={17} />
              Add Goal
            </Button>
          </form>
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        </Card>

        <Card title="Day Capacity">
          <div className="grid gap-4">
            <Stat label="Planned Goals" value={orderedGoals.length} />
            <Stat label="Total Achievable XP" value={totalXp} />
            <Stat label="Completed" value={`${completed}/${orderedGoals.length}`} />
            <ProgressBar value={completion} label="Completion" />
          </div>
        </Card>
      </div>

      <Card
        title="Ordered To Do List"
        eyebrow={formatDate(selectedDate)}
        action={
          <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
            <CalendarDays size={16} className="text-[#34D399]" />
            {totalXp} XP available
          </div>
        }
      >
        {orderedGoals.length === 0 ? (
          <EmptyState>No goals planned for this date.</EmptyState>
        ) : (
          <div className="space-y-3">
            {orderedGoals.map((goal, index) => (
              <div
                className="grid gap-3 rounded-[18px] border border-[#1A1A1A] bg-black/25 p-3 md:grid-cols-[44px_1fr_auto]"
                key={goal.id}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#34D399]/10 text-sm font-semibold text-[#34D399]">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {goal.completed && (
                      <CheckCircle2 size={16} className="text-[#34D399]" />
                    )}
                    <p
                      className={`truncate text-sm font-semibold ${
                        goal.completed
                          ? "text-[#A1A1AA] line-through"
                          : "text-white"
                      }`}
                    >
                      {goal.title}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-[#A1A1AA]">
                    {goal.xp_value} XP
                    {goal.project_id
                      ? ` · ${
                          projects.find((project) => project.id === goal.project_id)
                            ?.title ?? "Project"
                        }`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    aria-label="Move up"
                    className="h-9 w-9 px-0"
                    disabled={index === 0}
                    onClick={() => move(goal.id, -1)}
                    type="button"
                    variant="ghost"
                  >
                    <ArrowUp size={16} />
                  </Button>
                  <Button
                    aria-label="Move down"
                    className="h-9 w-9 px-0"
                    disabled={index === orderedGoals.length - 1}
                    onClick={() => move(goal.id, 1)}
                    type="button"
                    variant="ghost"
                  >
                    <ArrowDown size={16} />
                  </Button>
                  <Button
                    aria-label="Delete goal"
                    className="h-9 w-9 px-0"
                    onClick={() => removeGoal(goal)}
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4">
      <p className="text-xs font-medium text-[#A1A1AA]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function readStoredOrder(date: string, goals: DailyGoal[]) {
  if (typeof window === "undefined") return goals.map((goal) => goal.id);

  const stored = window.localStorage.getItem(orderKey(date));
  if (!stored) return goals.map((goal) => goal.id);

  try {
    const parsed = JSON.parse(stored) as string[];
    const goalIds = goals.map((goal) => goal.id);
    return [
      ...parsed.filter((id) => goalIds.includes(id)),
      ...goalIds.filter((id) => !parsed.includes(id)),
    ];
  } catch {
    return goals.map((goal) => goal.id);
  }
}

function writeStoredOrder(date: string, order: string[]) {
  window.localStorage.setItem(orderKey(date), JSON.stringify(order));
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-sm text-[#A1A1AA]">
      {children}
    </div>
  );
}
