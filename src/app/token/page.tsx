"use client";

import { 
  Coins, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Droplets,
  DollarSign,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TokenAnalytics } from "@/components/dashboard/token-analytics";
import { StakingCalculator } from "@/components/dashboard/staking-calculator";
import { useTokenPrice } from "@/hooks/use-token-price";
import { cn } from "@/lib/utils";

export default function TokenPage() {
  const { data, isLoading, refetch, isFetching } = useTokenPrice();
  
  const tokenData = data?.success ? data.data : null;

  const formatPrice = (price: number) => {
    if (!price) return "$0.00";
    if (price < 0.0001) return `$${price.toExponential(2)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatLargeNumber = (num: number) => {
    if (!num) return "$0";
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600">
              <Coins className="h-6 w-6 text-white" />
            </div>
            Token Analytics
          </h1>
          <p className="text-muted-foreground">
            XAND token price, market data, and staking information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
            Refresh
          </Button>
          <a href="https://jup.ag/swap/SOL-XAND" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600">
              Trade on Jupiter
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>

      {/* Main Price Display */}
      <Card className="bg-gradient-to-br from-amber-500/10 via-background to-yellow-500/10 border-amber-500/20">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-600 shadow-lg">
                  <Coins className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">XAND</h2>
                  <p className="text-sm text-muted-foreground">Xandeum Token</p>
                </div>
              </div>
              <p className="text-5xl font-bold mt-4">
                {isLoading ? "..." : formatPrice(tokenData?.price || 0)}
              </p>
              {tokenData && (
                <div className="flex items-center gap-2 mt-2 justify-center lg:justify-start">
                  <Badge 
                    variant={tokenData.price_change_24h >= 0 ? "success" : "error"}
                    className="text-sm"
                  >
                    {tokenData.price_change_24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {tokenData.price_change_24h >= 0 ? "+" : ""}
                    {tokenData.price_change_24h.toFixed(2)}%
                  </Badge>
                  <span className="text-sm text-muted-foreground">24h change</span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <BarChart3 className="h-5 w-5 mx-auto mb-2 text-violet-500" />
                <p className="text-lg font-bold">{formatLargeNumber(tokenData?.market_cap || 0)}</p>
                <p className="text-xs text-muted-foreground">Market Cap</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <DollarSign className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
                <p className="text-lg font-bold">{formatLargeNumber(tokenData?.volume_24h || 0)}</p>
                <p className="text-xs text-muted-foreground">24h Volume</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <Droplets className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                <p className="text-lg font-bold">{formatLargeNumber(tokenData?.liquidity || 0)}</p>
                <p className="text-xs text-muted-foreground">Liquidity</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <Coins className="h-5 w-5 mx-auto mb-2 text-amber-500" />
                <p className="text-lg font-bold">{formatLargeNumber(tokenData?.fdv || 0)}</p>
                <p className="text-xs text-muted-foreground">FDV</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Price Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-500" />
            XAND/SOL Price Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border border-border/50 bg-black">
            <iframe
              src="https://dexscreener.com/solana/XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx?embed=1&theme=dark&trades=0"
              className="w-full h-[400px]"
              title="XAND Price Chart"
              allow="clipboard-write"
            />
          </div>
        </CardContent>
      </Card>

      {/* Token Analytics Component */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TokenAnalytics />
        
        {/* Token Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Token Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Token Name</span>
              <span className="font-medium">Xandeum</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Symbol</span>
              <span className="font-medium">XAND</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Network</span>
              <span className="font-medium">Solana</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Contract</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">XAND...3Hx</code>
            </div>
            <div className="pt-4 space-y-2">
              <a 
                href="https://birdeye.so/token/XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx?chain=solana" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full justify-between">
                  View on Birdeye
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <a 
                href="https://solscan.io/token/XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full justify-between">
                  View on Solscan
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staking Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Staking Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StakingCalculator />
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <a href="https://jup.ag/swap/SOL-XAND" target="_blank" rel="noopener noreferrer">
          <Card className="hover:border-violet-500/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <img src="https://jup.ag/favicon.ico" alt="Jupiter" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Jupiter Exchange</p>
                  <p className="text-xs text-muted-foreground">Swap tokens</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </a>
        
        <a href="https://raydium.io/swap/" target="_blank" rel="noopener noreferrer">
          <Card className="hover:border-blue-500/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <img src="https://raydium.io/favicon.ico" alt="Raydium" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Raydium</p>
                  <p className="text-xs text-muted-foreground">Liquidity pools</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </a>

        <a href="https://www.coingecko.com/" target="_blank" rel="noopener noreferrer">
          <Card className="hover:border-emerald-500/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <img src="https://www.coingecko.com/favicon.ico" alt="CoinGecko" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">CoinGecko</p>
                  <p className="text-xs text-muted-foreground">Market data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </a>

        <a href="https://dexscreener.com/" target="_blank" rel="noopener noreferrer">
          <Card className="hover:border-amber-500/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <img src="https://dexscreener.com/favicon.ico" alt="DEXScreener" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">DEXScreener</p>
                  <p className="text-xs text-muted-foreground">Charts & analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  );
}
