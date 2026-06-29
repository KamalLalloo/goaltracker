import { Card } from "@/components/ui/Card";

type Props = {
  goalXp: number;
  exerciseXp: number;
  projectXp: number;
};

export function XPBreakdownCard({ goalXp, exerciseXp, projectXp }: Props) {
  const total = goalXp + exerciseXp + projectXp;

  return (
    <Card title="XP Breakdown">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <BreakdownItem label="Goal XP" value={goalXp} />
        <BreakdownItem label="Exercise XP" value={exerciseXp} />
        <BreakdownItem label="Project XP" value={projectXp} />
        <BreakdownItem accent label="Total XP" value={total} />
      </div>
    </Card>
  );
}

function BreakdownItem({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-[#1A1A1A] bg-black/25 p-4">
      <p className="text-xs font-medium text-[#A1A1AA]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent ? "text-[#34D399]" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
