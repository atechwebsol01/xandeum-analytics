"use client";

import { useMemo } from "react";
import { RefreshCw, Download, AlertCircle, Server, Activity, TrendingUp, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PNodeTable } from "@/components/dashboard/pnode-table";
import { NodeComparison } from "@/components/dashboard/node-comparison";
import { usePNodes } from "@/hooks/use-pnodes";
import { cn, timeAgo, formatBytes } from "@/lib/utils";

export default function PNodesPage() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } =
    usePNodes();

  const nodes = data?.success ? data.data.nodes : [];
  const stats = data?.success ? data.data.stats : null;
  const apiError = data?.success === false ? data?.error : null;

  // Calculate distributions for visual summary
  const distributions = useMemo(() => {
    if (nodes.length === 0) return null;

    // X-Score distribution
    const scoreRanges = [
      { label: "0-19", min: 0, max: 19, color: "bg-red-500" },
      { label: "20-39", min: 20, max: 39, color: "bg-orange-500" },
      { label: "40-59", min: 40, max: 59, color: "bg-yellow-500" },
      { label: "60-79", min: 60, max: 79, color: "bg-blue-500" },
      { label: "80-100", min: 80, max: 100, color: "bg-emerald-500" },
    ];

    const xScoreDistribution = scoreRanges.map(range => ({
      ...range,
      count: nodes.filter(n => n.xScore >= range.min && n.xScore <= range.max).length,
    }));

    // Status breakdown
    const statusBreakdown = {
      online: nodes.filter(n => n.status === "online").length,
      warning: nodes.filter(n => n.status === "warning").length,
      offline: nodes.filter(n => n.status === "offline").length,
    };

    const onlinePercent = (statusBreakdown.online / nodes.length) * 100;

    return { xScoreDistribution, statusBreakdown, onlinePercent };
  }, [nodes]);

  const handleExport = () => {
    const csv = [
      [
        "Pubkey",
        "Address",
        "Version",
        "Status",
        "X-Score",
        "Storage Committed",
        "Storage Used",
        "Usage %",
        "Uptime (s)",
        "Last Seen",
        "Is Public",
      ].join(","),
      ...nodes.map((node) =>
        [
          node.pubkey,
          node.address,
          node.version,
          node.status,
          node.xScore,
          node.storage_committed,
          node.storage_used,
          node.storage_usage_percent.toFixed(2),
          node.uptime,
          node.last_seen_timestamp,
          node.is_public,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xandeum-pnodes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">pNodes Explorer</h1>
          <p className="text-muted-foreground">
            Browse and analyze all pNodes in the Xandeum network
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dataUpdatedAt && !isError && !apiError && (
            <span className="text-sm text-muted-foreground">
              Updated {timeAgo(Math.floor(dataUpdatedAt / 1000))}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isLoading || nodes.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {(isError || apiError) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">
                Failed to load pNode data
              </p>
              <p className="text-sm text-muted-foreground">
                {apiError || "Unable to connect to Xandeum pRPC endpoints. Please try again."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {!isLoading && distributions && (
        <>
          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Nodes</p>
                    <p className="text-3xl font-bold">{nodes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 shadow-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Online Rate</p>
                    <p className="text-3xl font-bold">{distributions.onlinePercent.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg X-Score</p>
                    <p className="text-3xl font-bold">{stats?.averageXScore.toFixed(0) || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 shadow-lg">
                    <HardDrive className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Storage</p>
                    <p className="text-3xl font-bold">{formatBytes(stats?.totalStorageCommitted || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visual Analytics */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* X-Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-500" />
                  X-Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {distributions.xScoreDistribution.map((range) => {
                  const percent = nodes.length > 0 ? (range.count / nodes.length) * 100 : 0;
                  const maxCount = Math.max(...distributions.xScoreDistribution.map(r => r.count));
                  const barWidth = maxCount > 0 ? (range.count / maxCount) * 100 : 0;
                  return (
                    <div key={range.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{range.label}</span>
                        <span className="text-muted-foreground">
                          {range.count} ({percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-8 w-full rounded bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded transition-all duration-500", range.color)}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Node Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  Node Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-4xl font-bold text-emerald-500">
                      {distributions.statusBreakdown.online}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Online</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-4xl font-bold text-yellow-500">
                      {distributions.statusBreakdown.warning}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Warning</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-4xl font-bold text-red-500">
                      {distributions.statusBreakdown.offline}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Offline</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Online</span>
                    <span className="font-bold">{distributions.onlinePercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-4 rounded-full bg-muted overflow-hidden flex">
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{ width: `${(distributions.statusBreakdown.online / nodes.length) * 100}%` }}
                    />
                    <div
                      className="bg-yellow-500 transition-all"
                      style={{ width: `${(distributions.statusBreakdown.warning / nodes.length) * 100}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{ width: `${(distributions.statusBreakdown.offline / nodes.length) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Node Comparison Tool */}
      {!isLoading && nodes.length > 0 && (
        <NodeComparison nodes={nodes} />
      )}

      {/* pNode Table */}
      <PNodeTable nodes={nodes} isLoading={isLoading} />
    </div>
  );
}
