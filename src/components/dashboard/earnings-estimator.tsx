"use client";

import { useState, useMemo } from "react";
import { 
  Calculator, 
  TrendingUp, 
  Coins, 
  Clock, 
  HardDrive,
  Info,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EarningsEstimatorProps {
  currentXandPrice?: number;
}

export function EarningsEstimator({ currentXandPrice = 0.002 }: EarningsEstimatorProps) {
  const [uptimePercent, setUptimePercent] = useState(95);
  const [storageGB, setStorageGB] = useState(100);
  const [numNodes, setNumNodes] = useState(1);

  const estimates = useMemo(() => {
    // Base assumptions (these are estimates based on Xandeum economics)
    // Credits earned: ~2880 per day at 100% uptime (1 per 30 seconds)
    const creditsPerDayBase = 2880;
    const creditsPerDay = creditsPerDayBase * (uptimePercent / 100) * numNodes;
    
    // Storage bonus: Extra credits for storage contribution
    const storageBonus = Math.min(storageGB / 10, 100); // Cap at 100 bonus credits/day
    const totalCreditsPerDay = creditsPerDay + (storageBonus * numNodes);
    
    // Monthly credits
    const creditsPerMonth = totalCreditsPerDay * 30;
    
    // Estimated XAND rewards (highly speculative - based on network participation)
    // Assumption: Top performers earn ~0.1% of their credits as XAND monthly
    const estimatedXandMonthly = creditsPerMonth * 0.001;
    const estimatedUsdMonthly = estimatedXandMonthly * currentXandPrice;
    
    // Yearly projections
    const estimatedXandYearly = estimatedXandMonthly * 12;
    const estimatedUsdYearly = estimatedUsdMonthly * 12;

    // ROI estimate (assuming $50 monthly cost for running a node)
    const monthlyCost = 50 * numNodes;
    const monthlyProfit = estimatedUsdMonthly - monthlyCost;
    const roiMonths = monthlyProfit > 0 ? Math.ceil(monthlyCost / monthlyProfit) : Infinity;

    return {
      creditsPerDay: Math.round(totalCreditsPerDay),
      creditsPerMonth: Math.round(creditsPerMonth),
      xandMonthly: estimatedXandMonthly,
      usdMonthly: estimatedUsdMonthly,
      xandYearly: estimatedXandYearly,
      usdYearly: estimatedUsdYearly,
      monthlyProfit,
      roiMonths,
    };
  }, [uptimePercent, storageGB, numNodes, currentXandPrice]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-emerald-500" />
          Earnings Estimator
          <Badge variant="outline" className="ml-2 text-xs">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Number of Nodes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="h-4 w-4" />
              Number of pNodes
            </label>
            <Input
              type="number"
              min={1}
              max={100}
              value={numNodes}
              onChange={(e) => setNumNodes(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          {/* Uptime */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Expected Uptime
              </span>
              <span className="font-bold">{uptimePercent}%</span>
            </label>
            <input
              type="range"
              value={uptimePercent}
              onChange={(e) => setUptimePercent(parseInt(e.target.value))}
              min={50}
              max={100}
              step={1}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>

          {/* Storage */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="h-4 w-4" />
              Storage (GB)
            </label>
            <Input
              type="number"
              min={10}
              max={10000}
              value={storageGB}
              onChange={(e) => setStorageGB(Math.max(10, parseInt(e.target.value) || 10))}
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <span className="text-sm text-muted-foreground">Daily Credits</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(estimates.creditsPerDay)}</p>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Monthly Credits</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(estimates.creditsPerMonth)}</p>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Est. XAND/Month</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(estimates.xandMonthly)}</p>
            <p className="text-xs text-muted-foreground">
              ≈ ${estimates.usdMonthly.toFixed(2)} USD
            </p>
          </div>

          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Est. Yearly</span>
            </div>
            <p className="text-2xl font-bold">${estimates.usdYearly.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">
              {formatNumber(estimates.xandYearly)} XAND
            </p>
          </div>
        </div>

        {/* Profitability Analysis */}
        <div className={cn(
          "p-4 rounded-lg border",
          estimates.monthlyProfit > 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
        )}>
          <div className="flex items-start gap-3">
            <Info className={cn("h-5 w-5 mt-0.5", estimates.monthlyProfit > 0 ? "text-emerald-500" : "text-red-500")} />
            <div>
              <p className="font-semibold">
                {estimates.monthlyProfit > 0 ? "Potentially Profitable!" : "May Not Be Profitable"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Assuming ~$50/month operating cost per node: 
                {estimates.monthlyProfit > 0 
                  ? ` Estimated profit of $${estimates.monthlyProfit.toFixed(2)}/month. Break-even in ~${estimates.roiMonths} months.`
                  : " Current estimates suggest operating costs may exceed rewards."}
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground">
          ⚠️ <strong>Disclaimer:</strong> These are rough estimates based on current network parameters. 
          Actual earnings depend on network conditions, XAND price, your node's performance, and reward distribution mechanisms. 
          This is not financial advice.
        </p>
      </CardContent>
    </Card>
  );
}
