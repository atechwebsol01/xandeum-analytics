"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, ExternalLink, Loader2, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    Jupiter: {
      init: (config: JupiterConfig) => void;
      close: () => void;
      resume: () => void;
      _instance?: unknown;
    };
  }
}

interface JupiterConfig {
  displayMode: "integrated" | "modal";
  integratedTargetId?: string;
  endpoint: string;
  strictTokenList?: boolean;
  defaultExplorer?: "solscan" | "solana-explorer";
  formProps?: {
    fixedInputMint?: boolean;
    fixedOutputMint?: boolean;
    initialInputMint?: string;
    initialOutputMint?: string;
    initialAmount?: string;
    swapMode?: "ExactIn" | "ExactOut";
  };
  containerStyles?: {
    maxHeight?: string;
    minHeight?: string;
  };
}

export function JupiterSwap() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initAttemptedRef = useRef(false);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!containerRef.current) return;

    let isMounted = true;
    let checkJupiterInterval: NodeJS.Timeout | null = null;
    let loadTimeout: NodeJS.Timeout | null = null;

    const initJupiter = () => {
      if (!window.Jupiter || !isMounted || initAttemptedRef.current) return;
      if (!document.getElementById("jupiter-terminal")) return;

      initAttemptedRef.current = true;

      try {
        window.Jupiter.init({
          displayMode: "integrated",
          integratedTargetId: "jupiter-terminal",
          endpoint: process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://mainnet.helius-rpc.com/?api-key=908f61ba-2bc3-4475-a583-e5cac9d8dae8",
          strictTokenList: false,
          defaultExplorer: "solscan",
          formProps: {
            initialInputMint: "So11111111111111111111111111111111111111112",
            initialOutputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            swapMode: "ExactIn",
          },
        });
        setIsReady(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Jupiter init error:", err);
        initAttemptedRef.current = false;
        setError("Failed to initialize swap");
        setIsLoading(false);
      }
    };

    const loadJupiterTerminal = () => {
      // Ensure container is in DOM
      if (!document.getElementById("jupiter-terminal")) {
        setTimeout(loadJupiterTerminal, 100);
        return;
      }

      try {
        if (window.Jupiter) {
          initJupiter();
          return;
        }

        // Load CSS
        if (!document.querySelector('link[href*="terminal.jup.ag"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://terminal.jup.ag/main-v2.css";
          document.head.appendChild(link);
        }

        // Load script
        if (!scriptLoadedRef.current && !document.querySelector('script[src*="terminal.jup.ag"]')) {
          scriptLoadedRef.current = true;
          const script = document.createElement("script");
          script.src = "https://terminal.jup.ag/main-v2.js";
          script.async = true;
          script.onload = () => {
            checkJupiterInterval = setInterval(() => {
              if (window.Jupiter && isMounted) {
                if (checkJupiterInterval) clearInterval(checkJupiterInterval);
                setTimeout(initJupiter, 100);
              }
            }, 50);

            loadTimeout = setTimeout(() => {
              if (checkJupiterInterval) clearInterval(checkJupiterInterval);
              if (!window.Jupiter && isMounted) {
                setError("Failed to load Jupiter");
                setIsLoading(false);
              }
            }, 20000);
          };
          script.onerror = () => {
            if (isMounted) {
              setError("Failed to load Jupiter");
              setIsLoading(false);
            }
          };
          document.body.appendChild(script);
        } else {
          checkJupiterInterval = setInterval(() => {
            if (window.Jupiter && isMounted) {
              if (checkJupiterInterval) clearInterval(checkJupiterInterval);
              setTimeout(initJupiter, 100);
            }
          }, 50);

          loadTimeout = setTimeout(() => {
            if (checkJupiterInterval) clearInterval(checkJupiterInterval);
            if (!isReady && isMounted) {
              setError("Jupiter failed to initialize");
              setIsLoading(false);
            }
          }, 20000);
        }
      } catch (err) {
        console.error("Jupiter load error:", err);
        if (isMounted) {
          setError("Failed to load Jupiter");
          setIsLoading(false);
        }
      }
    };

    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      setTimeout(loadJupiterTerminal, 50);
    });

    return () => {
      isMounted = false;
      if (checkJupiterInterval) clearInterval(checkJupiterInterval);
      if (loadTimeout) clearTimeout(loadTimeout);
    };
  }, [isReady]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    initAttemptedRef.current = false;
    if (window.Jupiter && document.getElementById("jupiter-terminal")) {
      try {
        window.Jupiter.init({
          displayMode: "integrated",
          integratedTargetId: "jupiter-terminal",
          endpoint: process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://mainnet.helius-rpc.com/?api-key=908f61ba-2bc3-4475-a583-e5cac9d8dae8",
          strictTokenList: false,
          defaultExplorer: "solscan",
          formProps: {
            initialInputMint: "So11111111111111111111111111111111111111112",
            initialOutputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            swapMode: "ExactIn",
          },
        });
        setIsReady(true);
        setIsLoading(false);
      } catch {
        setError("Failed to initialize swap");
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/30">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <ArrowLeftRight className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Swap Tokens</h3>
              <p className="text-xs text-muted-foreground">Best rates on Solana</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <Button variant="ghost" size="sm" onClick={handleRetry} className="gap-1">
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs"
              onClick={() => window.open("https://jup.ag", "_blank")}
            >
              Powered by Jupiter
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="relative min-h-[500px]" ref={containerRef}>
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-3" />
              <p className="text-sm text-muted-foreground">Loading Jupiter Terminal...</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 p-6">
              <div className="text-center space-y-4 max-w-sm">
                <div className="p-4 rounded-full bg-red-500/10 w-fit mx-auto">
                  <ArrowLeftRight className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-destructive mb-1">Connection Issue</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="outline" onClick={handleRetry} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => window.open("https://jup.ag", "_blank")}
                    className="gap-2"
                  >
                    Open Jupiter.ag
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Jupiter Terminal Container */}
          <div 
            id="jupiter-terminal" 
            className="w-full"
            style={{ minHeight: "500px" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
