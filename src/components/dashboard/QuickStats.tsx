import { BarChart3, Flame, Trophy, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";

const icons = {
  level: Trophy,
  xp: Zap,
  streak: Flame,
  rate: BarChart3,
};

type Stat = {
  key: keyof typeof icons;
  label: string;
  value: string | number;
};

export function QuickStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = icons[stat.key];

        return (
          <Card className="p-5" key={stat.label}>
            <Icon size={18} className="mb-4 text-[#34D399]" />
            <p className="text-sm text-[#A1A1AA]">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
          </Card>
        );
      })}
    </div>
  );
}
