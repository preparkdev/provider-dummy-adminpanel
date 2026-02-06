"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

export interface AreaChartData {
  date: string;
  [key: string]: string | number;
}

interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
  };
}

interface AreaChartComponentProps {
  data: AreaChartData[];
  config: ChartConfig;
  title: string;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  dataKeys: string[];
}

export function AreaChartComponent({
  data,
  config,
  title,
  description,
  trend,
  dataKeys,
}: AreaChartComponentProps) {
  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="w-full h-75">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart
              data={data}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <defs>
                {dataKeys.map((key, index) => (
                  <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config[key]?.color || `hsl(var(--chart-${index + 1}))`} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={config[key]?.color || `hsl(var(--chart-${index + 1}))`} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => value.slice(0, 3)}
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
                formatter={(value: number | string | undefined) => {
                  if (value === undefined) return ['0', ''];
                  const num = Number(value);
                  if (isNaN(num)) return ['0', ''];
                  return [num.toLocaleString(), ''];
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px' }}
              />
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={config[key]?.color || `hsl(var(--chart-${index + 1}))`}
                  strokeWidth={2}
                  fill={`url(#color${key})`}
                  name={config[key]?.label || key}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      {trend && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                {trend.value > 0 ? "Trending up" : "Trending down"} by {Math.abs(trend.value)}%{" "}
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                {trend.label}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
