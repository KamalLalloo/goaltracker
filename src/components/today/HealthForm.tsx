"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { upsertEntry } from "@/lib/actions/entries";
import type { DailyEntry } from "@/lib/types";

type Props = {
  date: string;
  entry: DailyEntry | null;
  onChange: (entry: DailyEntry) => void;
};

const intensities = ["Low", "Medium", "High", "Peak"];

export function HealthForm({ date, entry, onChange }: Props) {
  const [form, setForm] = useState({
    sleep_score: entry?.sleep_score ?? 75,
    wake_time: entry?.wake_time?.slice(0, 5) ?? "07:00",
    exercise_minutes: entry?.exercise_minutes ?? 0,
    exercise_intensity: entry?.exercise_intensity ?? "Medium",
    mood: entry?.mood ?? 7,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    try {
      setSaving(true);
      setMessage("");
      const saved = await upsertEntry(date, form);
      onChange(saved);
      setMessage("Health metrics saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save health.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      title="Health Metrics"
      action={
        <Button disabled={saving} onClick={save} type="button">
          <Save size={16} />
          Save
        </Button>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">
            Sleep Score: {form.sleep_score}
          </span>
          <input
            className="h-11 w-full"
            max={100}
            min={0}
            onChange={(event) =>
              setForm({ ...form, sleep_score: Number(event.target.value) })
            }
            type="range"
            value={form.sleep_score}
          />
        </label>
        <Input
          label="Wake Time"
          onChange={(event) => setForm({ ...form, wake_time: event.target.value })}
          type="time"
          value={form.wake_time}
        />
        <Input
          label="Exercise Minutes"
          min={0}
          onChange={(event) =>
            setForm({ ...form, exercise_minutes: Number(event.target.value) })
          }
          type="number"
          value={form.exercise_minutes}
        />
        <label>
          <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">
            Exercise Intensity
          </span>
          <select
            className="h-11 w-full rounded-2xl border border-[#1A1A1A] bg-black/40 px-4 text-sm text-white outline-none focus:border-[#34D399]/70"
            onChange={(event) =>
              setForm({ ...form, exercise_intensity: event.target.value })
            }
            value={form.exercise_intensity}
          >
            {intensities.map((intensity) => (
              <option key={intensity}>{intensity}</option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">
            Day Rating: {form.mood}
          </span>
          <input
            className="h-11 w-full"
            max={10}
            min={1}
            onChange={(event) =>
              setForm({ ...form, mood: Number(event.target.value) })
            }
            type="range"
            value={form.mood}
          />
        </label>
      </div>
      {message && <p className="mt-4 text-sm text-[#A1A1AA]">{message}</p>}
    </Card>
  );
}
