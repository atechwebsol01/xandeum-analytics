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

export default function PNodeDetailPage({
  params,
}: {
  params: Promise<{ pubkey: string }>;
}) {
  const { pubkey } = use(params);
  const { data: node, isLoading, refetch, isFetching } = usePNode(pubkey);
  const [copied, setCopied] = useState(false);
  const [nodeHistory, setNodeHistory] = useState<NodeSnapshot[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Fetch node historical data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data } = await supabase
          .from("node_snapshots")
          .select("created_at, status, credits, xscore, uptime, storage_used")
          .eq("pubkey", pubkey)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: true });

        if (data) setNodeHistory(data);
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

      {/* Node Analysis Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status Distribution
            </CardTitle>
            <CardDescription>Node reliability breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (() => {
              const onlineCount = nodeHistory.filter(s => s.status === "online").length || (node.status === "online" ? 1 : 0);
              const warningCount = nodeHistory.filter(s => s.status === "warning").length || (node.status === "warning" ? 1 : 0);
              const offlineCount = nodeHistory.filter(s => s.status === "offline").length || (node.status === "offline" ? 1 : 0);
              const total = onlineCount + warningCount + offlineCount || 1;
              const onlinePct = (onlineCount / total) * 100;
              const warningPct = (warningCount / total) * 100;
              const offlinePct = (offlineCount / total) * 100;
              
              return (
                <div className="flex items-center gap-8">
                  {/* Donut Chart */}
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/20" />
                      {/* Online segment */}
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="#10b981" strokeWidth="12"
                        strokeDasharray={`${onlinePct * 2.51} 251`}
                        strokeLinecap="round"
                      />
                      {/* Warning segment */}
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="#eab308" strokeWidth="12"
                        strokeDasharray={`${warningPct * 2.51} 251`}
                        strokeDashoffset={`${-onlinePct * 2.51}`}
                        strokeLinecap="round"
                      />
                      {/* Offline segment */}
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="#ef4444" strokeWidth="12"
                        strokeDasharray={`${offlinePct * 2.51} 251`}
                        strokeDashoffset={`${-(onlinePct + warningPct) * 2.51}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{onlinePct.toFixed(0)}%</span>
                      <span className="text-xs text-muted-foreground">Uptime</span>
                    </div>
                  </div>
                  
                  {/* Legend with values */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-emerald-500" />
                        <span className="text-sm">Online</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-500">{onlinePct.toFixed(1)}%</span>
                        <span className="text-xs text-muted-foreground ml-2">({onlineCount} checks)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500" />
                        <span className="text-sm">Warning</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-yellow-500">{warningPct.toFixed(1)}%</span>
                        <span className="text-xs text-muted-foreground ml-2">({warningCount} checks)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500" />
                        <span className="text-sm">Offline</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-red-500">{offlinePct.toFixed(1)}%</span>
                        <span className="text-xs text-muted-foreground ml-2">({offlineCount} checks)</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      Based on {total} status checks
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Storage Usage Gauge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Analysis
            </CardTitle>
            <CardDescription>Committed vs used storage breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              {/* Gauge */}
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Background arc */}
                  <path
                    d="M 10 70 A 40 40 0 1 1 90 70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-muted/20"
                    strokeLinecap="round"
                  />
                  {/* Filled arc based on usage */}
                  <path
                    d="M 10 70 A 40 40 0 1 1 90 70"
                    fill="none"
                    stroke={node.storage_usage_percent > 80 ? "#ef4444" : node.storage_usage_percent > 50 ? "#eab308" : "#10b981"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.min(node.storage_usage_percent, 100) * 2.2} 220`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                  <span className="text-3xl font-bold">{node.storage_usage_percent.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">Used</span>
                </div>
              </div>
              
              {/* Storage Details */}
              <div className="space-y-4 flex-1">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Committed</span>
                    <span className="font-bold">{formatBytes(node.storage_committed)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Used</span>
                    <span className="font-bold">{formatBytes(node.storage_used)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        node.storage_usage_percent > 80 ? "bg-red-500" : 
                        node.storage_usage_percent > 50 ? "bg-yellow-500" : "bg-emerald-500"
                      )} 
                      style={{ width: `${Math.min(node.storage_usage_percent, 100)}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-bold">{formatBytes(node.storage_committed - node.storage_used)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${100 - node.storage_usage_percent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            X-Score Breakdown
          </CardTitle>
          <CardDescription>Detailed performance metrics that make up the X-Score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {/* Credits Score */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <div className="text-3xl font-bold text-amber-500">
                {Math.min(35, Math.round(node.credits / 1000 * 35))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">/ 35 max</div>
              <div className="text-sm font-medium mt-2">Credits</div>
              <div className="text-xs text-muted-foreground">{node.credits.toLocaleString()} credits</div>
            </div>
            
            {/* Uptime Score */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="text-3xl font-bold text-blue-500">
                {Math.min(25, Math.round(node.uptime / 86400 * 5))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">/ 25 max</div>
              <div className="text-sm font-medium mt-2">Uptime</div>
              <div className="text-xs text-muted-foreground">{formatUptime(node.uptime)}</div>
            </div>
            
            {/* Status Score */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-500">
                {node.status === "online" ? 25 : node.status === "warning" ? 15 : 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">/ 25 max</div>
              <div className="text-sm font-medium mt-2">Status</div>
              <div className="text-xs text-muted-foreground capitalize">{node.status}</div>
            </div>
            
            {/* Storage Score */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
              <div className="text-3xl font-bold text-violet-500">
                {Math.min(10, Math.round(node.storage_committed / 1e12 * 10))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">/ 10 max</div>
              <div className="text-sm font-medium mt-2">Storage</div>
              <div className="text-xs text-muted-foreground">{formatBytes(node.storage_committed)}</div>
            </div>
            
            {/* Public Bonus */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20">
              <div className="text-3xl font-bold text-pink-500">
                {node.is_public ? 5 : 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">/ 5 max</div>
              <div className="text-sm font-medium mt-2">Public</div>
              <div className="text-xs text-muted-foreground">{node.is_public ? "Yes" : "No"}</div>
            </div>
          </div>
          
          {/* Total Score Bar */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-emerald-500/10 border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Total X-Score</span>
              <span className="text-2xl font-bold">{node.xScore}/100</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${node.xScore}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Poor (0-25)</span>
              <span>Fair (26-50)</span>
              <span>Good (51-75)</span>
              <span>Excellent (76-100)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credits & Reputation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Credits & Reputation Analysis
          </CardTitle>
          <CardDescription>Understanding your node&apos;s earning potential</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-center">
              <div className="text-4xl font-bold text-yellow-500">{formatCredits(node.credits)}</div>
              <div className="text-sm text-muted-foreground mt-1">Current Credits</div>
              <div className="mt-4 p-2 rounded-lg bg-background/50">
                <div className="text-xs text-muted-foreground">Reputation Level</div>
                <div className={cn(
                  "font-bold mt-1",
                  node.credits >= 40000 ? "text-emerald-500" :
                  node.credits >= 20000 ? "text-blue-500" :
                  node.credits >= 10000 ? "text-yellow-500" : "text-orange-500"
                )}>
                  {getCreditsLevel(node.credits)}
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <div className="text-sm font-medium mb-4">How Credits Work</div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                  <span><strong>+1</strong> per successful heartbeat</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                  <span><strong>-100</strong> for missed operations</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                  <span>Reset monthly (keep earning!)</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="text-sm font-medium mb-4">Reputation Tiers</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-500">Diamond</span>
                  <span className="text-xs text-muted-foreground">40,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-500">Platinum</span>
                  <span className="text-xs text-muted-foreground">20,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-500">Gold</span>
                  <span className="text-xs text-muted-foreground">10,000+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-500">Bronze</span>
                  <span className="text-xs text-muted-foreground">&lt; 10,000</span>
                </div>
              </div>
            </div>
          </div>
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
