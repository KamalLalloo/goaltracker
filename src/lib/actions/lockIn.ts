"use client";

import { getCurrentUser } from "@/lib/auth/client";
import { supabase } from "@/lib/supabase/client";
import type { LockInProjectOption, LockInSession } from "@/lib/types";

export async function fetchLockInSessions(startDate?: string, limit?: number) {
  const user = await getCurrentUser();
  let query = supabase
    .from("lock_in_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (startDate) {
    query = query.gte("created_at", `${startDate}T00:00:00`);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as LockInSession[];
}

export async function fetchActiveLockInSession() {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("lock_in_sessions")
    .select("*")
    .eq("user_id", user.id)
    .not("started_at", "is", null)
    .is("completed_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as LockInSession | null;
}

export async function createLockInSession(input: {
  task: string;
  planned_minutes: number;
  project_id?: string | null;
  daily_goal_id?: string | null;
}) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("lock_in_sessions")
    .insert({
      user_id: user.id,
      task: input.task,
      planned_minutes: input.planned_minutes,
      started_at: new Date().toISOString(),
      project_id: input.project_id || null,
      daily_goal_id: input.daily_goal_id || null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as LockInSession;
}

export async function updateLockInPlannedMinutes(id: string, plannedMinutes: number) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("lock_in_sessions")
    .update({ planned_minutes: plannedMinutes })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as LockInSession;
}

export async function finishLockInSession(
  id: string,
  input: {
    actual_minutes: number;
    completed: boolean;
    satisfaction_score?: number | null;
    comments?: string | null;
  },
) {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("lock_in_sessions")
    .update({
      actual_minutes: input.actual_minutes,
      completed: input.completed,
      satisfaction_score: input.satisfaction_score ?? null,
      comments: input.comments || null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as LockInSession;
}

export async function fetchLockInProjectOptions() {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("projects")
    .select("id,title,status")
    .eq("user_id", user.id)
    .in("status", ["Planning", "Active"])
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map((project) => ({
    id: project.id,
    title: project.title,
  })) as LockInProjectOption[];
}
