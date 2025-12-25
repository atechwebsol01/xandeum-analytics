"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, ExternalLink, Loader2 } from "lucide-react";

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

// XAND Token mint address (official)
const XAND_MINT = "XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx";

export function JupiterSwap() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [useIframe] = useState(true); // Default to iframe - more reliable
  const containerRef = useRef<HTMLDivElement>(null);
  const initAttemptedRef = useRef(false);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!containerRef.current) return;
    if (useIframe) return; // Don't load terminal when using iframe

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
      } catch {
        initAttemptedRef.current = false;
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
                setIsLoading(false);
              }
            }, 20000);
          };
          script.onerror = () => {
            if (isMounted) {
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
              setIsLoading(false);
            }
          }, 20000);
        }
      } catch {
        if (isMounted) {
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
  }, [isReady, useIframe]);

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
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            onClick={() => window.open(`https://jup.ag/swap/SOL-${XAND_MINT}`, "_blank")}
          >
            Open in Jupiter
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>

        {/* Content */}
        <div className="relative min-h-[500px]" ref={containerRef}>
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-3" />
              <p className="text-sm text-muted-foreground">Loading Jupiter Terminal...</p>
            </div>
          )}
          


          {/* Jupiter Iframe */}
          {useIframe && (
            <div className="w-full">
              <iframe
                src={`https://jup.ag/swap/SOL-XAND?inputMint=So11111111111111111111111111111111111111112&outputMint=${XAND_MINT}`}
                className="w-full border-0 rounded-lg"
                style={{ height: "700px" }}
                title="Jupiter Swap"
                allow="clipboard-write; clipboard-read"
              />
            </div>
          )}

          {/* Jupiter Terminal Container */}
          {!useIframe && (
            <div 
              id="jupiter-terminal" 
              className="w-full"
              style={{ minHeight: "500px" }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
