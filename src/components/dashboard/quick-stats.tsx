"use client";

import { 
  Server, 
  HardDrive, 
  Activity, 
  TrendingUp,
  Gauge,
  Wifi,
  WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NetworkStats, PNodeWithScore } from "@/types/pnode";

interface QuickStatsProps {
  stats: NetworkStats | null;
  nodes: PNodeWithScore[];
  isLoading: boolean;
}

export function QuickStats({ stats, nodes, isLoading }: QuickStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-12 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const onlineRate = Math.round((stats.onlineNodes / stats.totalNodes) * 100);
  const storageUsedPercent = Math.round(
    (stats.totalStorageUsed / stats.totalStorageCommitted) * 100
  );
  const offlineCount = stats.totalNodes - stats.onlineNodes;
  const highPerformers = nodes.filter(n => n.xScore >= 80).length;

  const quickStats = [
    {
      icon: Server,
      label: "Nodes",
      value: stats.totalNodes,
      color: "text-violet-500",
      priority: 1, // Always show
    },
    {
      icon: stats.onlineNodes === stats.totalNodes ? Wifi : WifiOff,
      label: "Online",
      value: `${stats.onlineNodes}/${stats.totalNodes}`,
      color: offlineCount > 0 ? "text-yellow-500" : "text-emerald-500",
      priority: 1,
    },
    {
      icon: Activity,
      label: "Uptime",
      value: `${onlineRate}%`,
      color: onlineRate >= 90 ? "text-emerald-500" : onlineRate >= 70 ? "text-yellow-500" : "text-red-500",
      priority: 2, // Show on tablet+
    },
    {
      icon: Gauge,
      label: "Avg Score",
      value: stats.averageXScore.toFixed(0),
      color: stats.averageXScore >= 70 ? "text-emerald-500" : "text-yellow-500",
      priority: 2,
    },
    {
      icon: TrendingUp,
      label: "Top",
      value: highPerformers,
      color: "text-blue-500",
      priority: 3, // Show on desktop only
    },
    {
      icon: HardDrive,
      label: "Storage",
      value: `${storageUsedPercent}%`,
      color: storageUsedPercent > 80 ? "text-red-500" : "text-cyan-500",
      priority: 3,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-5">
      {quickStats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 group cursor-default",
            stat.priority === 3 && "hidden lg:flex",
            stat.priority === 2 && "hidden sm:flex"
          )}
        >
          <stat.icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110", stat.color)} />
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-xs sm:text-sm">{stat.value}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
