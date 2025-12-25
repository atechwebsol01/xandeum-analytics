"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Coins, 
  TrendingUp,
  Clock,
  Percent,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StakingTier {
  name: string;
  minStake: number;
  apy: number;
  color: string;
}

const STAKING_TIERS: StakingTier[] = [
  { name: "Bronze", minStake: 0, apy: 6.5, color: "text-orange-600" },
  { name: "Silver", minStake: 100, apy: 7.2, color: "text-gray-400" },
  { name: "Gold", minStake: 500, apy: 8.0, color: "text-yellow-500" },
  { name: "Platinum", minStake: 1000, apy: 8.5, color: "text-cyan-400" },
  { name: "Diamond", minStake: 5000, apy: 9.2, color: "text-violet-500" },
];

const LOCK_PERIODS = [
  { days: 30, bonus: 0, label: "30 Days" },
  { days: 90, bonus: 0.5, label: "90 Days" },
  { days: 180, bonus: 1.0, label: "180 Days" },
  { days: 365, bonus: 1.5, label: "1 Year" },
];

export function StakingCalculator() {
  const [solAmount, setSolAmount] = useState<string>("100");
  const [selectedPeriod, setSelectedPeriod] = useState(90);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState(false);

  // Fetch real SOL price - NO fake fallbacks
  useEffect(() => {
    const fetchSolPrice = async () => {
      setPriceLoading(true);
      setPriceError(false);
      
      // Try our API first
      try {
        const response = await fetch("/api/sol-price");
        if (response.ok) {
          const data = await response.json();
          if (data.price && data.price > 0) {
            setSolPrice(data.price);
            setPriceLoading(false);
            return;
          }
        }
      } catch {
        // API failed, try CoinGecko directly
      }
      
      // Fallback: fetch directly from CoinGecko
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.solana?.usd) {
            setSolPrice(data.solana.usd);
            setPriceLoading(false);
            return;
          }
        }
      } catch {
        // CoinGecko failed too
      }
      
      // All APIs failed
      setPriceLoading(false);
      setPriceError(true);
    };
    fetchSolPrice();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSolPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculations = useMemo(() => {
    const amount = parseFloat(solAmount) || 0;
    
    // Determine tier based on amount
    const tier = [...STAKING_TIERS].reverse().find(t => amount >= t.minStake) || STAKING_TIERS[0];
    
    // Get lock period bonus
    const periodConfig = LOCK_PERIODS.find(p => p.days === selectedPeriod) || LOCK_PERIODS[0];
    
    // Calculate effective APY
    const effectiveApy = tier.apy + periodConfig.bonus;
    
    // Calculate rewards
    const dailyRate = effectiveApy / 100 / 365;
    const periodRewards = amount * dailyRate * selectedPeriod;
    const yearlyRewards = amount * (effectiveApy / 100);
    
    // USD values (use 0 if price not available)
    const price = solPrice || 0;
    const stakingValueUsd = amount * price;
    const periodRewardsUsd = periodRewards * price;
    const yearlyRewardsUsd = yearlyRewards * price;

    return {
      tier,
      effectiveApy,
      periodRewards,
      yearlyRewards,
      stakingValueUsd,
      periodRewardsUsd,
      yearlyRewardsUsd,
      dailyRewards: amount * dailyRate,
      dailyRewardsUsd: amount * dailyRate * price,
    };
  }, [solAmount, selectedPeriod, solPrice]);

  return (
    <Card className="bg-gradient-to-br from-emerald-500/5 via-background to-teal-500/5 border-emerald-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600">
            <Calculator className="h-4 w-4 text-white" />
          </div>
          Staking Calculator
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Estimate your staking rewards based on amount and lock period. Actual rewards may vary.</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Amount to Stake
          </label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={solAmount}
              onChange={(e) => setSolAmount(e.target.value)}
              placeholder="Enter SOL amount"
              className="pl-10 pr-16 text-lg font-semibold"
              min="0"
              step="0.1"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              SOL
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {priceLoading ? (
              <span className="text-muted-foreground">Loading price...</span>
            ) : priceError || !solPrice ? (
              <span className="text-red-500">Price unavailable - check connection</span>
            ) : (
              <>
                ≈ ${calculations.stakingValueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                <span className="ml-2 text-violet-500">(SOL @ ${solPrice.toFixed(2)})</span>
              </>
            )}
          </p>
        </div>

        {/* Lock Period Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Lock Period
          </label>
          <div className="grid grid-cols-4 gap-2">
            {LOCK_PERIODS.map((period) => (
              <button
                key={period.days}
                onClick={() => setSelectedPeriod(period.days)}
                className={cn(
                  "p-2 rounded-lg text-center transition-all border",
                  selectedPeriod === period.days
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                    : "bg-muted/50 border-transparent hover:bg-muted"
                )}
              >
                <p className="text-xs font-medium">{period.label}</p>
                {period.bonus > 0 && (
                  <p className="text-[10px] text-emerald-500">+{period.bonus}%</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tier Badge */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Your Tier:</span>
            <Badge className={cn("font-semibold", calculations.tier.color)}>
              {calculations.tier.name}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-emerald-500">
            <Percent className="h-4 w-4" />
            <span className="font-bold">{calculations.effectiveApy.toFixed(1)}% APY</span>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Estimated Rewards
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-muted-foreground">Daily</p>
              <p className="font-bold text-emerald-500">
                {calculations.dailyRewards.toFixed(4)} SOL
              </p>
              <p className="text-xs text-muted-foreground">
                {solPrice ? `≈ $${calculations.dailyRewardsUsd.toFixed(2)}` : "USD: N/A"}
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-muted-foreground">{selectedPeriod} Days</p>
              <p className="font-bold text-emerald-500">
                {calculations.periodRewards.toFixed(4)} SOL
              </p>
              <p className="text-xs text-muted-foreground">
                {solPrice ? `≈ $${calculations.periodRewardsUsd.toFixed(2)}` : "USD: N/A"}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
            <p className="text-xs text-muted-foreground">Yearly Projection</p>
            <p className="text-xl font-bold text-emerald-500">
              {calculations.yearlyRewards.toFixed(4)} SOL
            </p>
            <p className="text-sm text-muted-foreground">
              {solPrice 
                ? `≈ $${calculations.yearlyRewardsUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`
                : "USD value unavailable"}
            </p>
          </div>
        </div>

        {/* Tier Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="font-medium">Tier Requirements:</p>
          <div className="flex flex-wrap gap-2">
            {STAKING_TIERS.map((tier) => (
              <span key={tier.name} className={cn("flex items-center gap-1", tier.color)}>
                {tier.name}: {tier.minStake}+ SOL ({tier.apy}%)
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
