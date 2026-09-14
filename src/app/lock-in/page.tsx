"use client";

import { useEffect, useMemo, useState } from "react";
import { ActiveLockIn } from "@/components/lock-in/ActiveLockIn";
import { LockInHistory } from "@/components/lock-in/LockInHistory";
import { LockInReview } from "@/components/lock-in/LockInReview";
import { LockInSetup } from "@/components/lock-in/LockInSetup";
import {
  createLockInSession,
  fetchActiveLockInSession,
  fetchLockInProjectOptions,
  fetchLockInSessions,
  finishLockInSession,
  updateLockInPlannedMinutes,
} from "@/lib/actions/lockIn";
import { fetchGoals, updateGoal } from "@/lib/actions/goals";
import type { DailyGoal, LockInProjectOption, LockInSession } from "@/lib/types";

type Mode = "setup" | "active" | "review";

export default function LockInPage() {
  const [mode, setMode] = useState<Mode>("setup");
  const [session, setSession] = useState<LockInSession | null>(null);
  const [history, setHistory] = useState<LockInSession[]>([]);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [projects, setProjects] = useState<LockInProjectOption[]>([]);
  const [reviewEndedAt, setReviewEndedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [active, sessions, goalData, projectData] = await Promise.all([
          fetchActiveLockInSession(),
          fetchLockInSessions(undefined, 10),
          fetchGoals(),
          fetchLockInProjectOptions(),
        ]);
        setHistory(sessions);
        setGoals(goalData);
        setProjects(projectData);

        if (active?.started_at) {
          setSession(active);
          const expectedEnd = expectedEndTime(active);
          if (Date.now() >= expectedEnd) {
            setReviewEndedAt(expectedEnd);
            setMode("review");
          } else {
            setMode("active");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Lock In.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (mode !== "active") return;

    const interval = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (session?.started_at && currentTime >= expectedEndTime(session)) {
        setReviewEndedAt(expectedEndTime(session));
        setMode("review");
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [mode, session]);

  const remainingMs = useMemo(() => {
    if (!session?.started_at) return 0;
    return Math.max(0, expectedEndTime(session) - now);
  }, [now, session]);

  const elapsedMs = useMemo(() => {
    if (!session?.started_at) return 0;
    return Math.max(0, now - new Date(session.started_at).getTime());
  }, [now, session]);

  const incompleteGoals = useMemo(
    () => goals.filter((goal) => !goal.completed),
    [goals],
  );
  const linkedGoal = useMemo(
    () => goals.find((goal) => goal.id === session?.daily_goal_id),
    [goals, session?.daily_goal_id],
  );
  const linkedProject = useMemo(
    () => projects.find((project) => project.id === session?.project_id),
    [projects, session?.project_id],
  );
  const reviewActualMinutes = useMemo(() => {
    if (!session?.started_at) return 0;
    const endedAt = reviewEndedAt ?? Math.min(now, expectedEndTime(session));
    return elapsedMinutes(session.started_at, endedAt);
  }, [now, reviewEndedAt, session]);

  async function start(input: {
    task: string;
    plannedMinutes: number;
    projectId: string | null;
    dailyGoalId: string | null;
  }) {
    try {
      setSaving(true);
      setError("");
      const created = await createLockInSession({
        task: input.task,
        planned_minutes: input.plannedMinutes,
        project_id: input.projectId,
        daily_goal_id: input.dailyGoalId,
      });
      setSession(created);
      setReviewEndedAt(null);
      setMode("active");
      setNow(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session.");
    } finally {
      setSaving(false);
    }
  }

  async function addTime(minutes: number) {
    if (!session) return;
    try {
      setSaving(true);
      setError("");
      const updated = await updateLockInPlannedMinutes(
        session.id,
        session.planned_minutes + minutes,
      );
      setSession(updated);
      setNow(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add time.");
    } finally {
      setSaving(false);
    }
  }

  function finishEarly() {
    setReviewEndedAt(Date.now());
    setMode("review");
  }

  async function cancelSession() {
    if (!session?.started_at) return;
    const confirmed = window.confirm("Cancel this Lock In session?");
    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      const endedAt = Date.now();
      const cancelled = await finishLockInSession(session.id, {
        actual_minutes: elapsedMinutes(session.started_at, endedAt),
        completed: false,
        satisfaction_score: null,
        comments: "Session cancelled.",
      });
      setHistory((current) => [cancelled, ...current.filter((item) => item.id !== cancelled.id)].slice(0, 10));
      setSession(null);
      setReviewEndedAt(null);
      setMode("setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel session.");
    } finally {
      setSaving(false);
    }
  }

  async function saveReview(input: {
    completed: boolean;
    satisfactionScore: number;
    comments: string;
    markGoalComplete: boolean;
  }) {
    if (!session) return;

    try {
      setSaving(true);
      setError("");
      const saved = await finishLockInSession(session.id, {
        actual_minutes: reviewActualMinutes,
        completed: input.completed,
        satisfaction_score: input.satisfactionScore,
        comments: input.comments,
      });

      if (input.completed && input.markGoalComplete && session.daily_goal_id) {
        await updateGoal(session.daily_goal_id, { completed: true });
        setGoals((current) =>
          current.map((goal) =>
            goal.id === session.daily_goal_id ? { ...goal, completed: true } : goal,
          ),
        );
      }

      setHistory((current) => [saved, ...current.filter((item) => item.id !== saved.id)].slice(0, 10));
      setSession(null);
      setReviewEndedAt(null);
      setMode("setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save session.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageShell>Loading Lock In...</PageShell>;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
          Lock In
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Choose one thing. Give it your full attention.
        </h1>
      </header>

      {mode === "active" && session ? (
        <ActiveLockIn
          elapsedMs={elapsedMs}
          error={error}
          goalTitle={linkedGoal?.title}
          onAddTime={addTime}
          onCancel={cancelSession}
          onFinishEarly={finishEarly}
          projectTitle={linkedProject?.title}
          remainingMs={remainingMs}
          saving={saving}
          session={session}
        />
      ) : mode === "review" && session ? (
        <LockInReview
          actualMinutes={reviewActualMinutes}
          error={error}
          goalTitle={linkedGoal?.title}
          onSave={saveReview}
          saving={saving}
          session={session}
        />
      ) : (
        <>
          <LockInSetup
            error={error}
            goals={incompleteGoals}
            onStart={start}
            projects={projects}
            saving={saving}
          />
          <LockInHistory projects={projects} sessions={history} />
        </>
      )}
    </div>
  );
}

function expectedEndTime(session: LockInSession) {
  if (!session.started_at) return Date.now();
  return new Date(session.started_at).getTime() + session.planned_minutes * 60000;
}

function elapsedMinutes(startedAt: string, endedAt: number) {
  return Math.max(1, Math.round((endedAt - new Date(startedAt).getTime()) / 60000));
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-sm text-[#A1A1AA]">
      {children}
    </div>
  );
}
