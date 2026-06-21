"use client";

import { useEffect, useState } from "react";
import { GoalsForm } from "@/components/today/GoalsForm";
import { HealthForm } from "@/components/today/HealthForm";
import { QuoteForm } from "@/components/today/QuoteForm";
import { ReflectionForm } from "@/components/today/ReflectionForm";
import { fetchEntry } from "@/lib/actions/entries";
import { fetchGoals } from "@/lib/actions/goals";
import type { DailyEntry, DailyGoal } from "@/lib/types";
import { todayISO } from "@/lib/utils/xp";

export default function TodayPage() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const today = todayISO();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [goalsData, entryData] = await Promise.all([
          fetchGoals(),
          fetchEntry(today),
        ]);
        setGoals(goalsData);
        setEntry(entryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load today.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [today]);

  if (loading) return <PageShell>Loading today...</PageShell>;
  if (error) return <PageShell>{error}</PageShell>;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
          Daily input
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Today
        </h1>
      </header>
      <GoalsForm date={today} goals={goals} onChange={setGoals} />
      <ReflectionForm date={today} entry={entry} onChange={setEntry} />
      <HealthForm date={today} entry={entry} onChange={setEntry} />
      <QuoteForm date={today} entry={entry} onChange={setEntry} />
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
