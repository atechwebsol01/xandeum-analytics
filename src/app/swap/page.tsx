import { Metadata } from "next";
import { JupiterSwap } from "@/components/dashboard/jupiter-swap";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeftRight, CheckCircle2, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Swap Tokens | Xandeum Analytics",
  description: "Swap tokens on Solana using Jupiter aggregator - best rates guaranteed",
};

export default function SwapPage() {
  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pb-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 mb-2">
          <ArrowLeftRight className="h-8 w-8 text-violet-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Token Swap</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
          Swap any token on Solana with the best rates powered by Jupiter
        </p>
      </div>

      {/* Features Bar - Mobile */}
      <div className="flex flex-wrap justify-center gap-3 sm:hidden">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          Best Rates
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Shield className="h-3 w-3 text-blue-500" />
          MEV Protected
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Zap className="h-3 w-3 text-yellow-500" />
          Fast Execution
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Swap Terminal - Full width on mobile, 2 cols on desktop */}
        <div className="lg:col-span-2 order-1">
          <JupiterSwap />
        </div>

        {/* Info Cards - Stack on mobile, sidebar on desktop */}
        <div className="space-y-4 order-2">
          {/* Features Card - Hidden on mobile (shown as bar above) */}
          <Card className="hidden sm:block bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border-violet-500/20">
            <CardContent className="pt-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Why Jupiter?
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-muted-foreground">Best price across 20+ DEXes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-muted-foreground">Smart route optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-muted-foreground">Low slippage execution</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-muted-foreground">MEV protection built-in</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="bg-muted/30">
            <CardContent className="pt-5">
              <h3 className="font-semibold mb-3">How to Swap</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-500 text-xs font-bold">1</span>
                  <span className="text-muted-foreground">Connect your Solana wallet</span>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-500 text-xs font-bold">2</span>
                  <span className="text-muted-foreground">Select tokens and enter amount</span>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-500 text-xs font-bold">3</span>
                  <span className="text-muted-foreground">Review rate and confirm swap</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="pt-5">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-600 dark:text-yellow-500 mb-1">Important</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Always verify token addresses. This interface connects directly to Jupiter. 
                    Xandeum Analytics does not hold or control your funds.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
