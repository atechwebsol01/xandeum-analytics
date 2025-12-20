"use client";

import { useQuery } from "@tanstack/react-query";
import type { PNodeWithScore, NetworkStats } from "@/types/pnode";

interface PNodesSuccessResponse {
  success: true;
  data: {
    nodes: PNodeWithScore[];
    stats: NetworkStats;
    timestamp: number;
  };
}

interface PNodesErrorResponse {
  success: false;
  error: string;
}

type PNodesResponse = PNodesSuccessResponse | PNodesErrorResponse;

async function fetchPNodes(): Promise<PNodesResponse> {
  const response = await fetch("/api/pnodes", {
    cache: "no-store",
  });

  const data = await response.json();
  return data;
}

export function usePNodes() {
  return useQuery({
    queryKey: ["pnodes"],
    queryFn: fetchPNodes,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
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
