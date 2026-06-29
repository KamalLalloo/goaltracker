"use client";

import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth/client";
import type { DailyGoal } from "@/lib/types";

export async function fetchGoals(goalDate?: string) {
  const user = await getCurrentUser();
  let query = supabase
    .from("daily_goals")
    .select("*")
    .eq("user_id", user.id)
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
  project_id?: string | null;
}) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("daily_goals")
    .insert({
      user_id: user.id,
      goal_date: input.goal_date,
      title: input.title,
      xp_value: input.xp_value,
      project_id: input.project_id || null,
      completed: false,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as DailyGoal;
}

export async function updateGoal(
  id: string,
  input: Partial<Pick<DailyGoal, "title" | "xp_value" | "completed" | "project_id">>,
) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("daily_goals")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as DailyGoal;
}

export async function deleteGoal(id: string) {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from("daily_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
}
