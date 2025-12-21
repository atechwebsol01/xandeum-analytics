"use client";

import { useQuery } from "@tanstack/react-query";
import type { PNodeWithScore, NetworkStats } from "@/types/pnode";

interface PNodesSuccessResponse {
  success: true;
  data: {
    nodes: PNodeWithScore[];
    stats: NetworkStats;
    timestamp: number;
    creditsCount: number;
    source?: "prpc" | "credits-only";
  };
}

interface PNodesErrorResponse {
  success: false;
  error: string;
}

type PNodesResponse = PNodesSuccessResponse | PNodesErrorResponse;

// Fetch via server-side API route to avoid CORS and mixed content issues
// The API route runs on the server where HTTP requests to pRPC endpoints work
async function fetchPNodes(): Promise<PNodesResponse> {
  try {
    console.log("[usePNodes] Fetching via server-side API route...");
    
    const response = await fetch("/api/pnodes", {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: data.error || "Failed to fetch pNodes",
      };
    }

    console.log(`[usePNodes] Success! ${data.data.nodes.length} nodes loaded`);
    
    return {
      success: true,
      data: {
        nodes: data.data.nodes,
        stats: data.data.stats,
        timestamp: data.data.timestamp,
        creditsCount: data.data.creditsCount,
        source: "prpc",
      },
    };
  } catch (error) {
    console.error("[usePNodes] Fetch failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function usePNodes() {
  return useQuery({
    queryKey: ["pnodes"],
    queryFn: fetchPNodes,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function usePNode(pubkey: string) {
  const { data, ...rest } = usePNodes();

  const node = data?.success ? data.data.nodes.find((n) => n.pubkey === pubkey) : undefined;

  return {
    ...rest,
    data: node,
  };
}

// Hook to get top performers by credits
export function useTopPerformers(limit: number = 10) {
  const { data, ...rest } = usePNodes();
  
  const topNodes = data?.success 
    ? [...data.data.nodes]
        .sort((a, b) => b.credits - a.credits)
        .slice(0, limit)
    : [];

  return {
    ...rest,
    data: topNodes,
  };
}

// Hook to get nodes by status
export function useNodesByStatus(status: "online" | "warning" | "offline") {
  const { data, ...rest } = usePNodes();
  
  const filteredNodes = data?.success 
    ? data.data.nodes.filter((n) => n.status === status)
    : [];

  return {
    ...rest,
    data: filteredNodes,
  };
}
