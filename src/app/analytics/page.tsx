"use client";

import {
  RefreshCw,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePNodes } from "@/hooks/use-pnodes";
import { cn, timeAgo, formatBytes } from "@/lib/utils";

const COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

export default function AnalyticsPage() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = usePNodes();

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
    ? Object.entries(stats.versionDistribution).map(([version, count]) => ({
        version,
        count,
      }))
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

      {/* Charts */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="uptime">Uptime</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* X-Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>X-Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="range"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                        {scoreChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Node Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
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
                          {(
                            (statusBreakdown.online / nodes.length) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                        <div
                          className="bg-emerald-500 transition-all"
                          style={{
                            width: `${(statusBreakdown.online / nodes.length) * 100}%`,
                          }}
                        />
                        <div
                          className="bg-yellow-500 transition-all"
                          style={{
                            width: `${(statusBreakdown.warning / nodes.length) * 100}%`,
                          }}
                        />
                        <div
                          className="bg-red-500 transition-all"
                          style={{
                            width: `${(statusBreakdown.offline / nodes.length) * 100}%`,
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
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={storageChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="usage"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#8b5cf6"
                      fill="url(#colorStorage)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient
                        id="colorStorage"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uptime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uptime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={uptimeChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="bracket"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                      {uptimeChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[(index + 3) % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={versionChartData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="version"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]}>
                      {versionChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
