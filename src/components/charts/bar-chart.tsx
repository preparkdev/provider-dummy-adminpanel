"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}

export function BarChart({
  data,
  xKey,
  yKey,
  color = "#10b981",
  height = 300,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height} minWidth={0} minHeight={0}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={xKey}
          className="text-xs"
          tick={{ fill: "hsl(var(--foreground))" }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: "hsl(var(--foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
