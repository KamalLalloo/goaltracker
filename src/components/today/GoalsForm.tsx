"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { createGoal, deleteGoal, updateGoal } from "@/lib/actions/goals";
import type { DailyGoal } from "@/lib/types";

type Props = {
  date: string;
  goals: DailyGoal[];
  onChange: (goals: DailyGoal[]) => void;
};

export function GoalsForm({ date, goals, onChange }: Props) {
  const [title, setTitle] = useState("");
  const [xp, setXp] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function addGoal(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      setError("");
      const goal = await createGoal({
        goal_date: date,
        title: title.trim(),
        xp_value: xp,
      });
      onChange([...goals, goal]);
      setTitle("");
      setXp(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add goal.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(goal: DailyGoal) {
    const next = goals.map((item) =>
      item.id === goal.id ? { ...item, completed: !item.completed } : item,
    );
    onChange(next);
    try {
      await updateGoal(goal.id, { completed: !goal.completed });
    } catch (err) {
      onChange(goals);
      setError(err instanceof Error ? err.message : "Failed to update goal.");
    }
  }

  async function remove(id: string) {
    const next = goals.filter((goal) => goal.id !== id);
    onChange(next);
    try {
      await deleteGoal(id);
    } catch (err) {
      onChange(goals);
      setError(err instanceof Error ? err.message : "Failed to delete goal.");
    }
  }

  return (
    <Card title="Daily Goals" eyebrow="Today">
      <form className="grid gap-4 md:grid-cols-[1fr_180px_auto]" onSubmit={addGoal}>
        <Input
          label="Goal Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ship the most important task"
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
        <Button className="self-end" disabled={saving} type="submit">
          <Plus size={17} />
          Add Goal
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-6 space-y-3">
        {goals.length === 0 ? (
          <EmptyState>No goals yet. Add one to start the day.</EmptyState>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center gap-3 rounded-[18px] border border-[#1A1A1A] bg-black/25 p-3"
            >
              <button
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
                  goal.completed
                    ? "border-[#34D399] bg-[#34D399] text-black"
                    : "border-zinc-700 text-zinc-700 hover:border-[#34D399]"
                }`}
                onClick={() => toggle(goal)}
                type="button"
              >
                <Check size={17} />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    goal.completed
                      ? "text-[#A1A1AA] line-through"
                      : "text-white"
                  }`}
                >
                  {goal.title}
                </p>
                <p className="text-xs text-[#A1A1AA]">{goal.xp_value} XP</p>
              </div>
              <Button
                aria-label="Delete goal"
                className="h-9 w-9 px-0"
                onClick={() => remove(goal.id)}
                type="button"
                variant="ghost"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
