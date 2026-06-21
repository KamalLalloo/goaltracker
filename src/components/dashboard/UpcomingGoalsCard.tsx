import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DailyGoal } from "@/lib/types";
import { dailyGoalGroups } from "@/lib/utils/xp";

export function UpcomingGoalsCard({ goals }: { goals: DailyGoal[] }) {
  const groups = dailyGoalGroups(goals);
  const dates = Object.keys(groups).sort();

  return (
    <Card title="Upcoming Goals" eyebrow="Next 7 days">
      {dates.length === 0 ? (
        <EmptyState>No upcoming goals scheduled.</EmptyState>
      ) : (
        <div className="space-y-5">
          {dates.map((date) => (
            <div key={date}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <CalendarDays size={16} className="text-[#34D399]" />
                {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="space-y-2">
                {groups[date].map((goal) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-[18px] border border-[#1A1A1A] bg-black/25 p-3"
                    key={goal.id}
                  >
                    <p className="min-w-0 truncate text-sm text-white">{goal.title}</p>
                    <span className="shrink-0 rounded-full bg-[#34D399]/10 px-2.5 py-1 text-xs font-semibold text-[#34D399]">
                      {goal.xp_value} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
