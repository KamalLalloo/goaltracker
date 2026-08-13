"use client";

import { Lightbulb, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Textarea } from "@/components/ui/Textarea";
import {
  createLifeLesson,
  type LifeLesson,
  readLifeLessons,
  saveLifeLessons,
} from "@/lib/utils/life-lessons";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<LifeLesson[]>(() => readLifeLessons());
  const [text, setText] = useState("");

  const sortedLessons = useMemo(
    () =>
      [...lessons].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [lessons],
  );

  function addLesson(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;

    const nextLessons = [createLifeLesson(text.trim()), ...lessons];
    setLessons(nextLessons);
    saveLifeLessons(nextLessons);
    setText("");
  }

  function deleteLesson(id: string) {
    const nextLessons = lessons.filter((lesson) => lesson.id !== id);
    setLessons(nextLessons);
    saveLifeLessons(nextLessons);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#34D399]">
          Principles
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Life Lessons
        </h1>
      </header>

      <Card title="Add Life Lesson">
        <form className="grid gap-4" onSubmit={addLesson}>
          <Textarea
            className="min-h-28"
            onChange={(event) => setText(event.target.value)}
            placeholder="Write a principle, reminder, or hard-earned lesson."
            value={text}
          />
          <Button className="w-fit" type="submit">
            <Plus size={17} />
            Add Lesson
          </Button>
        </form>
      </Card>

      <Card title="All Lessons">
        {sortedLessons.length === 0 ? (
          <EmptyState>No life lessons added yet.</EmptyState>
        ) : (
          <div className="space-y-3">
            {sortedLessons.map((lesson) => (
              <div
                className="flex items-start gap-3 rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4"
                key={lesson.id}
              >
                <Lightbulb className="mt-1 shrink-0 text-[#34D399]" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-white">
                    {lesson.text}
                  </p>
                  <p className="mt-3 text-xs text-[#A1A1AA]">
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  aria-label="Delete lesson"
                  className="h-9 w-9 px-0"
                  onClick={() => deleteLesson(lesson.id)}
                  type="button"
                  variant="ghost"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
