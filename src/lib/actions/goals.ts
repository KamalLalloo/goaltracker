"use client";

import { supabase } from "@/lib/supabase/client";
import type { DailyGoal } from "@/lib/types";

export async function fetchGoals(goalDate?: string) {
  let query = supabase
    .from("daily_goals")
    .select("*")
    .order("created_at", { ascending: true });

  if (goalDate) {
    query = query.eq("goal_date", goalDate);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as DailyGoal[];
}

export async function createGoal(input: {
  goal_date: string;
  title: string;
  xp_value: number;
}) {
  const { data, error } = await supabase
    .from("daily_goals")
    .insert({
      goal_date: input.goal_date,
      title: input.title,
      xp_value: input.xp_value,
      completed: false,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as DailyGoal;
}

export async function updateGoal(
  id: string,
  input: Partial<Pick<DailyGoal, "title" | "xp_value" | "completed">>,
) {
  const { data, error } = await supabase
    .from("daily_goals")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as DailyGoal;
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from("daily_goals").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
