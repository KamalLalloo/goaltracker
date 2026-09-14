"use client";

import { Flag, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { LockInSession } from "@/lib/types";

type Props = {
  session: LockInSession;
  remainingMs: number;
  elapsedMs: number;
  projectTitle?: string;
  goalTitle?: string;
  onAddTime: (minutes: number) => void;
  onFinishEarly: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string;
};

export function ActiveLockIn({
  session,
  remainingMs,
  elapsedMs,
  projectTitle,
  goalTitle,
  onAddTime,
  onFinishEarly,
  onCancel,
  saving,
  error,
}: Props) {
  return (
    <Card className="mx-auto w-full max-w-4xl text-center">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#34D399]">
          Currently Locked In
        </p>
        <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
          {session.task}
        </h2>
        <p className="mt-8 font-mono text-7xl font-semibold tracking-tight text-white sm:text-8xl">
          {formatClock(remainingMs)}
        </p>
        <div className="mt-8 grid gap-3 text-sm text-[#A1A1AA] sm:grid-cols-3">
          <Stat label="Planned" value={`${session.planned_minutes} min`} />
          <Stat label="Elapsed" value={formatDuration(elapsedMs)} />
          <Stat label="Linked" value={goalTitle || projectTitle || "None"} />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button disabled={saving} onClick={() => onAddTime(5)} type="button" variant="secondary">
            <Plus size={17} />
            5 min
          </Button>
          <Button disabled={saving} onClick={() => onAddTime(15)} type="button" variant="secondary">
            <Plus size={17} />
            15 min
          </Button>
          <Button disabled={saving} onClick={onFinishEarly} type="button">
            <Flag size={17} />
            Finish Early
          </Button>
          <Button disabled={saving} onClick={onCancel} type="button" variant="danger">
            <X size={17} />
            Cancel Session
          </Button>
        </div>
        {error && <p className="mt-5 text-sm text-red-300">{error}</p>}
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4">
      <p className="text-xs">{label}</p>
      <p className="mt-2 truncate text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function formatClock(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDuration(ms: number) {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
}
