"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  createAchievement,
  fetchAchievements,
} from "@/lib/actions/achievements";
import type { Achievement } from "@/lib/types";
import { todayISO } from "@/lib/utils/xp";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    xp_awarded: 25,
    achieved_date: todayISO(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setAchievements(await fetchAchievements());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load achievements.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function addAchievement(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;

    try {
      setSaving(true);
      setError("");
      const achievement = await createAchievement({
        ...form,
        title: form.title.trim(),
      });
      setAchievements([achievement, ...achievements].sort(sortByDateDesc));
      setForm({
        title: "",
        description: "",
        xp_awarded: 25,
        achieved_date: todayISO(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create achievement.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageShell>Loading achievements...</PageShell>;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
          Milestones
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Achievements
        </h1>
      </header>

      <Card title="Create Achievement">
        <form className="grid gap-4" onSubmit={addAchievement}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Title"
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Completed a focused sprint"
              value={form.title}
            />
            <Input
              label="Date"
              onChange={(event) =>
                setForm({ ...form, achieved_date: event.target.value })
              }
              type="date"
              value={form.achieved_date}
            />
          </div>
          <Textarea
            label="Description"
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            value={form.description}
          />
          <div className="grid gap-4 md:grid-cols-[180px_auto]">
            <Input
              label="XP Awarded"
              min={0}
              onChange={(event) =>
                setForm({ ...form, xp_awarded: Number(event.target.value) })
              }
              type="number"
              value={form.xp_awarded}
            />
            <Button className="self-end md:w-fit" disabled={saving} type="submit">
              <Plus size={17} />
              Create
            </Button>
          </div>
        </form>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </Card>

      {achievements.length === 0 ? (
        <EmptyState>No achievements yet.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard
              achievement={achievement}
              key={achievement.id}
              onDelete={(id) =>
                setAchievements((current) =>
                  current.filter((item) => item.id !== id),
                )
              }
              onUpdate={(updated) =>
                setAchievements((current) =>
                  current
                    .map((item) => (item.id === updated.id ? updated : item))
                    .sort(sortByDateDesc),
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function sortByDateDesc(a: Achievement, b: Achievement) {
  return b.achieved_date.localeCompare(a.achieved_date);
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-sm text-[#A1A1AA]">
      {children}
    </div>
  );
}
