"use client";

import { RefreshCw, AlertCircle, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NetworkStatsGrid } from "@/components/dashboard/network-stats";
import { VersionChart } from "@/components/dashboard/version-chart";
import { PNodeTable } from "@/components/dashboard/pnode-table";
import { usePNodes } from "@/hooks/use-pnodes";
import { cn, timeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } =
    usePNodes();

  const nodes = data?.success ? data.data.nodes : [];
  const stats = data?.success ? data.data.stats : null;
  const apiError = data?.success === false ? data?.error : null;
  const isDemo = data?.success ? data.data.isDemo : false;

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Xandeum</span> Network Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time analytics for Xandeum pNode network
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dataUpdatedAt && !isError && (
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

      {/* Demo Mode Banner */}
      {isDemo && !isError && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="flex items-center gap-3 py-4">
            <Info className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="font-medium text-blue-500">
                Demo Mode Active
              </p>
              <p className="text-sm text-muted-foreground">
                Showing simulated data. Real pRPC endpoints are currently unreachable. 
                The app is fully functional for demonstration purposes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Network Stats */}
      <NetworkStatsGrid stats={stats} isLoading={isLoading} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <VersionChart
          data={stats?.versionDistribution || {}}
          isLoading={isLoading}
        />
        
        {/* Top Performers Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {nodes
                  .sort((a, b) => b.xScore - a.xScore)
                  .slice(0, 5)
                  .map((node, index) => (
                    <div
                      key={node.pubkey}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm",
                            index === 0 &&
                              "bg-yellow-500/10 text-yellow-500 ring-2 ring-yellow-500/20",
                            index === 1 &&
                              "bg-gray-400/10 text-gray-400 ring-2 ring-gray-400/20",
                            index === 2 &&
                              "bg-orange-500/10 text-orange-500 ring-2 ring-orange-500/20",
                            index > 2 && "bg-muted text-muted-foreground"
                          )}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <code className="text-sm font-mono">
                            {node.pubkey.slice(0, 8)}...
                          </code>
                          <p className="text-xs text-muted-foreground">
                            v{node.version}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            node.status === "online"
                              ? "success"
                              : node.status === "warning"
                              ? "warning"
                              : "error"
                          }
                        >
                          {node.status}
                        </Badge>
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg font-bold text-sm",
                            node.xScore >= 80
                              ? "bg-emerald-500/10 text-emerald-500"
                              : node.xScore >= 60
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-red-500/10 text-red-500"
                          )}
                        >
                          {node.xScore}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* pNode Table */}
      <PNodeTable nodes={nodes} isLoading={isLoading} />
    </div>
  );
}
