"use client";

import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export async function getCurrentUser(): Promise<User> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Missing session. Please sign in again.");
  return data.user;
}
