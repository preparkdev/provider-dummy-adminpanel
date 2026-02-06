"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface PieChartData {
  [key: string]: string | number;
}

interface PieChartProps {
  data: PieChartData[];
  valueKey?: string;
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function PieChart({
  data,
  valueKey = "value",
  colors = DEFAULT_COLORS,
  height = 300,
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey={valueKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
