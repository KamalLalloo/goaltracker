"use client";

import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { levelFromXP, progressToNextLevel } from "@/lib/utils/xp";

const lines = [
  "Momentum compounds.",
  "Stay sharp. Consistency wins.",
  "Build the day before it builds you.",
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HeroCard({ totalXp }: { totalXp: number }) {
  const date = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const line = lines[new Date().getDate() % lines.length];
  const level = levelFromXP(totalXp);
  const progress = progressToNextLevel(totalXp);

  return (
    <Card className="relative overflow-hidden p-7 md:p-8">
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#34D399]/10 blur-3xl" />
      <div className="relative grid gap-8 md:grid-cols-[1fr_280px] md:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1A1A1A] bg-black/30 px-3 py-1.5 text-xs font-medium text-[#A1A1AA]">
            <Sparkles size={14} className="text-[#34D399]" />
            {date}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {greeting()}, Kamal.
          </h1>
          <p className="mt-4 text-lg text-[#A1A1AA]">{line}</p>
        </div>

        <div className="rounded-[20px] border border-[#1A1A1A] bg-black/30 p-5">
          <p className="text-sm text-[#A1A1AA]">Level</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <span className="text-5xl font-semibold text-white">{level}</span>
            <span className="pb-2 text-sm font-medium text-[#34D399]">
              {totalXp} XP
            </span>
          </div>
          <div className="mt-5">
            <ProgressBar value={progress} label="Next level" />
          </div>
        </div>
      </div>
    </Card>
  );
}
