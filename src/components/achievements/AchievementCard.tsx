"use client";

import { Edit3, Save, Trash2, Trophy, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { deleteAchievement, updateAchievement } from "@/lib/actions/achievements";
import type { Achievement } from "@/lib/types";

type Props = {
  achievement: Achievement;
  onDelete: (id: string) => void;
  onUpdate: (achievement: Achievement) => void;
};

export function AchievementCard({ achievement, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: achievement.title,
    description: achievement.description ?? "",
    xp_awarded: achievement.xp_awarded,
    achieved_date: achievement.achieved_date,
  });
  const [error, setError] = useState("");

  async function save() {
    try {
      setError("");
      const updated = await updateAchievement(achievement.id, form);
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save achievement.");
    }
  }

  async function remove() {
    try {
      setError("");
      await deleteAchievement(achievement.id);
      onDelete(achievement.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete achievement.");
    }
  }

  if (editing) {
    return (
      <article className="rounded-[22px] border border-[#1A1A1A] bg-[#0D0D0D] p-5">
        <div className="grid gap-4">
          <Input
            label="Title"
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            value={form.title}
          />
          <Textarea
            label="Description"
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            value={form.description}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="XP Awarded"
              min={0}
              onChange={(event) =>
                setForm({ ...form, xp_awarded: Number(event.target.value) })
              }
              type="number"
              value={form.xp_awarded}
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
          {error && <p className="text-sm text-red-300">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={save} type="button">
              <Save size={16} />
              Save
            </Button>
            <Button onClick={() => setEditing(false)} type="button" variant="secondary">
              <X size={16} />
              Cancel
            </Button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[22px] border border-[#1A1A1A] bg-[#0D0D0D] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#34D399]/10 text-[#34D399]">
            <Trophy size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{achievement.title}</h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              {new Date(achievement.achieved_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#34D399]/10 px-3 py-1 text-sm font-semibold text-[#34D399]">
          {achievement.xp_awarded} XP
        </span>
      </div>
      <p className="min-h-12 text-sm leading-6 text-[#A1A1AA]">
        {achievement.description || "No description."}
      </p>
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      <div className="mt-5 flex gap-2">
        <Button onClick={() => setEditing(true)} type="button" variant="secondary">
          <Edit3 size={16} />
          Edit
        </Button>
        <Button onClick={remove} type="button" variant="danger">
          <Trash2 size={16} />
          Delete
        </Button>
      </div>
    </article>
  );
}
