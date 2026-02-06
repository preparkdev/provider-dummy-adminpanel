import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: number;
  description?: string;
}

export function KPICard({ title, value, icon: Icon, trend, description }: KPICardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" suppressHydrationWarning>{value}</div>
        {trend !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2" suppressHydrationWarning>
            {trend > 0 ? (
              <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
            ) : trend < 0 ? (
              <ArrowDownIcon className="h-4 w-4 text-red-600" />
            ) : null}
            <span className={trend > 0 ? "text-emerald-500 font-medium" : trend < 0 ? "text-red-500 font-medium" : ""}>
              {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
            </span>
            {description && <span className="ml-1" suppressHydrationWarning>{description}</span>}
          </p>
        )}
        {!trend && description && (
          <p className="text-xs text-muted-foreground mt-2" suppressHydrationWarning>{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
