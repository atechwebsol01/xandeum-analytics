"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Server,
  HardDrive,
  Clock,
  Activity,
  Globe,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
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
import { XScoreBadge } from "@/components/dashboard/x-score-badge";
import { usePNode } from "@/hooks/use-pnodes";
import {
  cn,
  formatBytes,
  formatUptime,
  formatTimestamp,
  timeAgo,
} from "@/lib/utils";

export default function PNodeDetailPage({
  params,
}: {
  params: Promise<{ pubkey: string }>;
}) {
  const { pubkey } = use(params);
  const { data: node, isLoading, refetch, isFetching } = usePNode(pubkey);
  const [copied, setCopied] = useState(false);

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

        {/* Score Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <XScoreBadge score={node.xScore} size="lg" showTooltip={false} />
              <div className="text-center">
                <p className="text-2xl font-bold">X-Score</p>
                <p className="text-sm text-muted-foreground">
                  {node.xScore >= 80 && "Excellent"}
                  {node.xScore >= 60 && node.xScore < 80 && "Good"}
                  {node.xScore >= 40 && node.xScore < 60 && "Moderate"}
                  {node.xScore < 40 && "Needs Improvement"}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
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
