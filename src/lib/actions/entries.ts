"use client";

import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth/client";
import type { DailyEntry, EntryUpdate } from "@/lib/types";

export async function fetchEntry(entryDate: string) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("daily_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("entry_date", entryDate)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as DailyEntry | null;
}

export async function fetchEntries(startDate?: string) {
  const user = await getCurrentUser();
  let query = supabase
    .from("daily_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: true });

  if (startDate) {
    query = query.gte("entry_date", startDate);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as DailyEntry[];
}

export async function upsertEntry(entryDate: string, input: EntryUpdate) {
  const user = await getCurrentUser();
  const existing = await fetchEntry(entryDate);

  if (existing) {
    const { data, error } = await supabase
      .from("daily_entries")
      .update(input)
      .eq("id", existing.id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data as DailyEntry;
  }

  const { data, error } = await supabase
    .from("daily_entries")
    .insert({ user_id: user.id, entry_date: entryDate, ...input })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as DailyEntry;
}
