"use client";

import { useQuery } from "@tanstack/react-query";
import type { PNode, PNodeWithScore, NetworkStats } from "@/types/pnode";
import { calculateXScore, getStatusColor } from "@/lib/utils";

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

function parseAddress(address: string): { ip: string; port: number } {
  const parts = address.split(":");
  return {
    ip: parts[0] || "",
    port: parseInt(parts[1] || "9001", 10),
  };
}

function processPNodes(pods: PNode[], credits: Map<string, number>): PNodeWithScore[] {
  return pods.map((pod) => {
    const { ip, port } = parseAddress(pod.address);
    const podCredits = credits.get(pod.pubkey) || 0;
    
    return {
      ...pod,
      xScore: calculateXScore(pod, podCredits),
      status: getStatusColor(pod.last_seen_timestamp),
      credits: podCredits,
      ip,
      port,
    };
  });
}

function calculateNetworkStats(nodes: PNodeWithScore[]): NetworkStats {
  const onlineNodes = nodes.filter((n) => n.status === "online").length;
  const warningNodes = nodes.filter((n) => n.status === "warning").length;
  const offlineNodes = nodes.filter((n) => n.status === "offline").length;
  const publicNodes = nodes.filter((n) => n.is_public).length;
  const privateNodes = nodes.filter((n) => !n.is_public).length;
  
  const totalStorageCommitted = nodes.reduce((sum, n) => sum + n.storage_committed, 0);
  const totalStorageUsed = nodes.reduce((sum, n) => sum + n.storage_used, 0);
  const averageUptime = nodes.length > 0
    ? nodes.reduce((sum, n) => sum + n.uptime, 0) / nodes.length
    : 0;
  const averageXScore = nodes.length > 0
    ? nodes.reduce((sum, n) => sum + n.xScore, 0) / nodes.length
    : 0;
  
  const totalCredits = nodes.reduce((sum, n) => sum + n.credits, 0);
  const averageCredits = nodes.length > 0 ? totalCredits / nodes.length : 0;

  const versionDistribution = nodes.reduce((acc, node) => {
    const version = node.version || "Unknown";
    acc[version] = (acc[version] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalNodes: nodes.length,
    onlineNodes,
    warningNodes,
    offlineNodes,
    publicNodes,
    privateNodes,
    totalStorageCommitted,
    totalStorageUsed,
    averageUptime,
    averageXScore,
    totalCredits,
    averageCredits,
    versionDistribution,
    countryDistribution: {},
  };
}

// Fetch pods via Vercel rewrite proxy (bypasses CORS and mixed content)
async function fetchPodsViaProxy(): Promise<PNode[]> {
  console.log("[usePNodes] Fetching pods via proxy...");
  
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
  console.log(`[usePNodes] Got ${pods.length} pods from proxy`);
  return pods;
}

// Fetch credits via Vercel rewrite proxy (bypasses CORS)
async function fetchCreditsViaProxy(): Promise<Map<string, number>> {
  console.log("[usePNodes] Fetching credits via proxy...");
  
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
      console.log(`[usePNodes] Got ${creditsMap.size} credits from proxy`);
      return creditsMap;
    }

    return new Map();
  } catch (error) {
    console.warn("[usePNodes] Credits fetch failed:", error);
    return new Map();
  }
}

// Fetch all data via proxy endpoints
async function fetchPNodes(): Promise<PNodesResponse> {
  try {
    console.log("[usePNodes] Starting fetch via Vercel proxy...");
    
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

    console.log(`[usePNodes] Success! ${processedNodes.length} nodes loaded`);
    
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
