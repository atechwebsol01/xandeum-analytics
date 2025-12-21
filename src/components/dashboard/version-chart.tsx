"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface VersionChartProps {
  data: Record<string, number> | null | undefined;
  isLoading: boolean;
}

const COLORS = [
  "bg-violet-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-red-500",
];

export function VersionChart({ data, isLoading }: VersionChartProps) {
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!data || typeof data !== "object") return [];
    
    try {
      const entries = Object.entries(data)
        .filter(([, count]) => typeof count === "number" && count > 0)
        .map(([version, count]) => ({
          name: String(version || "Unknown"),
          value: Number(count) || 0,
        }))
        .sort((a, b) => b.value - a.value);
      
      const total = entries.reduce((sum, e) => sum + e.value, 0);
      return entries.map(e => ({
        ...e,
        percent: total > 0 ? (e.value / total) * 100 : 0,
      }));
    } catch {
      return [];
    }
  }, [data]);

  const total = useMemo(() => 
    chartData.reduce((sum, e) => sum + e.value, 0),
  [chartData]);

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no valid data
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No version data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Version Distribution
          <span className="text-sm font-normal text-muted-foreground">
            ({chartData.length} versions)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bars for each version */}
        <div className="space-y-3">
          {chartData.map((entry, index) => (
            <div key={entry.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{entry.name}</span>
                <span className="text-muted-foreground">
                  {entry.value} ({entry.percent.toFixed(1)}%)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    COLORS[index % COLORS.length]
                  )}
                  style={{ width: `${entry.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Nodes</span>
          <span className="font-semibold">{total}</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-2">
          {chartData.slice(0, 5).map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", COLORS[index % COLORS.length])} />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
