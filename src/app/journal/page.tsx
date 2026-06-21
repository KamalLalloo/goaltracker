"use client";

import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { fetchAchievements } from "@/lib/actions/achievements";
import { fetchEntries } from "@/lib/actions/entries";
import { fetchGoals } from "@/lib/actions/goals";
import type { Achievement, DailyEntry, DailyGoal } from "@/lib/types";
import {
  achievementXP,
  completedGoalXP,
  completionPercentage,
  todayISO,
} from "@/lib/utils/xp";

type Filter = "week" | "month" | "year";

export default function JournalPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<Filter>("month");
  const [dateSearch, setDateSearch] = useState("");
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [entryData, goalData, achievementData] = await Promise.all([
          fetchEntries(),
          fetchGoals(),
          fetchAchievements(),
        ]);
        setEntries(
          entryData.sort((a, b) => b.entry_date.localeCompare(a.entry_date)),
        );
        setGoals(goalData);
        setAchievements(achievementData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load journal.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const visibleEntries = useMemo(() => {
    const start = rangeStart(filter);
    const today = todayISO();

    return entries.filter((entry) => {
      const inRange = entry.entry_date >= start && entry.entry_date <= today;
      const matchesDate = dateSearch ? entry.entry_date === dateSearch : true;
      return inRange && matchesDate;
    });
  }, [dateSearch, entries, filter]);

  if (loading) return <PageShell>Loading journal...</PageShell>;
  if (error) return <PageShell>{error}</PageShell>;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
            History
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Journal
          </h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-[220px_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-[39px] text-[#A1A1AA]"
              size={16}
            />
            <Input
              className="pl-10"
              label="Search by date"
              onChange={(event) => setDateSearch(event.target.value)}
              type="date"
              value={dateSearch}
            />
          </div>
          <div className="self-end rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-1">
            {(["week", "month", "year"] as Filter[]).map((item) => (
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
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      {visibleEntries.length === 0 ? (
        <EmptyState>No journal entries match this view.</EmptyState>
      ) : (
        <div className="space-y-4">
          {visibleEntries.map((entry) => {
            const isOpen = openIds.includes(entry.id);
            const dayGoals = goals.filter(
              (goal) => goal.goal_date === entry.entry_date,
            );
            const dayAchievements = achievements.filter(
              (achievement) => achievement.achieved_date === entry.entry_date,
            );
            const completed = dayGoals.filter((goal) => goal.completed);
            const missed = dayGoals.filter((goal) => !goal.completed);
            const successRate = completionPercentage(
              completed.length,
              dayGoals.length,
            );
            const dayXp =
              completedGoalXP(dayGoals) + achievementXP(dayAchievements);

            return (
              <Card className="p-0" key={entry.id}>
                <button
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  onClick={() =>
                    setOpenIds((current) =>
                      current.includes(entry.id)
                        ? current.filter((id) => id !== entry.id)
                        : [...current, entry.id],
                    )
                  }
                  type="button"
                >
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {formatDate(entry.entry_date)}
                    </p>
                    <p className="mt-1 text-sm text-[#A1A1AA]">
                      Day Rating {entry.mood ?? "--"} / 10
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="text-[#34D399]" size={22} />
                  ) : (
                    <ChevronRight className="text-[#A1A1AA]" size={22} />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-[#1A1A1A] p-5">
                    <div className="mb-5 grid gap-3 md:grid-cols-4">
                      <JournalMetric label="Goals Completed" value={completed.length} />
                      <JournalMetric label="Goals Missed" value={missed.length} />
                      <JournalMetric label="Success Rate" value={`${successRate}%`} />
                      <JournalMetric label="XP Earned" value={dayXp} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <JournalText label="Quote" value={entry.quote} />
                      <JournalText
                        label="What Went Well"
                        value={entry.what_went_well}
                      />
                      <JournalText
                        label="What Could Improve"
                        value={entry.what_could_improve}
                      />
                      <JournalText
                        label="What Did I Learn"
                        value={entry.what_did_i_learn}
                      />
                      <JournalText
                        label="Idea Of The Day"
                        value={entry.idea_of_day}
                      />
                      <JournalText label="Biggest Win" value={entry.biggest_win} />
                      <JournalText
                        label="Tomorrow Focus"
                        value={entry.tomorrow_focus}
                      />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <JournalMetric
                        label="Sleep Score"
                        value={entry.sleep_score ?? "--"}
                      />
                      <JournalMetric
                        label="Wake Time"
                        value={entry.wake_time?.slice(0, 5) ?? "--"}
                      />
                      <JournalMetric
                        label="Exercise Minutes"
                        value={entry.exercise_minutes ?? "--"}
                      />
                      <JournalMetric
                        label="Exercise Intensity"
                        value={entry.exercise_intensity ?? "--"}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JournalMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4">
      <p className="text-xs font-medium text-[#A1A1AA]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function JournalText({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4">
      <p className="mb-2 text-xs font-medium text-[#A1A1AA]">{label}</p>
      <p className="whitespace-pre-wrap text-sm leading-6 text-white">
        {value?.trim() || "--"}
      </p>
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

function rangeStart(filter: Filter) {
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
