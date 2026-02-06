"use client";

import * as React from "react";
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

export interface PieChartData {
  name: string;
  value: number;
  fill: string;
}

interface PieChartComponentProps {
  data: PieChartData[];
  title: string;
  description?: string;
  totalLabel?: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function PieChartComponent({
  data,
  title,
  description,
  totalLabel = "Total",
}: PieChartComponentProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  return (
    <Card className="flex flex-col border">
      <CardHeader className="items-center pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto h-75 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <div className="text-3xl font-bold">{totalValue.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">{totalLabel}</div>
        </div>
      </CardContent>
    </Card>
  );
}
