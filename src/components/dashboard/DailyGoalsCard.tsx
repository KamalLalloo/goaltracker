"use client";

import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { updateGoal } from "@/lib/actions/goals";
import type { DailyGoal } from "@/lib/types";
import { completionPercentage } from "@/lib/utils/xp";

type Props = {
  goals: DailyGoal[];
  onChange: (goals: DailyGoal[]) => void;
};

export function DailyGoalsCard({ goals, onChange }: Props) {
  const completed = goals.filter((goal) => goal.completed).length;
  const percentage = completionPercentage(completed, goals.length);

  async function toggleGoal(goal: DailyGoal) {
    const next = goals.map((item) =>
      item.id === goal.id ? { ...item, completed: !item.completed } : item,
    );
    onChange(next);

    try {
      await updateGoal(goal.id, { completed: !goal.completed });
    } catch {
      onChange(goals);
    }
  }

  return (
    <Card
      title="Today's Goals"
      action={
        <div className="text-right text-sm">
          <p className="font-semibold text-white">
            {completed}/{goals.length}
          </p>
          <p className="text-[#A1A1AA]">completed</p>
        </div>
      }
    >
      {goals.length === 0 ? (
        <EmptyState>No goals added for today.</EmptyState>
      ) : (
        <div className="space-y-4">
          <ProgressBar value={percentage} label="Completion" />
          <div className="space-y-3">
            {goals.map((goal) => (
              <button
                key={goal.id}
                className="flex w-full items-center gap-3 rounded-[18px] border border-[#1A1A1A] bg-black/25 p-3 text-left transition hover:bg-white/[0.04]"
                onClick={() => toggleGoal(goal)}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    goal.completed
                      ? "border-[#34D399] bg-[#34D399] text-black"
                      : "border-zinc-700 text-transparent"
                  }`}
                >
                  <CheckCircle2 size={15} />
                </span>
                <span
                  className={`flex-1 text-sm ${
                    goal.completed
                      ? "text-[#A1A1AA] line-through"
                      : "text-white"
                  }`}
                >
                  {goal.title}
                </span>
                <span className="rounded-full bg-[#34D399]/10 px-2.5 py-1 text-xs font-semibold text-[#34D399]">
                  {goal.xp_value} XP
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
