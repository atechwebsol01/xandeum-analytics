"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Server,
  HardDrive,
  Clock,
  Globe,
  RefreshCw,
  Coins,
  Activity,
  TrendingUp,
  Zap,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { usePNode } from "@/hooks/use-pnodes";
import { supabase } from "@/lib/supabase";
import {
  cn,
  formatBytes,
  formatUptime,
  formatTimestamp,
  timeAgo,
  formatCredits,
  getCreditsLevel,
} from "@/lib/utils";

interface NodeSnapshot {
  created_at: string;
  status: string;
  credits: number;
  xscore: number;
  uptime: number;
  storage_used: number;
}

interface HeatmapData {
  hour: number;
  day_of_week: number;
  activity_count: number;
}

export default function PNodeDetailPage({
  params,
}: {
  params: Promise<{ pubkey: string }>;
}) {
  const { pubkey } = use(params);
  const { data: node, isLoading, refetch, isFetching } = usePNode(pubkey);
  const [copied, setCopied] = useState(false);
  const [nodeHistory, setNodeHistory] = useState<NodeSnapshot[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Fetch node historical data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [snapshotsRes, heatmapRes] = await Promise.all([
          supabase
            .from("node_snapshots")
            .select("created_at, status, credits, xscore, uptime, storage_used")
            .eq("pubkey", pubkey)
            .gte("created_at", sevenDaysAgo.toISOString())
            .order("created_at", { ascending: true }),
          supabase
            .from("activity_heatmap")
            .select("hour, day_of_week, activity_count")
            .eq("pubkey", pubkey),
        ]);

        if (snapshotsRes.data) setNodeHistory(snapshotsRes.data);
        if (heatmapRes.data) setHeatmapData(heatmapRes.data);
      } catch {
        // Silent fail
      } finally {
        setHistoryLoading(false);
      }
    };

    if (pubkey) fetchHistory();
  }, [pubkey]);

  // Calculate performance metrics from history
  const metrics = useMemo(() => {
    if (nodeHistory.length < 2) return null;
    
    const onlineCount = nodeHistory.filter(s => s.status === "online").length;
    const uptimePercent = (onlineCount / nodeHistory.length) * 100;
    
    const latestCredits = nodeHistory[nodeHistory.length - 1]?.credits || 0;
    const firstCredits = nodeHistory[0]?.credits || 0;
    const creditsGrowth = latestCredits - firstCredits;
    
    const avgXScore = nodeHistory.reduce((sum, s) => sum + s.xscore, 0) / nodeHistory.length;
    
    return { uptimePercent, creditsGrowth, avgXScore };
  }, [nodeHistory]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="container py-8 px-4 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[200px] lg:col-span-2" />
          <Skeleton className="h-[200px]" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="container py-8 px-4">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <Server className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">pNode Not Found</h2>
              <p className="text-muted-foreground">
                The pNode with this pubkey could not be found in the network.
              </p>
            </div>
            <Link href="/pnodes">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to pNodes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/pnodes">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">pNode Details</h1>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Main Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Identity
                </CardTitle>
                <CardDescription>
                  pNode identification and network details
                </CardDescription>
              </div>
              <StatusBadge status={node.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Public Key
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono break-all">
                  {node.pubkey}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(node.pubkey)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <div className="flex items-center gap-2">
                  <code className="p-3 bg-muted rounded-lg text-sm font-mono flex-1">
                    {node.address}
                  </code>
                  {node.is_public && (
                    <a
                      href={`http://${node.address.split(":")[0]}:${node.rpc_port}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  RPC Port
                </label>
                <div className="p-3 bg-muted rounded-lg text-sm font-mono">
                  {node.rpc_port}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-sm">
                Version {node.version}
              </Badge>
              {node.is_public && (
                <Badge variant="info" className="text-sm">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credits & Performance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              Pod Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-2xl font-bold text-2xl",
                  node.credits >= 40000
                    ? "bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/20"
                    : node.credits >= 20000
                    ? "bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20"
                    : node.credits >= 10000
                    ? "bg-yellow-500/10 text-yellow-500 ring-2 ring-yellow-500/20"
                    : "bg-orange-500/10 text-orange-500 ring-2 ring-orange-500/20"
                )}
              >
                {formatCredits(node.credits)}
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">Official Credits</p>
                <p className="text-sm text-muted-foreground">
                  {getCreditsLevel(node.credits)} Reputation
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">X-Score</span>
                <span className="font-semibold">{node.xScore}/100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Seen</span>
                <span>{timeAgo(node.last_seen_timestamp)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={node.status} size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Uptime */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/20">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{formatUptime(node.uptime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Committed */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
                <HardDrive className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Committed</p>
                <p className="text-2xl font-bold">
                  {formatBytes(node.storage_committed)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Used */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/20">
                <HardDrive className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Used</p>
                <p className="text-2xl font-bold">
                  {formatBytes(node.storage_used)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Percentage */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Storage Usage</p>
              <p className="text-lg font-bold">
                {node.storage_usage_percent.toFixed(1)}%
              </p>
            </div>
            <Progress
              value={Math.min(100, node.storage_usage_percent)}
              indicatorClassName={cn(
                node.storage_usage_percent > 80
                  ? "bg-red-500"
                  : node.storage_usage_percent > 50
                  ? "bg-yellow-500"
                  : "bg-emerald-500"
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics Section */}
      {metrics && (
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/20">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">7d Uptime</p>
                  <p className="text-2xl font-bold">{metrics.uptimePercent.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 shadow-lg shadow-amber-500/20">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits Growth</p>
                  <p className={cn("text-2xl font-bold", metrics.creditsGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {metrics.creditsGrowth >= 0 ? "+" : ""}{metrics.creditsGrowth.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 shadow-lg shadow-purple-500/20">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg X-Score</p>
                  <p className="text-2xl font-bold">{metrics.avgXScore.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status History Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status History (7 Days)
          </CardTitle>
          <CardDescription>Node status and performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : nodeHistory.length > 0 ? (
            <div className="space-y-4">
              {/* Status Timeline */}
              <div className="flex gap-1 h-8">
                {nodeHistory.slice(-48).map((snapshot, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-sm transition-all hover:scale-y-125",
                      snapshot.status === "online" ? "bg-emerald-500" :
                      snapshot.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                    )}
                    title={`${new Date(snapshot.created_at).toLocaleString()} - ${snapshot.status}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>7 days ago</span>
                <span>Now</span>
              </div>
              
              {/* Credits Trend */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Credits Trend</p>
                <div className="flex items-end gap-1 h-20">
                  {nodeHistory.slice(-24).map((snapshot, i) => {
                    const maxCredits = Math.max(...nodeHistory.slice(-24).map(s => s.credits), 1);
                    const height = (snapshot.credits / maxCredits) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t transition-all hover:from-violet-500 hover:to-violet-300"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${snapshot.credits.toLocaleString()} credits`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
              <Calendar className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No historical data yet</p>
              <p className="text-xs">Data will appear as snapshots are collected</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activity Heatmap
          </CardTitle>
          <CardDescription>Node activity patterns by hour and day</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : heatmapData.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-[auto_repeat(24,1fr)] gap-1 text-xs">
                <div className="w-8" />
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="text-center text-muted-foreground">
                    {i % 6 === 0 ? `${i}h` : ""}
                  </div>
                ))}
              </div>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, dayIndex) => (
                <div key={day} className="grid grid-cols-[auto_repeat(24,1fr)] gap-1">
                  <div className="w-8 text-xs text-muted-foreground flex items-center">{day}</div>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const activity = heatmapData.find(h => h.day_of_week === dayIndex && h.hour === hour);
                    const intensity = activity ? Math.min(activity.activity_count / 10, 1) : 0;
                    return (
                      <div
                        key={hour}
                        className={cn(
                          "aspect-square rounded-sm transition-all",
                          intensity === 0 ? "bg-muted" :
                          intensity < 0.3 ? "bg-emerald-900/50" :
                          intensity < 0.6 ? "bg-emerald-600/70" : "bg-emerald-500"
                        )}
                        title={`${day} ${hour}:00 - ${activity?.activity_count || 0} activities`}
                      />
                    );
                  })}
                </div>
              ))}
              <div className="flex items-center justify-end gap-2 pt-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-muted" />
                  <div className="w-3 h-3 rounded-sm bg-emerald-900/50" />
                  <div className="w-3 h-3 rounded-sm bg-emerald-600/70" />
                  <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                </div>
                <span>More</span>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
              <Calendar className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No activity data yet</p>
              <p className="text-xs">Heatmap will populate over time</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Last Seen</dt>
              <dd className="font-medium">
                {formatTimestamp(node.last_seen_timestamp)}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Uptime (seconds)</dt>
              <dd className="font-medium font-mono">
                {node.uptime.toLocaleString()}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Raw Storage</dt>
              <dd className="font-medium font-mono">
                {node.storage_used.toLocaleString()} / {node.storage_committed.toLocaleString()} bytes
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
