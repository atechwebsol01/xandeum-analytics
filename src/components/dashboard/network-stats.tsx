"use client";

import { Server, HardDrive, Clock, Activity, Zap, Database } from "lucide-react";
import { StatCard } from "./stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes, formatUptime } from "@/lib/utils";
import type { NetworkStats } from "@/types/pnode";

interface NetworkStatsProps {
  stats: NetworkStats | null;
  isLoading: boolean;
}

export function NetworkStatsGrid({ stats, isLoading }: NetworkStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Total pNodes"
        value={stats.totalNodes}
        subtitle={`${stats.onlineNodes} online`}
        icon={Server}
        iconClassName="from-violet-600 to-indigo-600 shadow-violet-500/20"
      />
      <StatCard
        title="Online Rate"
        value={`${Math.round((stats.onlineNodes / stats.totalNodes) * 100)}%`}
        subtitle={`${stats.onlineNodes} of ${stats.totalNodes}`}
        icon={Activity}
        iconClassName="from-emerald-600 to-teal-600 shadow-emerald-500/20"
      />
      <StatCard
        title="Total Storage"
        value={formatBytes(stats.totalStorageCommitted)}
        subtitle="Committed capacity"
        icon={HardDrive}
        iconClassName="from-blue-600 to-cyan-600 shadow-blue-500/20"
      />
      <StatCard
        title="Storage Used"
        value={formatBytes(stats.totalStorageUsed)}
        subtitle={`${((stats.totalStorageUsed / stats.totalStorageCommitted) * 100).toFixed(1)}% utilized`}
        icon={Database}
        iconClassName="from-orange-600 to-amber-600 shadow-orange-500/20"
      />
      <StatCard
        title="Avg Uptime"
        value={formatUptime(stats.averageUptime)}
        subtitle="Network average"
        icon={Clock}
        iconClassName="from-pink-600 to-rose-600 shadow-pink-500/20"
      />
      <StatCard
        title="Avg X-Score"
        value={stats.averageXScore.toFixed(0)}
        subtitle="Performance rating"
        icon={Zap}
        iconClassName="from-yellow-600 to-orange-600 shadow-yellow-500/20"
      />
    </div>
  );
}
