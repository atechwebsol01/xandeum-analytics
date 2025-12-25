// Client-side pRPC fetching - runs in browser, not on server
// This works because browsers can make HTTP requests to raw IPs, but Vercel servers cannot

import type { PNode, GetPodsResponse, PodCreditsResponse } from "@/types/pnode";

// Public pRPC endpoints (port 6000) - fresh list from Discord Dec 21, 2025
// Note: Client-side calls will fail on HTTPS due to mixed content - use server API route instead
const PRPC_ENDPOINTS = [
  "http://192.190.136.28:6000",
  "http://173.212.207.32:6000",
  "http://152.53.236.91:6000",
  "http://216.234.134.5:6000",
  "http://161.97.185.116:6000",
  "http://152.53.155.15:6000",
  "http://173.249.3.118:6000",
  "http://45.151.122.60:6000",
];

// Pod Credits API (HTTPS - always works)
const POD_CREDITS_API = "https://podcredits.xandeum.network/api/pods-credits";

const REQUEST_TIMEOUT = 10000; // 10 seconds

interface PRPCResponse<T> {
  jsonrpc: string;
  id: number;
  result: T;
  error?: { message: string };
}

async function callPRPC<T>(endpoint: string, method: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${endpoint}/rpc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method,
        params: {},
        id: 1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as PRPCResponse<T>;

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Fetch pods from pRPC (client-side)
export async function fetchPodsClientSide(): Promise<PNode[]> {
  const errors: string[] = [];

  // Try endpoints in parallel, return first success
  const results = await Promise.allSettled(
    PRPC_ENDPOINTS.map(async (endpoint) => {
      const result = await callPRPC<GetPodsResponse>(endpoint, "get-pods-with-stats");
      const pods = Array.isArray(result) ? result : result.pods || [];
      if (pods.length === 0) throw new Error("Empty");
      return { endpoint, pods };
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.pods.length > 0) {
      // Production: logging disabled
      return result.value.pods;
    }
  }

  // Collect errors
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      errors.push(`${PRPC_ENDPOINTS[i]}: ${r.reason?.message || "Failed"}`);
    }
  });

  throw new Error(`All pRPC endpoints failed: ${errors.slice(0, 3).join("; ")}`);
}

// Fetch pod credits (always works - HTTPS)
export async function fetchPodCreditsClientSide(): Promise<Map<string, number>> {
  try {
    const response = await fetch(POD_CREDITS_API, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: PodCreditsResponse = await response.json();

    if (data.status === "success" && Array.isArray(data.pods_credits)) {
      const creditsMap = new Map<string, number>();
      for (const item of data.pods_credits) {
        creditsMap.set(item.pod_id, item.credits);
      }
      // Production: logging disabled
      return creditsMap;
    }

    throw new Error("Invalid response format");
  } catch {
    return new Map();
  }
}

// Combined fetch - try pRPC first, merge with credits
export async function fetchAllDataClientSide(): Promise<{
  pods: PNode[];
  credits: Map<string, number>;
  source: "prpc" | "credits-only";
}> {
  // Always fetch credits (reliable)
  const creditsPromise = fetchPodCreditsClientSide();

  // Try pRPC 
  try {
    const [pods, credits] = await Promise.all([
      fetchPodsClientSide(),
      creditsPromise,
    ]);
    return { pods, credits, source: "prpc" };
  } catch {
    // Fall back to credits-only
    const credits = await creditsPromise;
    
    // Create minimal pod data from credits
    const pods: PNode[] = Array.from(credits.entries()).map(([pubkey]) => ({
      pubkey,
      address: "unknown:0",
      version: "unknown",
      uptime: 0,
      storage_committed: 0,
      storage_used: 0,
      storage_usage_percent: 0,
      is_public: false,
      rpc_port: 6000,
      last_seen_timestamp: Date.now() / 1000,
    }));

    return { pods, credits, source: "credits-only" };
  }
}
