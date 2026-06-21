import { Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

type Props = {
  completed: number;
  total: number;
  percentage: number;
};

export function ProgressCard({ completed, total, percentage }: Props) {
  return (
    <Card title="Progress">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#34D399]/10 text-[#34D399]">
          <Target size={22} />
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">
            {completed} / {total} Goals
          </p>
          <p className="mt-1 text-sm text-[#A1A1AA]">{percentage}%</p>
        </div>
      </div>
      <div className="mt-5">
        <ProgressBar value={percentage} label="Today" />
      </div>
    </Card>
  );
}
