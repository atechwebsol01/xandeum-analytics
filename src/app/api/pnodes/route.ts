import { NextResponse } from "next/server";
import { fetchPodsWithCredits } from "@/lib/prpc-client";
import { processPNodes, calculateNetworkStats } from "@/lib/pnode-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    // API error handling
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
