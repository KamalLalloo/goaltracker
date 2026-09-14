"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LockInProjectOption, LockInSession } from "@/lib/types";

type Props = {
  sessions: LockInSession[];
  projects: LockInProjectOption[];
};

export function LockInHistory({ sessions, projects }: Props) {
  const [expandedId, setExpandedId] = useState("");

  return (
    <Card title="Recent Lock Ins">
      {sessions.length === 0 ? (
        <EmptyState>No Lock In sessions yet.</EmptyState>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const expanded = expandedId === session.id;
            return (
              <div
                className="rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4"
                key={session.id}
              >
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {session.task}
                    </p>
                    <p className="mt-1 text-xs text-[#A1A1AA]">
                      {formatDate(session.started_at ?? session.created_at)} - Planned{" "}
                      {session.planned_minutes}m - Actual{" "}
                      {session.actual_minutes ?? "--"}m
                    </p>
                    <p className="mt-1 text-xs text-[#A1A1AA]">
                      {session.completed ? "Completed" : "Not completed"} - Satisfaction{" "}
                      {session.satisfaction_score ?? "--"}/10
                      {session.project_id
                        ? ` - ${
                            projects.find((project) => project.id === session.project_id)
                              ?.title ?? "Linked project"
                          }`
                        : ""}
                    </p>
                  </div>
                  <Button
                    className="h-9 w-9 px-0"
                    onClick={() => setExpandedId(expanded ? "" : session.id)}
                    type="button"
                    variant="ghost"
                  >
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </div>
                {expanded && (
                  <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-black/30 p-3 text-sm leading-6 text-[#A1A1AA]">
                    {session.comments || "No comments saved."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function formatDate(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
