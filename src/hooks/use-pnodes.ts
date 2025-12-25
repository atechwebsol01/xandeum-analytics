"use client";

import { useQuery } from "@tanstack/react-query";
import type { PNode, PNodeWithScore, NetworkStats } from "@/types/pnode";
import { processPNodes, calculateNetworkStats } from "@/lib/pnode-utils";

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

interface PRPCResponse<T> {
  jsonrpc: string;
  id: number;
  result: T;
  error?: { message: string };
}

interface GetPodsResponse {
  pods?: PNode[];
}

interface PodCreditsResponse {
  status: string;
  pods_credits: Array<{ pod_id: string; credits: number }>;
}

// Fetch pods via Vercel rewrite proxy (bypasses CORS and mixed content)
async function fetchPodsViaProxy(): Promise<PNode[]> {
  // Fetching pods via proxy
  
  const response = await fetch("/proxy/prpc/rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "get-pods-with-stats",
      params: {},
      id: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`pRPC proxy failed: ${response.status}`);
  }

  const data = await response.json() as PRPCResponse<GetPodsResponse>;
  
  if (data.error) {
    throw new Error(data.error.message || "pRPC error");
  }

  const pods = Array.isArray(data.result) ? data.result : data.result?.pods || [];

  return pods;
}

// Fetch credits via Vercel rewrite proxy (bypasses CORS)
async function fetchCreditsViaProxy(): Promise<Map<string, number>> {
  // Fetching credits via proxy
  
  try {
    const response = await fetch("/proxy/credits", {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Credits proxy failed: ${response.status}`);
    }

    const data = await response.json() as PodCreditsResponse;
    
    if (data.status === "success" && Array.isArray(data.pods_credits)) {
      const creditsMap = new Map<string, number>();
      for (const item of data.pods_credits) {
        creditsMap.set(item.pod_id, item.credits);
      }

      return creditsMap;
    }

    return new Map();
  } catch {
    return new Map();
  }
}

// Fetch all data via proxy endpoints
async function fetchPNodes(): Promise<PNodesResponse> {
  try {

    
    const [pods, credits] = await Promise.all([
      fetchPodsViaProxy(),
      fetchCreditsViaProxy(),
    ]);
    
    if (pods.length === 0) {
      return {
        success: false,
        error: "No pNodes found",
      };
    }

    const processedNodes = processPNodes(pods, credits);
    const stats = calculateNetworkStats(processedNodes);


    
    return {
      success: true,
      data: {
        nodes: processedNodes,
        stats,
        timestamp: Date.now(),
        creditsCount: credits.size,
        source: "prpc",
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
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
