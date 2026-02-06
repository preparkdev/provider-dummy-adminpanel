"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

export interface BarChartData {
  label: string;
  [key: string]: string | number;
}

interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
  };
}

interface BarChartComponentProps {
  data: BarChartData[];
  config: ChartConfig;
  title: string;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  dataKeys: string[];
}

export function BarChartComponent({
  data,
  config,
  title,
  description,
  trend,
  dataKeys,
}: BarChartComponentProps) {
  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="w-full h-75">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={data}
              margin={{ top: 20, left: 12, right: 12, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => value.slice(0, 10)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px' }}
              />
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={config[key]?.color || `hsl(var(--chart-${index + 1}))`}
                  radius={[8, 8, 0, 0]}
                  name={config[key]?.label || key}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      {trend && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            {trend.value > 0 ? "Trending up" : "Trending down"} by {Math.abs(trend.value)}%{" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">{trend.label}</div>
        </CardFooter>
      )}
    </Card>
  );
}
