import { Activity, AlarmClock, Dumbbell, Moon, Smile } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { DailyEntry } from "@/lib/types";

const metrics = [
  { key: "sleep_score", label: "Sleep Score", icon: Moon, suffix: "/100" },
  { key: "wake_time", label: "Wake Time", icon: AlarmClock, suffix: "" },
  {
    key: "exercise_minutes",
    label: "Exercise Minutes",
    icon: Dumbbell,
    suffix: " min",
  },
  {
    key: "exercise_intensity",
    label: "Exercise Intensity",
    icon: Activity,
    suffix: "",
  },
  { key: "mood", label: "Day Rating", icon: Smile, suffix: "/10" },
] as const;

export function SummaryCard({ entry }: { entry: DailyEntry | null }) {
  return (
    <Card title="Daily Summary">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const raw = entry?.[metric.key];
          const value = raw === null || raw === undefined || raw === "" ? "--" : raw;

          return (
            <div
              key={metric.key}
              className="rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4"
            >
              <Icon size={18} className="mb-4 text-[#34D399]" />
              <p className="text-xs font-medium text-[#A1A1AA]">{metric.label}</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {value}
                {value !== "--" ? metric.suffix : ""}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
