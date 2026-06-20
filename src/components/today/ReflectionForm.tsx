"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { upsertEntry } from "@/lib/actions/entries";
import type { DailyEntry } from "@/lib/types";

type Props = {
  date: string;
  entry: DailyEntry | null;
  onChange: (entry: DailyEntry) => void;
};

export function ReflectionForm({ date, entry, onChange }: Props) {
  const [form, setForm] = useState({
    what_went_well: entry?.what_went_well ?? "",
    what_could_improve: entry?.what_could_improve ?? "",
    what_did_i_learn: entry?.what_did_i_learn ?? "",
    idea_of_day: entry?.idea_of_day ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    try {
      setSaving(true);
      setMessage("");
      const saved = await upsertEntry(date, form);
      onChange(saved);
      setMessage("Reflection saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save reflection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      title="Reflection"
      action={
        <Button disabled={saving} onClick={save} type="button">
          <Save size={16} />
          Save
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          label="What Went Well?"
          onChange={(event) =>
            setForm({ ...form, what_went_well: event.target.value })
          }
          value={form.what_went_well}
        />
        <Textarea
          label="What Could Improve?"
          onChange={(event) =>
            setForm({ ...form, what_could_improve: event.target.value })
          }
          value={form.what_could_improve}
        />
        <Textarea
          label="What Did I Learn?"
          onChange={(event) =>
            setForm({ ...form, what_did_i_learn: event.target.value })
          }
          value={form.what_did_i_learn}
        />
        <Textarea
          label="Idea Of The Day"
          onChange={(event) =>
            setForm({ ...form, idea_of_day: event.target.value })
          }
          value={form.idea_of_day}
        />
      </div>
      {message && <p className="mt-4 text-sm text-[#A1A1AA]">{message}</p>}
    </Card>
  );
}
