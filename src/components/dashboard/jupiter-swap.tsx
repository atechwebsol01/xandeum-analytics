"use client";

import { useEffect, useState, useRef } from "react";
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
  const terminalRef = useRef<HTMLDivElement>(null);
  const initAttemptedRef = useRef(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    let isMounted = true;
    let checkJupiterInterval: NodeJS.Timeout | null = null;
    let loadTimeout: NodeJS.Timeout | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const initJupiter = () => {
      if (!window.Jupiter || isInitialized || !isMounted || initAttemptedRef.current) return;

      // Verify element exists
      const element = terminalRef.current || document.getElementById("jupiter-terminal");
      if (!element) {
        // Retry after a short delay
        retryTimeout = setTimeout(initJupiter, 200);
        return;
      }

      initAttemptedRef.current = true;

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
        initAttemptedRef.current = false;
        setError("Failed to initialize Jupiter swap");
        setIsLoading(false);
      }
    };

    const loadJupiterTerminal = () => {
      // Wait for DOM element to be ready
      const targetElement = terminalRef.current || document.getElementById("jupiter-terminal");
      if (!targetElement) {
        // Retry after a short delay - element should be mounted soon
        retryTimeout = setTimeout(loadJupiterTerminal, 100);
        return;
      }

      try {
        // Check if Jupiter is already loaded and initialized
        if (window.Jupiter) {
          if (!isInitialized && !initAttemptedRef.current) {
            initJupiter();
          }
          return;
        }

        // Load Jupiter Terminal CSS first
        if (!document.querySelector('link[href*="terminal.jup.ag"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://terminal.jup.ag/main-v2.css";
          document.head.appendChild(link);
        }

        // Load Jupiter Terminal script only if not already loaded
        if (!document.querySelector('script[src*="terminal.jup.ag"]')) {
          const script = document.createElement("script");
          script.src = "https://terminal.jup.ag/main-v2.js";
          script.async = true;
          script.onload = () => {
            // Wait for Jupiter to be available on window
            checkJupiterInterval = setInterval(() => {
              if (window.Jupiter && isMounted) {
                if (checkJupiterInterval) clearInterval(checkJupiterInterval);
                // Delay to ensure DOM is fully ready
                setTimeout(initJupiter, 300);
              }
            }, 100);

            // Timeout after 15 seconds
            loadTimeout = setTimeout(() => {
              if (checkJupiterInterval) clearInterval(checkJupiterInterval);
              if (!window.Jupiter && isMounted) {
                setError("Failed to load Jupiter Terminal");
                setIsLoading(false);
              }
            }, 15000);
          };
          script.onerror = () => {
            if (isMounted) {
              setError("Failed to load Jupiter Terminal script");
              setIsLoading(false);
            }
          };
          document.body.appendChild(script);
        } else {
          // Script exists but Jupiter might not be ready yet
          checkJupiterInterval = setInterval(() => {
            if (window.Jupiter && isMounted) {
              if (checkJupiterInterval) clearInterval(checkJupiterInterval);
              setTimeout(initJupiter, 300);
            }
          }, 100);

          loadTimeout = setTimeout(() => {
            if (checkJupiterInterval) clearInterval(checkJupiterInterval);
            if (!isInitialized && isMounted) {
              setError("Jupiter Terminal failed to initialize");
              setIsLoading(false);
            }
          }, 15000);
        }
      } catch (err) {
        console.error("Jupiter load error:", err);
        if (isMounted) {
          setError("Failed to initialize Jupiter Terminal");
          setIsLoading(false);
        }
      }
    };

    // Use multiple frames to ensure DOM is fully painted and stable
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(loadJupiterTerminal, 200);
      });
    });

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
      if (checkJupiterInterval) clearInterval(checkJupiterInterval);
      if (loadTimeout) clearTimeout(loadTimeout);
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [isInitialized]);

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
          ref={terminalRef}
          className={isLoading || error ? "hidden" : ""}
          style={{ minHeight: "400px" }}
        />
      </CardContent>
    </Card>
  );
}
