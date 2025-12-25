"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  History, 
  TrendingUp, 
  TrendingDown,
  Server,
  Wifi,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  Database,
  PieChart,
  BarChart3,
  Globe,
  HardDrive,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePNodes } from "@/hooks/use-pnodes";
import { useGeolocation } from "@/hooks/use-geolocation";
import { cn, formatBytes } from "@/lib/utils";

interface NetworkSnapshot {
  id: string;
  created_at: string;
  total_nodes: number;
  online_nodes: number;
  offline_nodes: number;
  warning_nodes: number;
  total_storage_committed: number;
  total_storage_used: number;
  average_credits: number;
  total_credits: number;
  average_xscore: number;
  version_distribution: Record<string, number>;
}

const COLORS = [
  "bg-violet-500",
  "bg-indigo-500", 
  "bg-blue-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-pink-500",
  "bg-purple-500",
];

export default function HistoryPage() {
  const [snapshots, setSnapshots] = useState<NetworkSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get live node data for location info
  const { data: liveData } = usePNodes();
  const liveNodes = liveData?.success ? liveData.data.nodes : [];
  
  // Get geolocation data
  const nodeIps = useMemo(() => {
    return [...new Set(liveNodes.map((n) => n.ip).filter(Boolean))];
  }, [liveNodes]);
  const { data: geoData } = useGeolocation(nodeIps);
  const geoMap = geoData || new Map();

  // Calculate country distribution
  const countryDistribution = useMemo(() => {
    const countries: Record<string, number> = {};
    liveNodes.forEach((node) => {
      const geo = geoMap.get(node.ip);
      if (geo?.country) {
        countries[geo.country] = (countries[geo.country] || 0) + 1;
      }
    });
    return Object.entries(countries)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  }, [liveNodes, geoMap]);

  const fetchSnapshots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/snapshot");
      const data = await response.json();
      
      if (data.success && data.data) {
        setSnapshots(data.data);
      } else {
        setError(data.error || "Failed to load historical data");
      }
    } catch {
      setError("Failed to connect to database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  // Calculate trends
  const latestSnapshot = snapshots[0];
  const previousSnapshot = snapshots[1];
  
  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const nodeTrend = latestSnapshot && previousSnapshot 
    ? calculateTrend(latestSnapshot.total_nodes, previousSnapshot.total_nodes)
    : 0;
  
  const onlineTrend = latestSnapshot && previousSnapshot
    ? calculateTrend(latestSnapshot.online_nodes, previousSnapshot.online_nodes)
    : 0;

  const scoreTrend = latestSnapshot && previousSnapshot
    ? calculateTrend(latestSnapshot.average_xscore, previousSnapshot.average_xscore)
    : 0;

  // Version distribution from latest snapshot
  const versionData = useMemo(() => {
    if (!latestSnapshot?.version_distribution) return [];
    return Object.entries(latestSnapshot.version_distribution)
      .map(([version, count]) => ({ version, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [latestSnapshot]);

  const totalVersionCount = versionData.reduce((sum, v) => sum + v.count, 0);

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600">
              <History className="h-6 w-6 text-white" />
            </div>
            Historical Data
          </h1>
          <p className="text-muted-foreground">
            Network performance trends and analytics over time
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSnapshots}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-600 dark:text-yellow-500">Historical Data Unavailable</p>
                <p className="text-sm text-muted-foreground">
                  {error}. Historical snapshots are collected every 10 minutes when the cron job is active.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Stats with Trends */}
      {latestSnapshot && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-violet-500" />
                  <div>
                    <p className="text-2xl font-bold">{latestSnapshot.total_nodes}</p>
                    <p className="text-xs text-muted-foreground">Total Nodes</p>
                  </div>
                </div>
                {nodeTrend !== 0 && (
                  <Badge variant={nodeTrend > 0 ? "success" : "error"} className="flex items-center gap-1">
                    {nodeTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(nodeTrend).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-2xl font-bold text-emerald-500">{latestSnapshot.online_nodes}</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
                {onlineTrend !== 0 && (
                  <Badge variant={onlineTrend > 0 ? "success" : "error"} className="flex items-center gap-1">
                    {onlineTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(onlineTrend).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{latestSnapshot.average_xscore.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Avg X-Score</p>
                  </div>
                </div>
                {scoreTrend !== 0 && (
                  <Badge variant={scoreTrend > 0 ? "success" : "error"} className="flex items-center gap-1">
                    {scoreTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(scoreTrend).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{formatBytes(latestSnapshot.total_storage_committed)}</p>
                  <p className="text-xs text-muted-foreground">Total Storage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Tabs */}
      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="status" className="gap-1">
            <PieChart className="h-3 w-3" />
            Status
          </TabsTrigger>
          <TabsTrigger value="versions" className="gap-1">
            <BarChart3 className="h-3 w-3" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="locations" className="gap-1">
            <Globe className="h-3 w-3" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1">
            <Clock className="h-3 w-3" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Status Distribution Tab */}
        <TabsContent value="status" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Donut Chart Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-violet-500" />
                  Node Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestSnapshot ? (
                  <div className="flex items-center justify-center gap-8">
                    {/* Donut Chart */}
                    <div className="relative w-48 h-48">
                      <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        {(() => {
                          const total = latestSnapshot.total_nodes;
                          const online = latestSnapshot.online_nodes;
                          const warning = latestSnapshot.warning_nodes;
                          const offline = latestSnapshot.offline_nodes;
                          
                          const onlinePercent = (online / total) * 100;
                          const warningPercent = (warning / total) * 100;
                          const offlinePercent = (offline / total) * 100;
                          
                          const radius = 40;
                          const circumference = 2 * Math.PI * radius;
                          
                          let currentOffset = 0;
                          
                          return (
                            <>
                              {/* Online */}
                              <circle
                                cx="50" cy="50" r={radius}
                                fill="none"
                                stroke="rgb(16, 185, 129)"
                                strokeWidth="12"
                                strokeDasharray={`${(onlinePercent / 100) * circumference} ${circumference}`}
                                strokeDashoffset={-currentOffset}
                                className="transition-all duration-500"
                              />
                              {(() => { currentOffset += (onlinePercent / 100) * circumference; return null; })()}
                              
                              {/* Warning */}
                              <circle
                                cx="50" cy="50" r={radius}
                                fill="none"
                                stroke="rgb(234, 179, 8)"
                                strokeWidth="12"
                                strokeDasharray={`${(warningPercent / 100) * circumference} ${circumference}`}
                                strokeDashoffset={-currentOffset}
                                className="transition-all duration-500"
                              />
                              {(() => { currentOffset += (warningPercent / 100) * circumference; return null; })()}
                              
                              {/* Offline */}
                              <circle
                                cx="50" cy="50" r={radius}
                                fill="none"
                                stroke="rgb(239, 68, 68)"
                                strokeWidth="12"
                                strokeDasharray={`${(offlinePercent / 100) * circumference} ${circumference}`}
                                strokeDashoffset={-currentOffset}
                                className="transition-all duration-500"
                              />
                            </>
                          );
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{latestSnapshot.total_nodes}</span>
                        <span className="text-xs text-muted-foreground">Total Nodes</span>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-500" />
                        <div>
                          <p className="font-semibold">{latestSnapshot.online_nodes}</p>
                          <p className="text-xs text-muted-foreground">Online ({((latestSnapshot.online_nodes / latestSnapshot.total_nodes) * 100).toFixed(1)}%)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-yellow-500" />
                        <div>
                          <p className="font-semibold">{latestSnapshot.warning_nodes}</p>
                          <p className="text-xs text-muted-foreground">Warning ({((latestSnapshot.warning_nodes / latestSnapshot.total_nodes) * 100).toFixed(1)}%)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-red-500" />
                        <div>
                          <p className="font-semibold">{latestSnapshot.offline_nodes}</p>
                          <p className="text-xs text-muted-foreground">Offline ({((latestSnapshot.offline_nodes / latestSnapshot.total_nodes) * 100).toFixed(1)}%)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-48" />
                )}
              </CardContent>
            </Card>

            {/* Health Score Gauge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  Network Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestSnapshot ? (
                  <div className="space-y-6">
                    <div className="relative pt-8">
                      {/* Gauge Background */}
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            (latestSnapshot.online_nodes / latestSnapshot.total_nodes) >= 0.8 ? "bg-emerald-500" :
                            (latestSnapshot.online_nodes / latestSnapshot.total_nodes) >= 0.5 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${(latestSnapshot.online_nodes / latestSnapshot.total_nodes) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className={cn(
                        "text-5xl font-bold",
                        (latestSnapshot.online_nodes / latestSnapshot.total_nodes) >= 0.8 ? "text-emerald-500" :
                        (latestSnapshot.online_nodes / latestSnapshot.total_nodes) >= 0.5 ? "text-yellow-500" : "text-red-500"
                      )}>
                        {((latestSnapshot.online_nodes / latestSnapshot.total_nodes) * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(latestSnapshot.online_nodes / latestSnapshot.total_nodes) >= 0.8 ? "Excellent" :
                         (latestSnapshot.online_nodes / latestSnapshot.total_nodes) >= 0.5 ? "Fair" : "Poor"} Network Health
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{latestSnapshot.average_xscore.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Avg X-Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{latestSnapshot.average_credits.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Avg Credits</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{formatBytes(latestSnapshot.total_storage_used)}</p>
                        <p className="text-xs text-muted-foreground">Storage Used</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-48" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-500" />
                Version Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {versionData.length > 0 ? (
                <div className="space-y-4">
                  {versionData.map((v, index) => {
                    const percent = (v.count / totalVersionCount) * 100;
                    return (
                      <div key={v.version} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{v.version}</span>
                          <span className="text-muted-foreground">{v.count} nodes ({percent.toFixed(1)}%)</span>
                        </div>
                        <div className="h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-500", COLORS[index % COLORS.length])}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No version data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {countryDistribution.length > 0 ? (
                <div className="space-y-4">
                  {countryDistribution.slice(0, 10).map((c, index) => {
                    const percent = (c.count / liveNodes.length) * 100;
                    return (
                      <div key={c.country} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{c.country}</span>
                          <span className="text-muted-foreground">{c.count} nodes ({percent.toFixed(1)}%)</span>
                        </div>
                        <div className="h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-500", COLORS[index % COLORS.length])}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="pt-4 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total located nodes</span>
                    <Badge variant="secondary">{geoMap.size} of {liveNodes.length}</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Loading location data...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-violet-500" />
                Network Snapshots (Last 24 Hours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : snapshots.length > 0 ? (
                <div className="space-y-4">
                  {snapshots.slice(0, 20).map((snapshot, index) => {
                    const timestamp = new Date(snapshot.created_at);
                    const onlinePercent = snapshot.total_nodes > 0 
                      ? (snapshot.online_nodes / snapshot.total_nodes) * 100 
                      : 0;
                    
                    return (
                      <div 
                        key={snapshot.id} 
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border",
                          index === 0 && "border-violet-500/50 bg-violet-500/5"
                        )}
                      >
                        <div className="flex flex-col items-center min-w-[80px]">
                          <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                          <span className="text-xs font-mono">
                            {timestamp.toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{snapshot.total_nodes}</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">total</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium text-emerald-500">{snapshot.online_nodes}</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">online</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium text-yellow-500">{snapshot.warning_nodes}</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">warning</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <WifiOff className="h-4 w-4 text-red-500" />
                            <span className="font-medium text-red-500">{snapshot.offline_nodes}</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">offline</span>
                          </div>
                        </div>

                        <div className="hidden sm:block w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Health</span>
                            <span className={cn(
                              onlinePercent >= 80 ? "text-emerald-500" :
                              onlinePercent >= 50 ? "text-yellow-500" : "text-red-500"
                            )}>
                              {onlinePercent.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                onlinePercent >= 80 ? "bg-emerald-500" :
                                onlinePercent >= 50 ? "bg-yellow-500" : "bg-red-500"
                              )}
                              style={{ width: `${onlinePercent}%` }}
                            />
                          </div>
                        </div>

                        {index === 0 && (
                          <Badge variant="secondary">Latest</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Historical Data Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Historical snapshots are collected every 10 minutes. 
                    Data will appear here once the snapshot collection is running.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Database className="h-6 w-6 text-violet-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">About Historical Data</h3>
              <p className="text-sm text-muted-foreground">
                Network snapshots are collected every 10 minutes and stored in Supabase. 
                This allows you to track network health, node availability, and performance trends over time.
                Location data is fetched in real-time for currently active nodes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
