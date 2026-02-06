"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}

export function LineChart({
  data,
  xKey,
  yKey,
  color = "#3b82f6",
  height = 300,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height} minWidth={0} minHeight={0}>
      <RechartsLineChart data={data}>
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
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
