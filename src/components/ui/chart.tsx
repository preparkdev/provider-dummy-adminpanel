"use client";

import * as React from "react";

export type ChartConfig = {
  [key: string]: {
    label: string;
    color?: string;
    icon?: React.ComponentType;
  };
};

const ChartContext = React.createContext<ChartConfig | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig;
  }
>(({ config, children, className, ...props }, ref) => {
  const id = React.useId();

  return (
    <ChartContext.Provider value={config}>
      <div
        ref={ref}
        className={className}
        data-chart={id}
        style={{
          ...(Object.entries(config).reduce((acc, [key, value]) => {
            if (value.color) {
              acc[`--color-${key}`] = value.color;
            }
            return acc;
          }, {} as Record<string, string>)),
        } as React.CSSProperties}
        {...props}
      >
        <div style={{ width: '100%', height: '100%' }}>
          {children}
        </div>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = ({ content: Content, ...props }: React.ComponentProps<"div"> & {
  cursor?: boolean;
  content?: React.ComponentType<Record<string, unknown>> | React.ReactElement;
}) => {
  if (React.isValidElement(Content)) {
    return Content;
  }
  return Content ? <Content {...props} /> : null;
};
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    payload?: Array<{ name: string; value: number | string; color: string }>;
    label?: string;
  }
>(
  (
    {
      hideLabel = false,
      hideIndicator = false,
      payload,
      label,
      ...props
    },
    ref
  ) => {

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className="rounded-lg border bg-background p-2 shadow-sm"
        {...props}
      >
        {!hideLabel && label && (
          <div className="mb-2 font-medium text-sm">{label}</div>
        )}
        <div className="grid gap-2">
          {payload?.map((item, index: number) => (
            <div key={index} className="flex items-center gap-2">
              {!hideIndicator && (
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-xs"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              <div className="flex flex-1 justify-between gap-8">
                <span className="text-muted-foreground text-sm">
                  {item.name}
                </span>
                <span className="font-medium text-sm">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    payload?: Array<{ value: string; color: string }>;
  }
>(({ payload, ...props }, ref) => {
  if (!payload?.length) {
    return null;
  }

  return (
    <div ref={ref} className="flex items-center justify-center gap-4" {...props}>
      {payload.map((item, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-xs"
            style={{
              backgroundColor: item.color,
            }}
          />
          <span className="text-muted-foreground text-sm">{item.value}</span>
        </div>
      ))}
    </div>
  );
});
ChartLegend.displayName = "ChartLegend";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  useChart,
};
