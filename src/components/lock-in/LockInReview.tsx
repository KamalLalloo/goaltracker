"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import type { LockInSession } from "@/lib/types";

type Props = {
  session: LockInSession;
  actualMinutes: number;
  goalTitle?: string;
  onSave: (input: {
    completed: boolean;
    satisfactionScore: number;
    comments: string;
    markGoalComplete: boolean;
  }) => Promise<void>;
  saving: boolean;
  error: string;
};

export function LockInReview({
  session,
  actualMinutes,
  goalTitle,
  onSave,
  saving,
  error,
}: Props) {
  const [completed, setCompleted] = useState(true);
  const [satisfactionScore, setSatisfactionScore] = useState(8);
  const [comments, setComments] = useState("");
  const [markGoalComplete, setMarkGoalComplete] = useState(Boolean(session.daily_goal_id));

  return (
    <Card className="mx-auto w-full max-w-3xl" title="Session complete.">
      <div className="grid gap-6">
        <div className="rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4">
          <p className="text-sm text-[#A1A1AA]">Task</p>
          <p className="mt-2 text-xl font-semibold text-white">{session.task}</p>
          <p className="mt-2 text-sm text-[#A1A1AA]">
            Focused for {actualMinutes} minutes
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-[#A1A1AA]">
            Did you complete the task?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[true, false].map((value) => (
              <button
                className={`h-12 rounded-2xl text-sm font-semibold transition ${
                  completed === value
                    ? "bg-[#34D399] text-black"
                    : "border border-[#1A1A1A] bg-white/[0.04] text-[#A1A1AA]"
                }`}
                key={String(value)}
                onClick={() => {
                  setCompleted(value);
                  setMarkGoalComplete(value && Boolean(session.daily_goal_id));
                }}
                type="button"
              >
                {value ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </div>

        <label>
          <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">
            Satisfaction Score: {satisfactionScore}
          </span>
          <input
            className="h-11 w-full"
            max={10}
            min={1}
            onChange={(event) => setSatisfactionScore(Number(event.target.value))}
            type="range"
            value={satisfactionScore}
          />
        </label>

        <Textarea
          label="Comments / Improvements"
          onChange={(event) => setComments(event.target.value)}
          placeholder="What went well? What should change next time?"
          value={comments}
        />

        {session.daily_goal_id && completed && (
          <label className="flex items-start gap-3 rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4 text-sm text-white">
            <input
              checked={markGoalComplete}
              className="mt-1"
              onChange={(event) => setMarkGoalComplete(event.target.checked)}
              type="checkbox"
            />
            <span>
              Mark linked daily goal as completed
              {goalTitle ? `: ${goalTitle}` : ""}
            </span>
          </label>
        )}

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button
          disabled={saving}
          onClick={() =>
            onSave({ completed, satisfactionScore, comments, markGoalComplete })
          }
          type="button"
        >
          <Save size={17} />
          Save Session
        </Button>
      </div>
    </Card>
  );
}
