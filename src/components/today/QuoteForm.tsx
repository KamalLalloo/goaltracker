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

export function QuoteForm({ date, entry, onChange }: Props) {
  const [quote, setQuote] = useState(entry?.quote ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    try {
      setSaving(true);
      setMessage("");
      const saved = await upsertEntry(date, { quote });
      onChange(saved);
      setMessage("Quote saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save quote.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      title="Daily Quote"
      action={
        <Button disabled={saving} onClick={save} type="button">
          <Save size={16} />
          Save
        </Button>
      }
    >
      <Textarea
        className="min-h-40 text-lg leading-8"
        onChange={(event) => setQuote(event.target.value)}
        placeholder="One quote, lesson, or operating principle for today."
        value={quote}
      />
      {message && <p className="mt-4 text-sm text-[#A1A1AA]">{message}</p>}
    </Card>
  );
}
