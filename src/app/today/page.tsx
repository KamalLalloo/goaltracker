"use client";

import { useEffect, useState } from "react";
import { FoodForm } from "@/components/today/FoodForm";
import { GoalsForm } from "@/components/today/GoalsForm";
import { HealthForm } from "@/components/today/HealthForm";
import { QuoteForm } from "@/components/today/QuoteForm";
import { ReflectionForm } from "@/components/today/ReflectionForm";
import { Input } from "@/components/ui/Input";
import { fetchEntry } from "@/lib/actions/entries";
import { fetchFoodEntries } from "@/lib/actions/food";
import { fetchGoals } from "@/lib/actions/goals";
import type { DailyEntry, DailyGoal, FoodEntry } from "@/lib/types";
import { todayISO } from "@/lib/utils/xp";

export default function TodayPage() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [goalsData, entryData, foodData] = await Promise.all([
          fetchGoals(),
          fetchEntry(selectedDate),
          fetchFoodEntries(selectedDate),
        ]);
        setGoals(goalsData);
        setEntry(entryData);
        setFoods(foodData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load today.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [selectedDate]);

  if (loading) return <PageShell>Loading today...</PageShell>;
  if (error) return <PageShell>{error}</PageShell>;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
          Daily input
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Today
        </h1>
        </div>
        <Input
          label="Selected Date"
          onChange={(event) => setSelectedDate(event.target.value)}
          type="date"
          value={selectedDate}
        />
      </header>
      <GoalsForm date={selectedDate} goals={goals} onChange={setGoals} />
      <ReflectionForm date={selectedDate} entry={entry} onChange={setEntry} />
      <HealthForm date={selectedDate} entry={entry} onChange={setEntry} />
      <FoodForm date={selectedDate} foods={foods} onChange={setFoods} />
      <QuoteForm date={selectedDate} entry={entry} onChange={setEntry} />
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
