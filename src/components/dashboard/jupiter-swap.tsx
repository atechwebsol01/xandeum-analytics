"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, ExternalLink, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Jupiter: {
      init: (config: JupiterConfig) => void;
      close: () => void;
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Callback ref to know when DOM element is mounted
  const setTerminalRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    // Only run on client and when DOM is ready
    if (typeof window === "undefined" || !isReady) return;

    let isMounted = true;
    let checkJupiterInterval: NodeJS.Timeout | null = null;
    let loadTimeout: NodeJS.Timeout | null = null;

    const initJupiter = () => {
      if (!window.Jupiter || isInitialized || !isMounted) return;

      // Double-check the element exists with retries
      const element = document.getElementById("jupiter-terminal");
      if (!element) {
        console.warn("Jupiter terminal element not found, skipping init");
        return;
      }

      try {
        window.Jupiter.init({
          displayMode: "integrated",
          integratedTargetId: "jupiter-terminal",
          endpoint: process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com",
          strictTokenList: false,
          defaultExplorer: "solscan",
          formProps: {
            initialInputMint: "So11111111111111111111111111111111111111112", // SOL
            initialOutputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
            swapMode: "ExactIn",
          },
          containerStyles: {
            maxHeight: "600px",
            minHeight: "400px",
          },
        });
        setIsInitialized(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Jupiter init error:", err);
        setError("Failed to initialize Jupiter swap");
        setIsLoading(false);
      }
    };

    const loadJupiterTerminal = () => {
      // Verify the DOM element exists before proceeding
      const targetElement = document.getElementById("jupiter-terminal");
      if (!targetElement) {
        console.warn("Jupiter terminal target element not ready");
        return;
      }

      try {
        // Check if already loaded
        if (window.Jupiter) {
          initJupiter();
          return;
        }

        // Load Jupiter Terminal CSS first
        if (!document.querySelector('link[href*="terminal.jup.ag"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://terminal.jup.ag/main-v2.css";
          document.head.appendChild(link);
        }

        // Load Jupiter Terminal script
        if (!document.querySelector('script[src*="terminal.jup.ag"]')) {
          const script = document.createElement("script");
          script.src = "https://terminal.jup.ag/main-v2.js";
          script.async = true;
          script.onload = () => {
            // Wait for Jupiter to be available
            checkJupiterInterval = setInterval(() => {
              if (window.Jupiter && isMounted) {
                if (checkJupiterInterval) clearInterval(checkJupiterInterval);
                // Small delay to ensure everything is ready
                setTimeout(initJupiter, 150);
              }
            }, 100);

            // Timeout after 10 seconds
            loadTimeout = setTimeout(() => {
              if (checkJupiterInterval) clearInterval(checkJupiterInterval);
              if (!window.Jupiter && isMounted) {
                setError("Failed to load Jupiter Terminal");
                setIsLoading(false);
              }
            }, 10000);
          };
          script.onerror = () => {
            if (isMounted) {
              setError("Failed to load Jupiter Terminal script");
              setIsLoading(false);
            }
          };
          document.body.appendChild(script);
        } else if (window.Jupiter) {
          initJupiter();
        }
      } catch (err) {
        console.error("Jupiter load error:", err);
        if (isMounted) {
          setError("Failed to initialize Jupiter Terminal");
          setIsLoading(false);
        }
      }
    };

    // Use requestAnimationFrame + timeout to ensure DOM is painted
    const rafId = requestAnimationFrame(() => {
      setTimeout(loadJupiterTerminal, 100);
    });

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
      if (checkJupiterInterval) clearInterval(checkJupiterInterval);
      if (loadTimeout) clearTimeout(loadTimeout);
    };
  }, [isReady, isInitialized]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Token Swap
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => window.open("https://jup.ag", "_blank")}
          >
            <span className="text-xs">Powered by Jupiter</span>
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading Jupiter Terminal...</span>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.open("https://jup.ag", "_blank")}
            >
              Open Jupiter.ag
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        <div
          id="jupiter-terminal"
          ref={setTerminalRef}
          className={isLoading || error ? "hidden" : ""}
          style={{ minHeight: "400px" }}
        />
      </CardContent>
    </Card>
  );
}
