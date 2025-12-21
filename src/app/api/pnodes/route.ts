import { NextResponse } from "next/server";
import { fetchPodsWithCredits } from "@/lib/prpc-client";
import { calculateXScore, getStatusColor } from "@/lib/utils";
import type { PNode, PNodeWithScore, NetworkStats } from "@/types/pnode";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseAddress(address: string): { ip: string; port: number } {
  const parts = address.split(":");
  return {
    ip: parts[0] || "",
    port: parseInt(parts[1] || "9001", 10),
  };
}

function processPNodes(pods: PNode[], credits: Map<string, number>): PNodeWithScore[] {
  return pods
    .filter((pod) => pod && pod.pubkey) // Filter out invalid pods
    .map((pod) => {
      const { ip, port } = parseAddress(pod.address || "");
      const podCredits = credits.get(pod.pubkey) || 0;
      
      return {
        ...pod,
        pubkey: pod.pubkey || "Unknown",
        address: pod.address || "unknown:0",
        version: pod.version || "unknown",
        uptime: pod.uptime || 0,
        storage_committed: pod.storage_committed || 0,
        storage_used: pod.storage_used || 0,
        storage_usage_percent: pod.storage_usage_percent || 0,
        is_public: pod.is_public ?? false,
        rpc_port: pod.rpc_port || 6000,
        last_seen_timestamp: pod.last_seen_timestamp || Math.floor(Date.now() / 1000),
        xScore: calculateXScore(pod, podCredits),
        status: getStatusColor(pod.last_seen_timestamp || 0),
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
  
  const totalStorageCommitted = nodes.reduce(
    (sum, n) => sum + n.storage_committed,
    0
  );
  const totalStorageUsed = nodes.reduce((sum, n) => sum + n.storage_used, 0);
  const averageUptime =
    nodes.length > 0
      ? nodes.reduce((sum, n) => sum + n.uptime, 0) / nodes.length
      : 0;
  const averageXScore =
    nodes.length > 0
      ? nodes.reduce((sum, n) => sum + n.xScore, 0) / nodes.length
      : 0;
  
  const totalCredits = nodes.reduce((sum, n) => sum + n.credits, 0);
  const averageCredits = nodes.length > 0 ? totalCredits / nodes.length : 0;

  const versionDistribution = nodes.reduce((acc, node) => {
    const version = node.version || "Unknown";
    acc[version] = (acc[version] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Country distribution will be populated when geo data is available
  const countryDistribution: Record<string, number> = {};

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
    countryDistribution,
  };
}

export async function GET() {
  try {
    const { pods, credits } = await fetchPodsWithCredits();

    if (!pods || pods.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No pNodes found in the network",
        },
        { status: 404 }
      );
    }

    const processedNodes = processPNodes(pods, credits);
    const stats = calculateNetworkStats(processedNodes);

    return NextResponse.json({
      success: true,
      data: {
        nodes: processedNodes,
        stats,
        timestamp: Date.now(),
        creditsCount: credits.size,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch pNodes: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
