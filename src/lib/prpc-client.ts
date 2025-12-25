import type { PNode, PRPCResponse, GetPodsResponse } from "@/types/pnode";

// pRPC endpoints - use proxy in production to avoid CORS/mixed content
// The proxy is configured in next.config.ts rewrites
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

// Use proxy URLs that go through Vercel's rewrite (works on both server and client)
const DEFAULT_PRPC_ENDPOINTS = [
  `${BASE_URL}/proxy/prpc`,
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

// Pod Credits API - use proxy to avoid CORS
const POD_CREDITS_API = `${BASE_URL}/proxy/credits`;

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
    // Production: logging disabled
    
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
      // Production: logging disabled
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as PRPCResponse<T>;

    if ("error" in data && data.error) {
      const errorMsg = typeof data.error === 'object' && 'message' in data.error 
        ? (data.error as { message: string }).message 
        : String(data.error);
      // Production: logging disabled
      throw new Error(errorMsg);
    }

    // Production: logging disabled
    return data.result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        // Production: logging disabled
        throw new Error(`Request timeout after ${REQUEST_TIMEOUT / 1000}s`);
      }
      // Production: logging disabled
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
      // Production: logging disabled
      return creditsMap;
    }

    throw new Error("Invalid pod credits response format");
  } catch {
    return cachedCredits; // Return stale cache if available
  }
}

export async function fetchPods(): Promise<PNode[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedPods && now - lastFetchTime < CACHE_TTL) {
    // Production: logging disabled
    return cachedPods;
  }

  // Production: logging disabled

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
      // Production: logging disabled
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

  // All endpoints failed - throw with error details

  // If all endpoints fail but we have cached data, return it
  if (cachedPods) {
    // Production: logging disabled
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
