import { Metadata } from "next";
import { JupiterSwap } from "@/components/dashboard/jupiter-swap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Info, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Swap Tokens | Xandeum Analytics",
  description: "Swap tokens on Solana using Jupiter aggregator - best rates guaranteed",
};

export default function SwapPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Token Swap</h1>
        <p className="text-muted-foreground">
          Swap any token on Solana with the best rates powered by Jupiter aggregator
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Swap Terminal - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <JupiterSwap />
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
          {/* How it works */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-blue-500" />
                How it Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Connect your Solana wallet</p>
              <p>2. Select tokens to swap</p>
              <p>3. Enter amount and review rate</p>
              <p>4. Confirm transaction in wallet</p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-yellow-500" />
                Jupiter Features
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Best price across all DEXes
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Low slippage execution
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Route optimization
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                MEV protection
              </p>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-yellow-600 dark:text-yellow-500">
                <AlertCircle className="h-4 w-4" />
                Important Note
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Always verify token addresses before swapping. This swap interface
                connects directly to Jupiter aggregator. Xandeum Analytics does not
                hold or control your funds.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
