"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Activity, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PNodeWithScore } from "@/types/pnode";

interface ActivityHeatmapProps {
  nodes: PNodeWithScore[];
  isLoading: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ActivityHeatmap({ nodes, isLoading }: ActivityHeatmapProps) {
  // Generate heatmap data based on node activity patterns
  const heatmapData = useMemo(() => {
    if (nodes.length === 0) return [];

    // Create a 7x24 grid
    const grid: number[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => 0)
    );

    // Simulate activity based on node data
    // In production, this would come from actual historical data
    const now = new Date();
    const currentDay = now.getDay();

    nodes.forEach((node) => {
      // Use node's uptime and last_seen to estimate activity patterns
      const lastSeen = new Date(node.last_seen_timestamp * 1000);
      const lastSeenDay = lastSeen.getDay();
      const lastSeenHour = lastSeen.getHours();

      // Mark recent activity
      if (node.status === "online") {
        // Distribute activity across typical hours based on status
        for (let d = 0; d < 7; d++) {
          for (let h = 0; h < 24; h++) {
            // Higher activity during business hours
            const businessHours = h >= 8 && h <= 20;
            const isRecentDay = Math.abs(d - currentDay) <= 2;
            
            if (businessHours && isRecentDay) {
              grid[d][h] += node.status === "online" ? 1 : 0.3;
            } else {
              grid[d][h] += node.status === "online" ? 0.5 : 0.1;
            }
          }
        }
        
        // Extra weight for last seen time
        grid[lastSeenDay][lastSeenHour] += 2;
      } else if (node.status === "warning") {
        grid[lastSeenDay][lastSeenHour] += 0.5;
      }
    });

    // Normalize values to 0-1 range
    const maxVal = Math.max(...grid.flat());
    return grid.map((row) =>
      row.map((val) => (maxVal > 0 ? val / maxVal : 0))
    );
  }, [nodes]);

  const getHeatColor = (value: number) => {
    if (value >= 0.8) return "bg-emerald-500";
    if (value >= 0.6) return "bg-emerald-400";
    if (value >= 0.4) return "bg-emerald-300/80";
    if (value >= 0.2) return "bg-emerald-200/60";
    if (value > 0) return "bg-emerald-100/40";
    return "bg-muted/30";
  };

  const getActivityLevel = (value: number) => {
    if (value >= 0.8) return "Very High";
    if (value >= 0.6) return "High";
    if (value >= 0.4) return "Medium";
    if (value >= 0.2) return "Low";
    return "Very Low";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Network Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            Network Activity Heatmap
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Shows network activity patterns across days and hours</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Hour labels */}
          <div className="flex mb-1 ml-10">
            {HOURS.filter((h) => h % 3 === 0).map((hour) => (
              <div
                key={hour}
                className="text-[10px] text-muted-foreground"
                style={{ width: `${100 / 8}%`, textAlign: "center" }}
              >
                {hour.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground w-8 shrink-0">
                  {day}
                </span>
                <div className="flex-1 flex gap-0.5">
                  {HOURS.map((hour) => {
                    const value = heatmapData[dayIndex]?.[hour] || 0;
                    return (
                      <Tooltip key={hour}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "flex-1 h-6 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-violet-500/50",
                              getHeatColor(value)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">
                            {day} {hour.toString().padStart(2, "0")}:00
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Activity: {getActivityLevel(value)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t">
            <span className="text-xs text-muted-foreground">Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-sm bg-muted/30" />
              <div className="w-4 h-4 rounded-sm bg-emerald-100/40" />
              <div className="w-4 h-4 rounded-sm bg-emerald-200/60" />
              <div className="w-4 h-4 rounded-sm bg-emerald-300/80" />
              <div className="w-4 h-4 rounded-sm bg-emerald-400" />
              <div className="w-4 h-4 rounded-sm bg-emerald-500" />
            </div>
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
