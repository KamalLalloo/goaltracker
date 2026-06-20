import { Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { levelFromXP, progressToNextLevel } from "@/lib/utils/xp";

export function XPCard({ totalXp }: { totalXp: number }) {
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
      <div className="mt-5">
        <ProgressBar
          value={progressToNextLevel(totalXp)}
          label={`Level ${levelFromXP(totalXp)}`}
        />
      </div>
    </Card>
  );
}
