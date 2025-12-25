"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  DollarSign,
  BarChart3,
  Droplets,
  RefreshCw
} from "lucide-react";


interface TokenData {
  price: number;
  price_change_24h: number;
  market_cap: number;
  volume_24h: number;
  liquidity: number;
  fdv: number;
}

export function TokenAnalytics() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTokenData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch XAND token data from Jupiter/Birdeye API
      const response = await fetch('/api/token-price');
      
      if (!response.ok) {
        throw new Error('Failed to fetch token data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTokenData(data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      // Error handling
      setError(err instanceof Error ? err.message : 'Failed to load token data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenData();
    const interval = setInterval(fetchTokenData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price < 0.0001) return `$${price.toExponential(2)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  if (error) {
    return (
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Coins className="h-5 w-5 text-yellow-500" />
            XAND Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button 
            onClick={fetchTokenData}
            className="mt-2 text-xs text-violet-500 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-violet-500/5 via-background to-indigo-500/5 border-violet-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <Coins className="h-4 w-4 text-white" />
            </div>
            XAND Token
          </CardTitle>
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-32" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        ) : tokenData ? (
          <>
            {/* Price Header */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold">
                {formatPrice(tokenData.price)}
              </span>
              <Badge 
                variant={tokenData.price_change_24h >= 0 ? "success" : "error"}
                className="flex items-center gap-1 mb-1"
              >
                {tokenData.price_change_24h >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {tokenData.price_change_24h >= 0 ? "+" : ""}
                {tokenData.price_change_24h.toFixed(2)}%
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  Market Cap
                </div>
                <p className="font-semibold">{formatLargeNumber(tokenData.market_cap)}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  24h Volume
                </div>
                <p className="font-semibold">{formatLargeNumber(tokenData.volume_24h)}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Droplets className="h-3 w-3" />
                  Liquidity
                </div>
                <p className="font-semibold">{formatLargeNumber(tokenData.liquidity)}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Coins className="h-3 w-3" />
                  FDV
                </div>
                <p className="font-semibold">{formatLargeNumber(tokenData.fdv)}</p>
              </div>
            </div>

            {/* Price Chart - DexScreener Embed */}
            <div className="rounded-lg overflow-hidden border border-border/50 bg-black/20">
              <iframe
                src="https://dexscreener.com/solana/XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx?embed=1&theme=dark&trades=0&info=0"
                className="w-full h-[300px]"
                title="XAND Price Chart"
                allow="clipboard-write"
              />
            </div>

            {/* Quick Links */}
            <div className="flex gap-2 pt-1">
              <a 
                href="https://jup.ag/swap/SOL-XAND" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-violet-500 hover:underline"
              >
                Buy on Jupiter →
              </a>
              <span className="text-muted-foreground">|</span>
              <a 
                href="https://birdeye.so/token/XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx?chain=solana" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-violet-500 hover:underline"
              >
                Full Chart on Birdeye →
              </a>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
