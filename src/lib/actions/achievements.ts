"use client";

import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/auth/client";
import type { Achievement } from "@/lib/types";

export async function fetchAchievements() {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("achieved_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Achievement[];
}

export async function createAchievement(input: {
  title: string;
  description: string;
  xp_awarded: number;
  achieved_date: string;
}) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("achievements")
    .insert({ user_id: user.id, ...input })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Achievement;
}

export async function updateAchievement(
  id: string,
  input: Partial<
    Pick<Achievement, "title" | "description" | "xp_awarded" | "achieved_date">
  >,
) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("achievements")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Achievement;
}

export async function deleteAchievement(id: string) {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from("achievements")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
}
