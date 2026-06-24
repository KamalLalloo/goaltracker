"use client";

import { getCurrentUser } from "@/lib/auth/client";
import { supabase } from "@/lib/supabase/client";
import type { FoodEntry } from "@/lib/types";

export async function fetchFoodEntries(entryDate?: string, startDate?: string) {
  const user = await getCurrentUser();
  let query = supabase
    .from("food_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (entryDate) query = query.eq("entry_date", entryDate);
  if (startDate) query = query.gte("entry_date", startDate);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as FoodEntry[];
}

export async function createFoodEntry(input: {
  entry_date: string;
  food_name: string;
}) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("food_entries")
    .insert({
      user_id: user.id,
      entry_date: input.entry_date,
      food_name: input.food_name,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as FoodEntry;
}

export async function deleteFoodEntry(id: string) {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from("food_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
