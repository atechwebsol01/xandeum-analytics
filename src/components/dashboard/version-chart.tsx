"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface VersionChartProps {
  data: Record<string, number> | null | undefined;
  isLoading: boolean;
}

const COLORS = [
  "#8b5cf6", // violet-500
  "#6366f1", // indigo-500
  "#3b82f6", // blue-500
  "#06b6d4", // cyan-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
];

// Safe label renderer that handles null/undefined values
const renderLabel = (entry: { name?: string; percent?: number }) => {
  if (!entry) return "";
  const name = entry.name ?? "Unknown";
  const percent = typeof entry.percent === "number" ? entry.percent : 0;
  return `${name} (${(percent * 100).toFixed(0)}%)`;
};

export function VersionChart({ data, isLoading }: VersionChartProps) {
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!data || typeof data !== "object") return [];
    
    try {
      return Object.entries(data)
        .filter(([, count]) => typeof count === "number" && count > 0)
        .map(([version, count]) => ({
          name: String(version || "Unknown"),
          value: Number(count) || 0,
        }));
    } catch {
      return [];
    }
  }, [data]);

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
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={renderLabel}
              labelLine={false}
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="stroke-background stroke-2"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{String(value ?? "")}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
