"use client";

import { supabase } from "@/lib/supabase/client";
import type { DailyEntry, EntryUpdate } from "@/lib/types";

export async function fetchEntry(entryDate: string) {
  const { data, error } = await supabase
    .from("daily_entries")
    .select("*")
    .eq("entry_date", entryDate)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as DailyEntry | null;
}

export async function fetchEntries(startDate?: string) {
  let query = supabase
    .from("daily_entries")
    .select("*")
    .order("entry_date", { ascending: true });

  if (startDate) {
    query = query.gte("entry_date", startDate);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as DailyEntry[];
}

export async function upsertEntry(entryDate: string, input: EntryUpdate) {
  const existing = await fetchEntry(entryDate);

  if (existing) {
    const { data, error } = await supabase
      .from("daily_entries")
      .update(input)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as DailyEntry;
  }

  const { data, error } = await supabase
    .from("daily_entries")
    .insert({ entry_date: entryDate, ...input })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as DailyEntry;
}
