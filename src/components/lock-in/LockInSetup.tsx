"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { DailyGoal, LockInProjectOption } from "@/lib/types";

const presets = [15, 25, 45, 60, 90];

type Props = {
  goals: DailyGoal[];
  projects: LockInProjectOption[];
  onStart: (input: {
    task: string;
    plannedMinutes: number;
    projectId: string | null;
    dailyGoalId: string | null;
  }) => Promise<void>;
  saving: boolean;
  error: string;
};

export function LockInSetup({ goals, projects, onStart, saving, error }: Props) {
  const [task, setTask] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [projectId, setProjectId] = useState("");
  const [dailyGoalId, setDailyGoalId] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!task.trim() || minutes < 1) return;

    await onStart({
      task: task.trim(),
      plannedMinutes: minutes,
      projectId: projectId || null,
      dailyGoalId: dailyGoalId || null,
    });
  }

  return (
    <Card title="Start a Focus Session" eyebrow="One thing">
      <form className="grid gap-5" onSubmit={submit}>
        <Input
          label="Task"
          onChange={(event) => setTask(event.target.value)}
          placeholder="What are you locking in on?"
          value={task}
        />

        <div>
          <p className="mb-3 text-sm font-medium text-[#A1A1AA]">Focus Time</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                className={`h-10 rounded-2xl px-4 text-sm font-semibold transition ${
                  minutes === preset
                    ? "bg-[#34D399] text-black"
                    : "border border-[#1A1A1A] bg-white/[0.04] text-[#A1A1AA] hover:text-white"
                }`}
                key={preset}
                onClick={() => setMinutes(preset)}
                type="button"
              >
                {preset} min
              </button>
            ))}
          </div>
          <Input
            min={1}
            onChange={(event) => setMinutes(Math.max(1, Number(event.target.value)))}
            type="number"
            value={minutes}
          />
        </div>

        {projects.length > 0 && (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">
              Linked Project
            </span>
            <select
              className="h-11 w-full rounded-2xl border border-[#1A1A1A] bg-black/40 px-4 text-sm text-white outline-none focus:border-[#34D399]/70"
              onChange={(event) => setProjectId(event.target.value)}
              value={projectId}
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">
            Linked Daily Goal
          </span>
          <select
            className="h-11 w-full rounded-2xl border border-[#1A1A1A] bg-black/40 px-4 text-sm text-white outline-none focus:border-[#34D399]/70"
            onChange={(event) => setDailyGoalId(event.target.value)}
            value={dailyGoalId}
          >
            <option value="">No daily goal</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <Button className="h-12 w-full sm:w-fit" disabled={saving} type="submit">
          <Play size={18} />
          Lock In
        </Button>
      </form>
    </Card>
  );
}
