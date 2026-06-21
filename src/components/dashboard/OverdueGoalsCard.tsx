import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DailyGoal } from "@/lib/types";

export function OverdueGoalsCard({ goals }: { goals: DailyGoal[] }) {
  return (
    <Card title="Overdue Goals" eyebrow="Needs attention">
      {goals.length === 0 ? (
        <EmptyState>No overdue goals.</EmptyState>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <div
              className="flex items-center justify-between gap-3 rounded-[18px] border border-red-500/25 bg-red-500/10 p-3"
              key={goal.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <AlertTriangle className="shrink-0 text-red-300" size={17} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {goal.title}
                  </p>
                  <p className="text-xs text-red-200">{goal.goal_date}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-200">
                {goal.xp_value} XP
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
