"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendPoint = {
  date: string;
  xp: number;
  completed: number;
  total: number;
  sleep: number | null;
};

const axisStyle = { fill: "#71717A", fontSize: 12 };

export function AnalyticsCharts({ data }: { data: TrendPoint[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <ChartFrame title="XP Trend">
        <ResponsiveContainer height={260} width="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1A1A1A" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} tickLine={false} />
            <YAxis tick={axisStyle} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              dataKey="xp"
              dot={false}
              stroke="#34D399"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Goal Completion">
        <ResponsiveContainer height={260} width="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#1A1A1A" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} tickLine={false} />
            <YAxis tick={axisStyle} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="completed" fill="#34D399" radius={[8, 8, 0, 0]} />
            <Bar dataKey="total" fill="#27272A" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Sleep Score">
        <ResponsiveContainer height={260} width="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1A1A1A" vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} tickLine={false} />
            <YAxis domain={[0, 100]} tick={axisStyle} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              dataKey="sleep"
              dot={false}
              stroke="#A7F3D0"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

function ChartFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-[#1A1A1A] bg-[#0D0D0D] p-5">
      <h2 className="mb-5 text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

const tooltipStyle = {
  background: "#050505",
  border: "1px solid #1A1A1A",
  borderRadius: 14,
  color: "#FFFFFF",
};
