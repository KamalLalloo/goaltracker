"use client";

import { LogIn, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell>Loading...</LoginShell>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get("error") ?? "");

  async function continueWithGoogle() {
    try {
      setLoading(true);
      setError("");

      const next = searchParams.get("next") || "/";
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign in failed.");
      setLoading(false);
    }
  }

  return (
    <LoginShell>
      <Button
        className="h-12 w-full"
        disabled={loading}
        onClick={continueWithGoogle}
        type="button"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <LogIn size={18} />
        )}
        Continue with Google
      </Button>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}
    </LoginShell>
  );
}

function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-10">
      <div className="w-full max-w-md rounded-[24px] border border-[#1A1A1A] bg-[#0D0D0D] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#34D399] text-2xl font-black text-black">
            G
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            GoalTracker
          </h1>
          <p className="mt-3 text-sm text-[#A1A1AA]">
            Your personal operating system.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
