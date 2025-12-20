import { NextResponse } from "next/server";
import { fetchPods } from "@/lib/prpc-client";
import { calculateXScore, getStatusColor } from "@/lib/utils";
import type { PNode, PNodeWithScore, NetworkStats } from "@/types/pnode";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function processPNodes(pods: PNode[]): PNodeWithScore[] {
  return pods.map((pod) => ({
    ...pod,
    xScore: calculateXScore(pod),
    status: getStatusColor(pod.last_seen_timestamp),
  }));
}

function calculateNetworkStats(nodes: PNodeWithScore[]): NetworkStats {
  const onlineNodes = nodes.filter((n) => n.status === "online").length;
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

  const versionDistribution = nodes.reduce((acc, node) => {
    const version = node.version || "Unknown";
    acc[version] = (acc[version] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalNodes: nodes.length,
    onlineNodes,
    totalStorageCommitted,
    totalStorageUsed,
    averageUptime,
    averageXScore,
    versionDistribution,
  };
}

export async function GET() {
  try {
    const pods = await fetchPods();

    if (!pods || pods.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No pNodes found in the network",
        },
        { status: 404 }
      );
    }

    const processedNodes = processPNodes(pods);
    const stats = calculateNetworkStats(processedNodes);

    return NextResponse.json({
      success: true,
      data: {
        nodes: processedNodes,
        stats,
        timestamp: Date.now(),
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
