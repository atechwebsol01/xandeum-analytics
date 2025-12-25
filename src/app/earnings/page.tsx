"use client";

import { useMemo } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Coins,
  Info,
  RefreshCw,
  Calculator
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EarningsEstimator } from "@/components/dashboard/earnings-estimator";
import { VersionTracker } from "@/components/dashboard/version-tracker";
import { usePNodes } from "@/hooks/use-pnodes";
import { useTokenPrice } from "@/hooks/use-token-price";
import { cn, formatCredits } from "@/lib/utils";

export default function EarningsPage() {
  const { data, isLoading, refetch, isFetching } = usePNodes();
  const { data: tokenData } = useTokenPrice();
  
  const nodes = data?.success ? data.data.nodes : [];
  const stats = data?.success ? data.data.stats : null;
  const xandPrice = tokenData?.success ? tokenData.data.price : 0;

  // Calculate network earning stats
  const networkStats = useMemo(() => {
    if (!nodes.length) return null;
    
    const totalCredits = nodes.reduce((sum, n) => sum + (n.credits || 0), 0);
    const avgCredits = totalCredits / nodes.length;
    const topPerformer = nodes.reduce((top, n) => n.credits > (top?.credits || 0) ? n : top, nodes[0]);
    const avgXScore = nodes.reduce((sum, n) => sum + (n.xScore || 0), 0) / nodes.length;
    
    // Estimate network-wide daily credits earned
    const estimatedDailyCredits = nodes.length * 2880 * 0.75; // Assuming 75% average uptime
    
    return {
      totalCredits,
      avgCredits,
      topPerformerCredits: topPerformer?.credits || 0,
      avgXScore,
      estimatedDailyCredits,
    };
  }, [nodes]);

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            Earnings & Analysis
          </h1>
          <p className="text-muted-foreground">
            Estimate pNode earnings and track network performance
          </p>
        </div>
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

      {/* Current XAND Price */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current XAND Price</p>
                <p className="text-3xl font-bold">
                  ${xandPrice > 0 ? xandPrice.toFixed(6) : "Loading..."}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <div className="text-center">
                <p className="text-xl font-bold">{nodes.length}</p>
                <p className="text-xs text-muted-foreground">Active Nodes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{networkStats?.avgXScore.toFixed(0) || 0}</p>
                <p className="text-xs text-muted-foreground">Avg X-Score</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{formatCredits(networkStats?.avgCredits || 0)}</p>
                <p className="text-xs text-muted-foreground">Avg Credits</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Leaderboard Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-violet-500" />
              <div>
                <p className="text-2xl font-bold">{formatCredits(networkStats?.totalCredits || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Network Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{formatCredits(networkStats?.estimatedDailyCredits || 0)}</p>
                <p className="text-xs text-muted-foreground">Est. Daily Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{formatCredits(networkStats?.topPerformerCredits || 0)}</p>
                <p className="text-xs text-muted-foreground">Top Node Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{formatCredits(networkStats?.avgCredits || 0)}</p>
                <p className="text-xs text-muted-foreground">Avg Credits/Node</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Estimator */}
      <EarningsEstimator currentXandPrice={xandPrice} />

      {/* Version Tracker */}
      <VersionTracker nodes={nodes} isLoading={isLoading} />

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-violet-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">How pNode Earnings Work</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Pod Credits:</strong> Nodes earn +1 credit per successful heartbeat (~every 30 seconds). 
                  Credits are reduced by 100 for missed data operations.
                </p>
                <p>
                  <strong>Rewards:</strong> Higher credits and X-Score increase your chances of earning XAND rewards 
                  during distribution events.
                </p>
                <p>
                  <strong>Maximizing Earnings:</strong> Keep your node online 24/7, maintain adequate storage, 
                  and keep your software updated to the latest version.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
