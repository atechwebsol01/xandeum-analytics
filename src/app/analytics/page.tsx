"use client";

import { useState } from "react";
import {
  RefreshCw,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  GitCompare,
  Search,
  X,
  FileJson,
  FileSpreadsheet,
  Coins,
  Calculator,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePNodes } from "@/hooks/use-pnodes";
import { TokenAnalytics } from "@/components/dashboard/token-analytics";
import { StakingCalculator } from "@/components/dashboard/staking-calculator";
import { AIChat } from "@/components/dashboard/ai-chat";
import { cn, timeAgo, formatBytes } from "@/lib/utils";

const COLORS = [
  "bg-violet-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-red-500",
];

// Simple bar chart component using CSS
function SimpleBarChart({ 
  data, 
  dataKey, 
  valueKey,
  isLoading 
}: { 
  data: Array<Record<string, string | number>>;
  dataKey: string;
  valueKey: string;
  isLoading: boolean;
}) {
  if (isLoading || data.length === 0) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  const maxValue = Math.max(...data.map(d => Number(d[valueKey]) || 0));
  const total = data.reduce((sum, d) => sum + (Number(d[valueKey]) || 0), 0);

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        const percent = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const totalPercent = total > 0 ? (value / total) * 100 : 0;
        return (
          <div key={String(item[dataKey])} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{String(item[dataKey])}</span>
              <span className="text-muted-foreground">
                {value} ({totalPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="h-8 w-full rounded bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded transition-all duration-500",
                  COLORS[index % COLORS.length]
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = usePNodes();
  const [compareNodes, setCompareNodes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const nodes = data?.success ? data.data.nodes : [];
  const stats = data?.success ? data.data.stats : null;
  const apiError = data?.success === false ? data?.error : null;

  // Prepare chart data
  const scoreDistribution = nodes.reduce((acc, node) => {
    const bracket =
      node.xScore >= 80
        ? "80-100"
        : node.xScore >= 60
        ? "60-79"
        : node.xScore >= 40
        ? "40-59"
        : node.xScore >= 20
        ? "20-39"
        : "0-19";
    acc[bracket] = (acc[bracket] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const scoreChartData = Object.entries(scoreDistribution)
    .sort((a, b) => {
      const order = ["0-19", "20-39", "40-59", "60-79", "80-100"];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    })
    .map(([range, count]) => ({ range, count }));

  const uptimeDistribution = nodes.reduce((acc, node) => {
    const days = Math.floor(node.uptime / 86400);
    const bracket =
      days >= 30
        ? "30+ days"
        : days >= 7
        ? "7-30 days"
        : days >= 1
        ? "1-7 days"
        : "<1 day";
    acc[bracket] = (acc[bracket] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uptimeChartData = Object.entries(uptimeDistribution)
    .sort((a, b) => {
      const order = ["<1 day", "1-7 days", "7-30 days", "30+ days"];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    })
    .map(([bracket, count]) => ({ bracket, count }));

  const storageDistribution = nodes.reduce((acc, node) => {
    const usage = node.storage_usage_percent;
    const bracket =
      usage >= 80
        ? "80-100%"
        : usage >= 60
        ? "60-79%"
        : usage >= 40
        ? "40-59%"
        : usage >= 20
        ? "20-39%"
        : "0-19%";
    acc[bracket] = (acc[bracket] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const storageChartData = Object.entries(storageDistribution)
    .sort((a, b) => {
      const order = ["0-19%", "20-39%", "40-59%", "60-79%", "80-100%"];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    })
    .map(([usage, count]) => ({ usage, count }));

  const versionChartData = stats?.versionDistribution
    ? Object.entries(stats.versionDistribution)
        .map(([version, count]) => ({ version, count }))
        .sort((a, b) => b.count - a.count)
    : [];

  // Status breakdown
  const statusBreakdown = {
    online: nodes.filter((n) => n.status === "online").length,
    warning: nodes.filter((n) => n.status === "warning").length,
    offline: nodes.filter((n) => n.status === "offline").length,
  };

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-violet-500" />
            Network Analytics
          </h1>
          <p className="text-muted-foreground">
            Deep insights into Xandeum pNode network performance
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
              <p className="font-medium text-destructive">Failed to load pNode data</p>
              <p className="text-sm text-muted-foreground">
                {apiError || "Unable to connect to Xandeum pRPC endpoints. Please try again."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online Rate</p>
                <p className="text-2xl font-bold">
                  {nodes.length > 0
                    ? ((statusBreakdown.online / nodes.length) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg X-Score</p>
                <p className="text-2xl font-bold">
                  {stats?.averageXScore.toFixed(0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Versions</p>
                <p className="text-2xl font-bold">{versionChartData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Storage</p>
                <p className="text-2xl font-bold">
                  {formatBytes(stats?.totalStorageCommitted || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Analytics Section */}
      <div id="token" className="scroll-mt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-600">
            <Coins className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Token Analytics</h2>
        </div>
        <TokenAnalytics />
      </div>

      {/* Staking Calculator Section */}
      <div id="staking" className="scroll-mt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Staking Calculator</h2>
        </div>
        <StakingCalculator />
      </div>

      {/* AI Chat Section */}
      <div id="chat" className="scroll-mt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold">AI Assistant</h2>
        </div>
        <AIChat />
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="uptime">Uptime</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="compare" className="gap-1">
            <GitCompare className="h-3 w-3" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-1">
            <Download className="h-3 w-3" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* X-Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>X-Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={scoreChartData}
                  dataKey="range"
                  valueKey="count"
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Node Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || nodes.length === 0 ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-emerald-500/10">
                        <p className="text-3xl font-bold text-emerald-500">
                          {statusBreakdown.online}
                        </p>
                        <p className="text-sm text-muted-foreground">Online</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-yellow-500/10">
                        <p className="text-3xl font-bold text-yellow-500">
                          {statusBreakdown.warning}
                        </p>
                        <p className="text-sm text-muted-foreground">Warning</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-red-500/10">
                        <p className="text-3xl font-bold text-red-500">
                          {statusBreakdown.offline}
                        </p>
                        <p className="text-sm text-muted-foreground">Offline</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Online</span>
                        <span>
                          {nodes.length > 0
                            ? ((statusBreakdown.online / nodes.length) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                        <div
                          className="bg-emerald-500 transition-all"
                          style={{
                            width: nodes.length > 0 ? `${(statusBreakdown.online / nodes.length) * 100}%` : '0%',
                          }}
                        />
                        <div
                          className="bg-yellow-500 transition-all"
                          style={{
                            width: nodes.length > 0 ? `${(statusBreakdown.warning / nodes.length) * 100}%` : '0%',
                          }}
                        />
                        <div
                          className="bg-red-500 transition-all"
                          style={{
                            width: nodes.length > 0 ? `${(statusBreakdown.offline / nodes.length) * 100}%` : '0%',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Utilization Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={storageChartData}
                dataKey="usage"
                valueKey="count"
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uptime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uptime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={uptimeChartData}
                dataKey="bracket"
                valueKey="count"
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={versionChartData}
                dataKey="version"
                valueKey="count"
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Node Comparison Tab */}
        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Node Comparison Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Add Nodes */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by pubkey..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Search Results */}
              {searchQuery.length >= 3 && (
                <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                  {nodes
                    .filter((n) => 
                      n.pubkey.toLowerCase().includes(searchQuery.toLowerCase()) &&
                      !compareNodes.includes(n.pubkey)
                    )
                    .slice(0, 5)
                    .map((node) => (
                      <div
                        key={node.pubkey}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          if (compareNodes.length < 4) {
                            setCompareNodes([...compareNodes, node.pubkey]);
                            setSearchQuery("");
                          }
                        }}
                      >
                        <span className="font-mono text-sm truncate">
                          {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-6)}
                        </span>
                        <Badge variant={node.status === "online" ? "success" : node.status === "warning" ? "warning" : "error"}>
                          {node.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}

              {/* Selected Nodes for Comparison */}
              {compareNodes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Selected nodes ({compareNodes.length}/4):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {compareNodes.map((pubkey) => (
                      <Badge
                        key={pubkey}
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-destructive/20"
                        onClick={() => setCompareNodes(compareNodes.filter((p) => p !== pubkey))}
                      >
                        {pubkey.slice(0, 6)}...{pubkey.slice(-4)}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison Table */}
              {compareNodes.length >= 2 && (
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left font-medium">Metric</th>
                        {compareNodes.map((pubkey) => (
                          <th key={pubkey} className="p-3 text-center font-medium">
                            {pubkey.slice(0, 6)}...
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        { label: "Status", key: "status" },
                        { label: "X-Score", key: "xScore" },
                        { label: "Credits", key: "credits" },
                        { label: "Uptime", key: "uptime", format: (v: number) => `${Math.floor(v / 86400)}d` },
                        { label: "Storage Used", key: "storage_used", format: (v: number) => formatBytes(v) },
                        { label: "Storage Committed", key: "storage_committed", format: (v: number) => formatBytes(v) },
                        { label: "Version", key: "version" },
                        { label: "Public", key: "is_public", format: (v: boolean) => v ? "Yes" : "No" },
                      ].map((metric) => (
                        <tr key={metric.key} className="hover:bg-muted/30">
                          <td className="p-3 font-medium">{metric.label}</td>
                          {compareNodes.map((pubkey) => {
                            const node = nodes.find((n) => n.pubkey === pubkey);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const value = node ? (node as any)[metric.key] : "-";
                            const displayValue = metric.format ? metric.format(value as never) : String(value);
                            return (
                              <td key={pubkey} className="p-3 text-center">
                                {metric.key === "status" ? (
                                  <Badge variant={value === "online" ? "success" : value === "warning" ? "warning" : "error"}>
                                    {String(value)}
                                  </Badge>
                                ) : (
                                  displayValue
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {compareNodes.length < 2 && (
                <div className="text-center py-8 text-muted-foreground">
                  <GitCompare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select at least 2 nodes to compare</p>
                  <p className="text-sm">Search by pubkey above (max 4 nodes)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Export as CSV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download all pNode data in CSV format for spreadsheet analysis.
                </p>
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    const headers = ["Pubkey", "Status", "X-Score", "Credits", "Uptime (days)", "Storage Used", "Storage Committed", "Version", "Public", "IP"];
                    const csvContent = [
                      headers.join(","),
                      ...nodes.map((n) =>
                        [
                          n.pubkey,
                          n.status,
                          n.xScore,
                          n.credits,
                          Math.floor(n.uptime / 86400),
                          n.storage_used,
                          n.storage_committed,
                          n.version,
                          n.is_public ? "Yes" : "No",
                          n.ip,
                        ].join(",")
                      ),
                    ].join("\n");
                    const blob = new Blob([csvContent], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `xandeum-nodes-${new Date().toISOString().split("T")[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={nodes.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Download CSV ({nodes.length} nodes)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Export as JSON
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download raw pNode data in JSON format for programmatic use.
                </p>
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={() => {
                    const exportData = {
                      exportedAt: new Date().toISOString(),
                      networkStats: stats,
                      totalNodes: nodes.length,
                      nodes: nodes.map((n) => ({
                        pubkey: n.pubkey,
                        status: n.status,
                        xScore: n.xScore,
                        credits: n.credits,
                        uptimeSeconds: n.uptime,
                        uptimeDays: Math.floor(n.uptime / 86400),
                        storageUsed: n.storage_used,
                        storageCommitted: n.storage_committed,
                        storageUsagePercent: n.storage_usage_percent,
                        version: n.version,
                        isPublic: n.is_public,
                        ip: n.ip,
                        lastSeen: n.last_seen_timestamp,
                      })),
                    };
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `xandeum-nodes-${new Date().toISOString().split("T")[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={nodes.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Download JSON ({nodes.length} nodes)
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Network Summary Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate a comprehensive network report with all statistics and distribution data.
                </p>
                <Button
                  className="gap-2"
                  variant="secondary"
                  onClick={() => {
                    const report = `
XANDEUM NETWORK REPORT
Generated: ${new Date().toLocaleString()}
================================================

NETWORK OVERVIEW
----------------
Total Nodes: ${nodes.length}
Online: ${statusBreakdown.online} (${nodes.length > 0 ? ((statusBreakdown.online / nodes.length) * 100).toFixed(1) : 0}%)
Warning: ${statusBreakdown.warning} (${nodes.length > 0 ? ((statusBreakdown.warning / nodes.length) * 100).toFixed(1) : 0}%)
Offline: ${statusBreakdown.offline} (${nodes.length > 0 ? ((statusBreakdown.offline / nodes.length) * 100).toFixed(1) : 0}%)

PERFORMANCE METRICS
-------------------
Average X-Score: ${stats?.averageXScore.toFixed(1) || 0}
Average Credits: ${stats?.averageCredits.toFixed(0) || 0}
Total Storage Committed: ${formatBytes(stats?.totalStorageCommitted || 0)}
Total Storage Used: ${formatBytes(stats?.totalStorageUsed || 0)}

X-SCORE DISTRIBUTION
--------------------
${scoreChartData.map((d) => `${d.range}: ${d.count} nodes`).join("\n")}

UPTIME DISTRIBUTION
-------------------
${uptimeChartData.map((d) => `${d.bracket}: ${d.count} nodes`).join("\n")}

VERSION DISTRIBUTION
--------------------
${versionChartData.slice(0, 10).map((d) => `${d.version}: ${d.count} nodes`).join("\n")}

================================================
Report generated by Xandeum Analytics
https://xandeum-analytics-theta.vercel.app
                    `.trim();
                    const blob = new Blob([report], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `xandeum-report-${new Date().toISOString().split("T")[0]}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={nodes.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Download Summary Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
