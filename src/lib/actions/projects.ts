"use client";

import { getCurrentUser } from "@/lib/auth/client";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

export async function fetchProjects() {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Project[];
}

export async function createProject(input: {
  title: string;
  description: string;
  priority: string;
  target_date: string | null;
  xp_reward: number;
  status: string;
}) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, ...input })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Project;
}

export async function updateProject(
  id: string,
  input: Partial<
    Pick<
      Project,
      "title" | "description" | "priority" | "target_date" | "xp_reward" | "status"
    >
  >,
) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("projects")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Project;
}

export async function deleteProject(id: string) {
  const user = await getCurrentUser();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
