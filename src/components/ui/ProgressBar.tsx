type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
};

export function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  return (
    <div>
      {label && (
        <div className="mb-2 flex justify-between text-xs text-[#A1A1AA]">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-[#34D399] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
