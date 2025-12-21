"use client";

import { Server, HardDrive, Clock, Activity, Coins, Globe } from "lucide-react";
import { StatCard } from "./stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes, formatUptime, formatCredits } from "@/lib/utils";
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
        subtitle={`${stats.onlineNodes} online, ${stats.offlineNodes} offline`}
        icon={Server}
        iconClassName="from-violet-600 to-indigo-600 shadow-violet-500/20"
      />
      <StatCard
        title="Online Rate"
        value={`${stats.totalNodes > 0 ? Math.round((stats.onlineNodes / stats.totalNodes) * 100) : 0}%`}
        subtitle={`${stats.warningNodes} warning`}
        icon={Activity}
        iconClassName="from-emerald-600 to-teal-600 shadow-emerald-500/20"
      />
      <StatCard
        title="Total Storage"
        value={formatBytes(stats.totalStorageCommitted)}
        subtitle={`${formatBytes(stats.totalStorageUsed)} used`}
        icon={HardDrive}
        iconClassName="from-blue-600 to-cyan-600 shadow-blue-500/20"
      />
      <StatCard
        title="Total Credits"
        value={formatCredits(stats.totalCredits)}
        subtitle={`Avg: ${formatCredits(Math.round(stats.averageCredits))}`}
        icon={Coins}
        iconClassName="from-yellow-600 to-amber-600 shadow-yellow-500/20"
      />
      <StatCard
        title="Avg Uptime"
        value={formatUptime(stats.averageUptime)}
        subtitle="Network average"
        icon={Clock}
        iconClassName="from-pink-600 to-rose-600 shadow-pink-500/20"
      />
      <StatCard
        title="Public/Private"
        value={`${stats.publicNodes}/${stats.privateNodes}`}
        subtitle={`${stats.totalNodes > 0 ? Math.round((stats.publicNodes / stats.totalNodes) * 100) : 0}% public`}
        icon={Globe}
        iconClassName="from-cyan-600 to-blue-600 shadow-cyan-500/20"
      />
    </div>
  );
}
