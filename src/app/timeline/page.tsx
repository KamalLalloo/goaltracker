"use client";

import { Activity, CalendarDays, Dumbbell, Moon, Scale, Smile, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchEntries } from "@/lib/actions/entries";
import { fetchFoodEntries } from "@/lib/actions/food";
import { fetchGoals } from "@/lib/actions/goals";
import type { DailyEntry, DailyGoal, FoodEntry } from "@/lib/types";
import { completionPercentage, exerciseXPForEntry } from "@/lib/utils/xp";

export default function TimelinePage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [entryData, goalData, foodData] = await Promise.all([
          fetchEntries(),
          fetchGoals(),
          fetchFoodEntries(),
        ]);
        setEntries(
          entryData.sort((a, b) => b.entry_date.localeCompare(a.entry_date)),
        );
        setGoals(goalData);
        setFoods(foodData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load timeline.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const days = useMemo(
    () =>
      entries.map((entry) => {
        const dayGoals = goals.filter((goal) => goal.goal_date === entry.entry_date);
        const completedGoals = dayGoals.filter((goal) => goal.completed).length;
        const foodCount = foods.filter(
          (food) => food.entry_date === entry.entry_date,
        ).length;

        return {
          entry,
          completedGoals,
          totalGoals: dayGoals.length,
          completion: completionPercentage(completedGoals, dayGoals.length),
          foodCount,
          exerciseXp: exerciseXPForEntry(entry),
        };
      }),
    [entries, foods, goals],
  );

  if (loading) return <PageShell>Loading timeline...</PageShell>;
  if (error) return <PageShell>{error}</PageShell>;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
          Daily record
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Timeline
        </h1>
      </header>

      {days.length === 0 ? (
        <EmptyState>No daily entries yet.</EmptyState>
      ) : (
        <div className="relative space-y-4 before:absolute before:bottom-0 before:left-5 before:top-0 before:w-px before:bg-[#1A1A1A]">
          {days.map((day) => (
            <div className="relative pl-12" key={day.entry.id}>
              <div className="absolute left-0 top-6 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] text-[#34D399]">
                <CalendarDays size={18} />
              </div>
              <Card>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {formatDate(day.entry.entry_date)}
                    </p>
                    <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-[#A1A1AA]">
                      {day.entry.idea_of_day?.trim() || "No comment added."}
                    </p>
                  </div>
                  <div className="rounded-full bg-[#34D399]/10 px-3 py-1 text-sm font-semibold text-[#34D399]">
                    {day.entry.mood ?? "--"}/10
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric
                    icon={<Smile size={17} />}
                    label="Day Rating"
                    value={day.entry.mood ?? "--"}
                  />
                  <Metric
                    icon={<Activity size={17} />}
                    label="Goals"
                    value={`${day.completedGoals}/${day.totalGoals} · ${day.completion}%`}
                  />
                  <Metric
                    icon={<Moon size={17} />}
                    label="Sleep"
                    value={day.entry.sleep_score ? `${day.entry.sleep_score}/100` : "--"}
                  />
                  <Metric
                    icon={<Dumbbell size={17} />}
                    label="Exercise"
                    value={`${day.entry.exercise_minutes ?? 0} min · ${day.exerciseXp} XP`}
                  />
                  <Metric
                    icon={<Activity size={17} />}
                    label="Intensity"
                    value={day.entry.exercise_intensity ?? "--"}
                  />
                  <Metric
                    icon={<Scale size={17} />}
                    label="Weight"
                    value={day.entry.weight ? `${day.entry.weight} kg` : "--"}
                  />
                  <Metric
                    icon={<Utensils size={17} />}
                    label="Food Items"
                    value={day.foodCount}
                  />
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4">
      <div className="mb-3 text-[#34D399]">{icon}</div>
      <p className="text-xs font-medium text-[#A1A1AA]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
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
