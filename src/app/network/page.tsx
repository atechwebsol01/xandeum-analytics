"use client";

import { useMemo } from "react";
import { 
  Network, 
  Server, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  HardDrive,
  Activity,
  TrendingUp,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { usePNodes } from "@/hooks/use-pnodes";
import { cn, formatBytes, timeAgo } from "@/lib/utils";
import { NetworkHealth } from "@/components/dashboard/network-health";
import { NetworkTimeline } from "@/components/dashboard/network-timeline";
import { VersionChart } from "@/components/dashboard/version-chart";

const COLORS = [
  "bg-violet-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-red-500",
];

export default function NetworkPage() {
  const { data, isLoading, refetch, isFetching, dataUpdatedAt } = usePNodes();
  
  const nodes = data?.success ? data.data.nodes : [];
  const stats = data?.success ? data.data.stats : null;

  // Calculate distributions
  const scoreDistribution = useMemo(() => {
    return nodes.reduce((acc, node) => {
      const bracket =
        node.xScore >= 80 ? "80-100" :
        node.xScore >= 60 ? "60-79" :
        node.xScore >= 40 ? "40-59" :
        node.xScore >= 20 ? "20-39" : "0-19";
      acc[bracket] = (acc[bracket] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [nodes]);

  const uptimeDistribution = useMemo(() => {
    return nodes.reduce((acc, node) => {
      const days = Math.floor(node.uptime / 86400);
      const bracket =
        days >= 30 ? "30+ days" :
        days >= 7 ? "7-30 days" :
        days >= 1 ? "1-7 days" : "<1 day";
      acc[bracket] = (acc[bracket] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [nodes]);

  const storageDistribution = useMemo(() => {
    return nodes.reduce((acc, node) => {
      const usage = node.storage_usage_percent;
      const bracket =
        usage >= 80 ? "80-100%" :
        usage >= 60 ? "60-79%" :
        usage >= 40 ? "40-59%" :
        usage >= 20 ? "20-39%" : "0-19%";
      acc[bracket] = (acc[bracket] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [nodes]);

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <Network className="h-6 w-6 text-white" />
            </div>
            Network Statistics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive overview of the Xandeum pNode network
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dataUpdatedAt && (
            <span className="text-sm text-muted-foreground">
              Updated {timeAgo(Math.floor(dataUpdatedAt / 1000))}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
                <Server className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Nodes</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold">{stats?.totalNodes || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 shadow-lg">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-emerald-500">{stats?.onlineNodes || 0}</p>
                    <span className="text-sm text-muted-foreground">
                      ({stats && stats.totalNodes > 0 ? ((stats.onlineNodes / stats.totalNodes) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-600 to-amber-600 shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warning</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold text-yellow-500">{stats?.warningNodes || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 shadow-lg">
                <WifiOff className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold text-red-500">{stats?.offlineNodes || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health & Timeline Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <NetworkHealth stats={stats} isLoading={isLoading} />
        <NetworkTimeline />
      </div>

      {/* Storage Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                <HardDrive className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Storage</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold">{formatBytes(stats?.totalStorageCommitted || 0)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg X-Score</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.averageXScore.toFixed(0) || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Credits</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.averageCredits.toFixed(0) || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Versions</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{Object.keys(stats?.versionDistribution || {}).length}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* X-Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>X-Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px]" />
            ) : (
              <div className="space-y-3">
                {["0-19", "20-39", "40-59", "60-79", "80-100"].map((range, index) => {
                  const count = scoreDistribution[range] || 0;
                  const percent = nodes.length > 0 ? (count / nodes.length) * 100 : 0;
                  return (
                    <div key={range} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{range}</span>
                        <span className="text-muted-foreground">{count} ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", COLORS[index % COLORS.length])}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Version Distribution */}
        <VersionChart data={stats?.versionDistribution} isLoading={isLoading} />

        {/* Uptime Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Uptime Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px]" />
            ) : (
              <div className="space-y-3">
                {["<1 day", "1-7 days", "7-30 days", "30+ days"].map((bracket, index) => {
                  const count = uptimeDistribution[bracket] || 0;
                  const percent = nodes.length > 0 ? (count / nodes.length) * 100 : 0;
                  return (
                    <div key={bracket} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{bracket}</span>
                        <span className="text-muted-foreground">{count} ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", COLORS[(index + 2) % COLORS.length])}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px]" />
            ) : (
              <div className="space-y-3">
                {["0-19%", "20-39%", "40-59%", "60-79%", "80-100%"].map((bracket, index) => {
                  const count = storageDistribution[bracket] || 0;
                  const percent = nodes.length > 0 ? (count / nodes.length) * 100 : 0;
                  return (
                    <div key={bracket} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{bracket}</span>
                        <span className="text-muted-foreground">{count} ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", COLORS[(index + 4) % COLORS.length])}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
