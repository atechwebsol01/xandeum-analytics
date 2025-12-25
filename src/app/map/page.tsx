"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  Globe, 
  MapPin, 
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { usePNodes } from "@/hooks/use-pnodes";
import { useGeolocation } from "@/hooks/use-geolocation";
import { cn, timeAgo } from "@/lib/utils";

// Dynamically import the map component to avoid SSR issues
const NetworkMap = dynamic(
  () => import("@/components/dashboard/network-map").then((mod) => mod.NetworkMap),
  { 
    ssr: false, 
    loading: () => <Skeleton className="h-[500px] w-full rounded-lg" />
  }
);

// Dynamically import the 3D globe
const GlobeWrapper = dynamic(
  () => import("@/components/dashboard/globe-wrapper").then((mod) => mod.GlobeWrapper),
  { 
    ssr: false, 
    loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />
  }
);

export default function MapPage() {
  const { data, isLoading, refetch, isFetching, dataUpdatedAt } = usePNodes();
  
  const nodes = data?.success ? data.data.nodes : [];
  const stats = data?.success ? data.data.stats : null;

  // Get unique IPs for geolocation
  const nodeIps = useMemo(() => {
    return [...new Set(nodes.map((n) => n.ip).filter(Boolean))];
  }, [nodes]);

  // Fetch geolocation data
  const { data: geoData, isLoading: geoLoading } = useGeolocation(nodeIps);
  const geoMap = geoData || new Map();

  // Calculate country distribution
  const countryDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    nodes.forEach((node) => {
      const geo = geoMap.get(node.ip);
      if (geo) {
        const country = geo.country || "Unknown";
        distribution[country] = (distribution[country] || 0) + 1;
      }
    });
    return Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [nodes, geoMap]);

  const locatedNodes = nodes.filter((n) => geoMap.has(n.ip)).length;
  const onlineNodes = nodes.filter((n) => n.status === "online").length;
  const warningNodes = nodes.filter((n) => n.status === "warning").length;
  const offlineNodes = nodes.filter((n) => n.status === "offline").length;

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600">
              <Globe className="h-6 w-6 text-white" />
            </div>
            Global Network Map
          </h1>
          <p className="text-muted-foreground">
            Geographic distribution of pNodes worldwide
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

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-violet-500" />
              <div>
                <p className="text-2xl font-bold">{nodes.length}</p>
                <p className="text-xs text-muted-foreground">Total Nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{locatedNodes}</p>
                <p className="text-xs text-muted-foreground">Located</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-emerald-500">{onlineNodes}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-500">{warningNodes}</p>
                <p className="text-xs text-muted-foreground">Warning</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">{offlineNodes}</p>
                <p className="text-xs text-muted-foreground">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Globe */}
      <GlobeWrapper nodes={nodes} geoData={geoMap} isLoading={isLoading || geoLoading} />

      {/* 2D Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Interactive Map
            </CardTitle>
            <Badge variant="outline">
              {geoLoading ? "Loading locations..." : `${locatedNodes} nodes located`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] rounded-lg overflow-hidden">
            <NetworkMap nodes={nodes} isLoading={isLoading} />
          </div>
        </CardContent>
      </Card>

      {/* Country Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-violet-500" />
            Top Countries by Node Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || geoLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          ) : countryDistribution.length > 0 ? (
            <div className="space-y-3">
              {countryDistribution.map(([country, count], index) => {
                const percent = nodes.length > 0 ? (count / nodes.length) * 100 : 0;
                return (
                  <div key={country} className="flex items-center gap-4">
                    <span className="w-6 text-sm font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{country}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} nodes ({percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No location data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
              <span className="text-sm">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm">Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-violet-500/50" />
              <span className="text-sm">Network Connection</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
