import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { fetchPodsWithCredits } from "@/lib/prpc-client";

// This API creates a network snapshot for historical data
// Should be called periodically (e.g., every 5 minutes via cron)

export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (simple token check)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20);
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      // Allow without auth for development
      // Snapshot logging
    }

    // Fetch current network data using the same method as /api/pnodes
    const { pods, credits } = await fetchPodsWithCredits();

    if (pods.length === 0) {
      return NextResponse.json(
        { error: "No pods data available" },
        { status: 500 }
      );
    }

    // Calculate network stats
    const now = Math.floor(Date.now() / 1000);
    const FIVE_MINUTES = 5 * 60;
    const THIRTY_MINUTES = 30 * 60;

    let onlineCount = 0;
    let warningCount = 0;
    let offlineCount = 0;
    let totalStorageCommitted = 0;
    let totalStorageUsed = 0;
    let totalCredits = 0;
    let totalXScore = 0;
    const versionDistribution: Record<string, number> = {};

    const nodeSnapshots = pods.map((pod) => {
      const timeSinceLastSeen = now - pod.last_seen_timestamp;
      let status: "online" | "warning" | "offline";
      
      if (timeSinceLastSeen < FIVE_MINUTES) {
        status = "online";
        onlineCount++;
      } else if (timeSinceLastSeen < THIRTY_MINUTES) {
        status = "warning";
        warningCount++;
      } else {
        status = "offline";
        offlineCount++;
      }

      const nodeCredits = credits.get(pod.pubkey) || 0;
      
      // Calculate X-Score (simplified)
      let xScore = 0;
      xScore += Math.min(35, nodeCredits / 1000 * 35);
      xScore += Math.min(25, pod.uptime / 86400 * 5);
      xScore += status === "online" ? 25 : status === "warning" ? 15 : 0;
      xScore += Math.min(10, pod.storage_committed / 1e12 * 10);
      xScore += pod.is_public ? 5 : 0;

      totalStorageCommitted += pod.storage_committed;
      totalStorageUsed += pod.storage_used;
      totalCredits += nodeCredits;
      totalXScore += xScore;

      versionDistribution[pod.version] = (versionDistribution[pod.version] || 0) + 1;

      return {
        pubkey: pod.pubkey,
        status,
        credits: nodeCredits,
        xscore: Math.round(xScore),
        uptime: pod.uptime,
        storage_committed: pod.storage_committed,
        storage_used: pod.storage_used,
        version: pod.version,
        ip: pod.address.split(":")[0],
      };
    });

    // Create Supabase client with service role
    const supabase = createServerSupabaseClient();

    // Insert network snapshot
    const { error: networkError } = await supabase
      .from("network_snapshots")
      .insert({
        total_nodes: pods.length,
        online_nodes: onlineCount,
        offline_nodes: offlineCount,
        warning_nodes: warningCount,
        total_storage_committed: totalStorageCommitted,
        total_storage_used: totalStorageUsed,
        average_credits: pods.length > 0 ? totalCredits / pods.length : 0,
        total_credits: totalCredits,
        average_xscore: pods.length > 0 ? totalXScore / pods.length : 0,
        version_distribution: versionDistribution,
      });

    if (networkError) {
      // Snapshot logging
      throw networkError;
    }

    // Insert node snapshots (batch insert)
    // Only insert a sample to avoid excessive data
    const sampleSize = Math.min(50, nodeSnapshots.length);
    const sampledNodes = nodeSnapshots
      .sort(() => Math.random() - 0.5)
      .slice(0, sampleSize);

    const { error: nodesError } = await supabase
      .from("node_snapshots")
      .insert(sampledNodes);

    if (nodesError) {
      // Snapshot logging
      // Don't throw, network snapshot was successful
    }

    // Update activity heatmap
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();

    for (const node of nodeSnapshots.filter(n => n.status === "online").slice(0, 20)) {
      const { error: heatmapError } = await supabase
        .from("activity_heatmap")
        .upsert(
          {
            pubkey: node.pubkey,
            hour: currentHour,
            day_of_week: currentDay,
            activity_count: 1,
            average_status: 1.0,
          },
          {
            onConflict: "pubkey,hour,day_of_week",
          }
        );

      if (heatmapError) {
        // Snapshot logging
      }
    }

    return NextResponse.json({
      success: true,
      snapshot: {
        totalNodes: pods.length,
        onlineNodes: onlineCount,
        warningNodes: warningCount,
        offlineNodes: offlineCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create snapshot" },
      { status: 500 }
    );
  }
}

// GET returns latest snapshots for the timeline
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data, error } = await supabase
      .from("network_snapshots")
      .select("*")
      .gte("created_at", twentyFourHoursAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch snapshots" },
      { status: 500 }
    );
  }
}
