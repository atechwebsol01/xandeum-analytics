import type { PNode, PRPCResponse, GetPodsResponse } from "@/types/pnode";

// Default pRPC endpoints from the Xandeum network (port 6000)
// Can be overridden via NEXT_PUBLIC_PRPC_ENDPOINTS environment variable
// Updated list from Discord #devnet-developer-support (Dec 21, 2025)
// Note: These are PUBLIC nodes with is_public: true - pRPC runs on port 6000
const DEFAULT_PRPC_ENDPOINTS = [
  "http://192.190.136.28:6000",
  "http://173.212.207.32:6000",
  "http://152.53.236.91:6000",
  "http://216.234.134.5:6000",
  "http://161.97.185.116:6000",
  "http://152.53.155.15:6000",
  "http://173.249.3.118:6000",
  "http://45.151.122.60:6000",
  "http://173.212.220.65:6000",
  "http://154.38.169.212:6000",
  "http://84.21.171.129:6000",
  "http://207.244.255.1:6000",
];

// Get endpoints from environment or use defaults
const getEndpoints = (): string[] => {
  const envEndpoints = process.env.NEXT_PUBLIC_PRPC_ENDPOINTS;
  if (envEndpoints) {
    return envEndpoints.split(",").map((e) => e.trim()).filter(Boolean);
  }
  return DEFAULT_PRPC_ENDPOINTS;
};

const PRPC_ENDPOINTS = getEndpoints();

// Pod Credits API - official reputation system
const POD_CREDITS_API = process.env.NEXT_PUBLIC_POD_CREDITS_API || "https://podcredits.xandeum.network/api/pods-credits";

const CACHE_TTL = 30000; // 30 seconds
const REQUEST_TIMEOUT = 15000; // 15 seconds timeout

// Cache for pods and credits
let cachedPods: PNode[] | null = null;
let cachedCredits: Map<string, number> = new Map();
let lastFetchTime = 0;
let lastCreditsTime = 0;

async function callPRPC<T>(
  endpoint: string,
  method: string,
  params?: Record<string, unknown>
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    console.log(`[pRPC] Calling ${method} on ${endpoint}...`);
    
    const response = await fetch(`${endpoint}/rpc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "XandeumAnalytics/1.0",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method,
        params: params || {},
        id: 1,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[pRPC] HTTP error from ${endpoint}: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as PRPCResponse<T>;

    if ("error" in data && data.error) {
      const errorMsg = typeof data.error === 'object' && 'message' in data.error 
        ? (data.error as { message: string }).message 
        : String(data.error);
      console.error(`[pRPC] RPC error from ${endpoint}: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    console.log(`[pRPC] Success from ${endpoint}`);
    return data.result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error(`[pRPC] Timeout from ${endpoint}`);
        throw new Error(`Request timeout after ${REQUEST_TIMEOUT / 1000}s`);
      }
      console.error(`[pRPC] Error from ${endpoint}: ${error.message}`);
    }
    throw error;
  }
}

// Fetch Pod Credits from the official API
export async function fetchPodCredits(): Promise<Map<string, number>> {
  const now = Date.now();
  
  // Return cached credits if still valid
  if (cachedCredits.size > 0 && now - lastCreditsTime < CACHE_TTL) {
    return cachedCredits;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(POD_CREDITS_API, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === "success" && Array.isArray(data.pods_credits)) {
      const creditsMap = new Map<string, number>();
      for (const item of data.pods_credits) {
        creditsMap.set(item.pod_id, item.credits);
      }
      cachedCredits = creditsMap;
      lastCreditsTime = now;
      console.log(`Fetched ${creditsMap.size} pod credits`);
      return creditsMap;
    }

    throw new Error("Invalid pod credits response format");
  } catch (error) {
    console.warn("Failed to fetch pod credits:", error);
    return cachedCredits; // Return stale cache if available
  }
}

export async function fetchPods(): Promise<PNode[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedPods && now - lastFetchTime < CACHE_TTL) {
    console.log("[pRPC] Returning cached pods data");
    return cachedPods;
  }

  console.log(`[pRPC] Fetching fresh data from ${PRPC_ENDPOINTS.length} endpoints...`);

  // Try endpoints in parallel - first successful response wins
  const results = await Promise.allSettled(
    PRPC_ENDPOINTS.map(async (endpoint) => {
      const result = await callPRPC<GetPodsResponse>(endpoint, "get-pods-with-stats");
      const pods = Array.isArray(result) ? result : result.pods || [];
      if (pods.length === 0) {
        throw new Error("Empty response");
      }
      return { endpoint, pods };
    })
  );

  // Find first successful result
  for (const result of results) {
    if (result.status === "fulfilled" && result.value.pods.length > 0) {
      console.log(`[pRPC] Success! Got ${result.value.pods.length} pNodes from ${result.value.endpoint}`);
      cachedPods = result.value.pods;
      lastFetchTime = now;
      return result.value.pods;
    }
  }

  // Collect all errors for debugging
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason?.message || String(r.reason))
    .slice(0, 3); // Only show first 3 errors

  console.error(`[pRPC] All ${PRPC_ENDPOINTS.length} endpoints failed. Sample errors: ${errors.join("; ")}`);

  // If all endpoints fail but we have cached data, return it
  if (cachedPods) {
    console.warn("[pRPC] All endpoints failed, returning stale cache");
    return cachedPods;
  }

  // No data available
  throw new Error(`All pRPC endpoints unreachable. This may be due to network restrictions on the server. Sample errors: ${errors.join("; ")}`);
}

// Fetch pods with their credits combined
export async function fetchPodsWithCredits(): Promise<{ pods: PNode[]; credits: Map<string, number> }> {
  const [pods, credits] = await Promise.all([
    fetchPods(),
    fetchPodCredits(),
  ]);
  return { pods, credits };
}

export async function fetchPodByPubkey(pubkey: string): Promise<PNode | null> {
  const pods = await fetchPods();
  return pods.find((pod) => pod.pubkey === pubkey) || null;
}

export function clearCache(): void {
  cachedPods = null;
  cachedCredits = new Map();
  lastFetchTime = 0;
  lastCreditsTime = 0;
}

export function getCachedCredits(): Map<string, number> {
  return cachedCredits;
}

export { POD_CREDITS_API, PRPC_ENDPOINTS };
