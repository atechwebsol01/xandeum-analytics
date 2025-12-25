"use client";

import { useMemo } from "react";
import Link from "next/link";
import { 
  Server, 
  Wifi, 
  Activity, 
  TrendingUp,
  BarChart3,
  Calculator,
  Bot,
  Globe,
  ArrowRight,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobeWrapper } from "@/components/dashboard/globe-wrapper";
import { LiveIndicator } from "@/components/dashboard/live-indicator";
import { NetworkWeather } from "@/components/dashboard/network-weather";
import { usePNodes } from "@/hooks/use-pnodes";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useGeolocation } from "@/hooks/use-geolocation";
import { cn, formatCredits } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading } = usePNodes();
  const { data: tokenData, isLoading: tokenLoading } = useTokenPrice();

  const nodes = useMemo(() => {
    return data?.success ? data.data.nodes : [];
  }, [data]);
  
  const stats = data?.success ? data.data.stats : null;

  // Get unique IPs for geolocation
  const nodeIps = useMemo(() => {
    return [...new Set(nodes.map((n) => n.ip).filter(Boolean))];
  }, [nodes]);

  // Fetch geolocation data
  const { data: geoData } = useGeolocation(nodeIps);
  const geoMap = geoData || new Map();
  
  const totalNodes = stats?.totalNodes || 0;
  const onlineNodes = stats?.onlineNodes || 0;
  const healthScore = totalNodes > 0 
    ? Math.round((onlineNodes / totalNodes) * 100 + (stats?.warningNodes || 0) / totalNodes * 50)
    : 0;
  const xandPrice = tokenData?.success ? tokenData.data.price : 0;
  const avgXScore = stats?.averageXScore || 0;
  const onlinePercent = totalNodes > 0 ? (onlineNodes / totalNodes) * 100 : 0;

  return (
    <div className="container py-6 sm:py-8 lg:py-12 px-4 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="gradient-text">Xandeum</span> Analytics
          </h1>
          {!isLoading && <LiveIndicator />}
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Real-time monitoring for the Xandeum decentralized storage network
        </p>
      </div>

      {/* Network Weather */}
      <NetworkWeather
        onlinePercent={onlinePercent}
        avgXScore={avgXScore}
        totalNodes={totalNodes}
        isLoading={isLoading}
      />

      {/* Hero Stats - 4 Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Nodes */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
                <Server className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total pNodes</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold">{totalNodes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Online Nodes */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 shadow-lg">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold text-emerald-500">{onlineNodes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Score */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className={cn(
                    "text-3xl font-bold",
                    healthScore >= 80 ? "text-emerald-500" :
                    healthScore >= 50 ? "text-yellow-500" : "text-red-500"
                  )}>
                    {healthScore}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* XAND Price */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">XAND Price</p>
                {tokenLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-3xl font-bold text-amber-500">
                    ${xandPrice.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Globe - Hero Visualization */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <GlobeWrapper nodes={nodes} geoData={geoMap} isLoading={isLoading} />
        </CardContent>
      </Card>
      
      {/* Globe Actions */}
      <div className="flex items-center justify-between -mt-4">
        <Badge variant="secondary" className="bg-background border">
          <Globe className="h-3 w-3 mr-1" />
          {geoMap.size > 0 ? `${geoMap.size} nodes located` : "Global Node Distribution"}
        </Badge>
        <Link href="/pnodes">
          <Button size="sm" variant="outline">
            Explore All Nodes
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Quick Access Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Network Analytics */}
        <Link href="/analytics" className="group">
          <Card className="h-full hover:shadow-lg hover:border-violet-500/50 transition-all cursor-pointer">
            <CardContent className="pt-6 space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 w-fit shadow-lg group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-violet-500 transition-colors">
                  Network Analytics
                </h3>
                <p className="text-sm text-muted-foreground">
                  Version distribution, storage stats, geographic breakdown
                </p>
              </div>
              <div className="flex items-center text-sm text-violet-500 font-medium">
                View Details
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Token Analytics */}
        <Link href="/analytics#token" className="group">
          <Card className="h-full hover:shadow-lg hover:border-amber-500/50 transition-all cursor-pointer">
            <CardContent className="pt-6 space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 w-fit shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-amber-500 transition-colors">
                  Token Analytics
                </h3>
                <p className="text-sm text-muted-foreground">
                  XAND price, market cap, liquidity, trading volume
                </p>
              </div>
              <div className="flex items-center text-sm text-amber-500 font-medium">
                View Details
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Staking Calculator */}
        <Link href="/analytics#staking" className="group">
          <Card className="h-full hover:shadow-lg hover:border-emerald-500/50 transition-all cursor-pointer">
            <CardContent className="pt-6 space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 w-fit shadow-lg group-hover:scale-110 transition-transform">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-emerald-500 transition-colors">
                  Staking Calculator
                </h3>
                <p className="text-sm text-muted-foreground">
                  Calculate rewards, APY tiers, lock period bonuses
                </p>
              </div>
              <div className="flex items-center text-sm text-emerald-500 font-medium">
                Calculate Now
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* AI Assistant */}
        <Link href="/chat" className="group">
          <Card className="h-full hover:shadow-lg hover:border-blue-500/50 transition-all cursor-pointer">
            <CardContent className="pt-6 space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 w-fit shadow-lg group-hover:scale-110 transition-transform">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-blue-500 transition-colors">
                  AI Assistant
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ask questions about Xandeum, get instant answers
                </p>
              </div>
              <div className="flex items-center text-sm text-blue-500 font-medium">
                Start Chat
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Top Performers Preview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-lg">Top Performers</h3>
            </div>
            <Link href="/pnodes">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4">
              {nodes
                .sort((a, b) => b.credits - a.credits)
                .slice(0, 3)
                .map((node, index) => (
                  <Link key={node.pubkey} href={`/pnodes/${node.pubkey}`}>
                    <Card className={cn(
                      "hover:shadow-md transition-all cursor-pointer",
                      index === 0 && "border-yellow-500/50 bg-yellow-500/5",
                      index === 1 && "border-gray-400/50 bg-gray-400/5",
                      index === 2 && "border-orange-500/50 bg-orange-500/5"
                    )}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "text-2xl",
                            index === 0 && "text-yellow-500",
                            index === 1 && "text-gray-400",
                            index === 2 && "text-orange-500"
                          )}>
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <code className="text-sm font-mono truncate block">
                              {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-4)}
                            </code>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={node.status === "online" ? "success" : "warning"} className="text-xs">
                                {node.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">v{node.version}</span>
                            </div>
                          </div>
                          <div className={cn(
                            "text-lg font-bold",
                            node.credits >= 40000 ? "text-emerald-500" :
                            node.credits >= 20000 ? "text-blue-500" :
                            "text-yellow-500"
                          )}>
                            {formatCredits(node.credits)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground py-4 border-t">
        <p>
          Powered by <span className="font-semibold gradient-text">Xandeum</span> pRPC Network
        </p>
      </div>
    </div>
  );
}
