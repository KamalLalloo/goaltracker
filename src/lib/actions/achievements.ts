"use client";

import { supabase } from "@/lib/supabase/client";
import type { Achievement } from "@/lib/types";

export async function fetchAchievements() {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
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
  const { data, error } = await supabase
    .from("achievements")
    .insert(input)
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
  const { data, error } = await supabase
    .from("achievements")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Achievement;
}

export async function deleteAchievement(id: string) {
  const { error } = await supabase.from("achievements").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
