import { Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { levelFromXP, progressToNextLevel } from "@/lib/utils/xp";

export function XPCard({ totalXp }: { totalXp: number }) {
  const level = levelFromXP(totalXp);
  const progress = progressToNextLevel(totalXp);
  const required = 100 - progress;

  return (
    <Card title="XP Status">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#34D399]/10 text-[#34D399]">
          <Zap size={22} />
        </div>
        <div>
          <p className="text-sm text-[#A1A1AA]">Current XP</p>
          <p className="text-2xl font-semibold text-white">{totalXp}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#1A1A1A] bg-black/25 p-3">
          <p className="text-xs text-[#A1A1AA]">Current Level</p>
          <p className="mt-1 text-lg font-semibold text-white">{level}</p>
        </div>
        <div className="rounded-2xl border border-[#1A1A1A] bg-black/25 p-3">
          <p className="text-xs text-[#A1A1AA]">Next Level</p>
          <p className="mt-1 text-lg font-semibold text-white">{required} XP</p>
        </div>
        <div className="rounded-2xl border border-[#1A1A1A] bg-black/25 p-3">
          <p className="text-xs text-[#A1A1AA]">Progress</p>
          <p className="mt-1 text-lg font-semibold text-white">{progress}%</p>
        </div>
      </div>
      <div className="mt-5">
        <ProgressBar value={progress} label={`Level ${level}`} />
      </div>
    </Card>
  );
}
