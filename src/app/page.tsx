"use client";

import { useEffect } from "react";
import { RefreshCw, AlertCircle, Keyboard, Award, Coins } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NetworkStatsGrid } from "@/components/dashboard/network-stats";
import { VersionChart } from "@/components/dashboard/version-chart";
import { PNodeTable } from "@/components/dashboard/pnode-table";
import { NetworkHealth } from "@/components/dashboard/network-health";
import { NetworkAlerts } from "@/components/dashboard/network-alerts";
import { LiveIndicator } from "@/components/dashboard/live-indicator";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { NetworkMap } from "@/components/dashboard/network-map";
import { usePNodes } from "@/hooks/use-pnodes";
import { cn, timeAgo, formatCredits } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } =
    usePNodes();

  const nodes = data?.success ? data.data.nodes : [];
  const stats = data?.success ? data.data.stats : null;
  const apiError = data?.success === false ? data?.error : null;
  const creditsCount = data?.success ? data.data.creditsCount : 0;

  // Handle refresh from keyboard shortcut
  useEffect(() => {
    const handleRefresh = () => {
      refetch();
      toast.success("Data refreshed!", {
        description: "Latest network data has been fetched.",
      });
    };
    
    window.addEventListener("refresh-data", handleRefresh);
    return () => window.removeEventListener("refresh-data", handleRefresh);
  }, [refetch]);

  const handleRefreshClick = () => {
    refetch();
    toast.success("Refreshing data...", {
      description: "Fetching latest network information.",
    });
  };

  return (
    <div className="container py-4 sm:py-6 lg:py-8 px-3 sm:px-4 space-y-4 sm:space-y-6">
      {/* Hero Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              <span className="gradient-text">Xandeum</span> Network Dashboard
            </h1>
            {!isLoading && !isError && <LiveIndicator />}
          </div>
          <p className="text-muted-foreground">
            Real-time analytics for Xandeum pNode network
          </p>
          {/* Quick Stats Bar */}
          <QuickStats stats={stats} nodes={nodes} isLoading={isLoading} />
        </div>
        <div className="flex items-center gap-2">
          {dataUpdatedAt && !isError && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Updated {timeAgo(Math.floor(dataUpdatedAt / 1000))}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshClick}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.info("Press ? for keyboard shortcuts")}
            className="gap-2 hidden sm:flex"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Live Data Banner */}
      {!isError && !isLoading && nodes.length > 0 && (
        <Card className="border-emerald-500/50 bg-emerald-500/5">
          <CardContent className="flex items-center gap-3 py-4">
            <Coins className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-emerald-500">
                Live Network Data
              </p>
              <p className="text-sm text-muted-foreground">
                Connected to Xandeum pRPC network. Tracking {nodes.length} pNodes with {creditsCount} pod credits records.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {(isError || apiError) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-destructive">
                Failed to load pNode data
              </p>
              <p className="text-sm text-muted-foreground">
                {apiError || "Unable to connect to Xandeum pRPC endpoints."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Network Health + Alerts Row */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <NetworkHealth stats={stats} isLoading={isLoading} />
        <div className="md:col-span-1 lg:col-span-2">
          <NetworkAlerts nodes={nodes} isLoading={isLoading} />
        </div>
      </div>

      {/* Network Stats */}
      <NetworkStatsGrid stats={stats} isLoading={isLoading} />

      {/* Global Map */}
      <NetworkMap nodes={nodes} isLoading={isLoading} />

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Only render chart when data is fully loaded to avoid Recharts null errors */}
        {!isLoading && stats?.versionDistribution ? (
          <VersionChart
            data={stats.versionDistribution}
            isLoading={false}
          />
        ) : (
          <VersionChart
            data={{}}
            isLoading={true}
          />
        )}
        
        {/* Top Performers by Credits */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Pod Credits
              </CardTitle>
              <Link href="/pnodes">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {nodes
                  .sort((a, b) => b.credits - a.credits)
                  .slice(0, 5)
                  .map((node, index) => (
                    <Link
                      key={node.pubkey}
                      href={`/pnodes/${node.pubkey}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all hover:scale-[1.01] cursor-pointer">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div
                            className={cn(
                              "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full font-bold text-xs sm:text-sm transition-transform shrink-0",
                              index === 0 &&
                                "bg-yellow-500/10 text-yellow-500 ring-2 ring-yellow-500/20",
                              index === 1 &&
                                "bg-gray-400/10 text-gray-400 ring-2 ring-gray-400/20",
                              index === 2 &&
                                "bg-orange-500/10 text-orange-500 ring-2 ring-orange-500/20",
                              index > 2 && "bg-muted text-muted-foreground"
                            )}
                          >
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                          </div>
                          <div className="min-w-0">
                            <code className="text-xs sm:text-sm font-mono truncate block">
                              {node.pubkey.slice(0, 6)}...{node.pubkey.slice(-4)}
                            </code>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              v{node.version} • {node.is_public ? "Public" : "Private"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <Badge
                            variant={
                              node.status === "online"
                                ? "success"
                                : node.status === "warning"
                                ? "warning"
                                : "error"
                            }
                            className="hidden md:flex text-[10px] sm:text-xs"
                          >
                            {node.status}
                          </Badge>
                          <div
                            className={cn(
                              "flex h-8 w-auto px-2 sm:h-10 items-center justify-center rounded-lg font-bold text-xs sm:text-sm",
                              node.credits >= 40000
                                ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20"
                                : node.credits >= 20000
                                ? "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20"
                                : node.credits >= 10000
                                ? "bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20"
                                : "bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20"
                            )}
                          >
                            {formatCredits(node.credits)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* pNode Table */}
      <PNodeTable nodes={nodes} isLoading={isLoading} />

      {/* Footer hint */}
      <div className="text-center text-sm text-muted-foreground py-4">
        <span className="hidden sm:inline">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">?</kbd> for keyboard shortcuts
        </span>
      </div>
    </div>
  );
}
