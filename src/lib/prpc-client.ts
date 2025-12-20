import type { PNode, PRPCResponse, GetPodsResponse } from "@/types/pnode";

// Real Xandeum pRPC endpoints
// Note: These endpoints may not be publicly accessible from all networks.
// The pRPC is designed for pNode operators to query their own nodes.
const PRPC_ENDPOINTS = [
  "https://prpc.xandeum.network",
  "https://rpc.xandeum.network", 
  "http://109.199.96.218:6000",
];

const CACHE_TTL = 30000; // 30 seconds
let cachedPods: PNode[] | null = null;
let lastFetchTime = 0;

async function callPRPC<T>(
  endpoint: string,
  method: string,
  params?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${endpoint}/rpc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params: params || {},
      id: 1,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as PRPCResponse<T>;
  
  if ("error" in data) {
    throw new Error((data as unknown as { error: { message: string } }).error.message);
  }

  return data.result;
}

export async function fetchPods(): Promise<PNode[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedPods && now - lastFetchTime < CACHE_TTL) {
    return cachedPods;
  }

  const errors: string[] = [];

  // Try each endpoint until one works
  for (const endpoint of PRPC_ENDPOINTS) {
    try {
      console.log(`Fetching pNodes from ${endpoint}...`);
      const result = await callPRPC<PNode[]>(endpoint, "get-pods-with-stats");
      
      // Handle both array and object responses
      const pods = Array.isArray(result) ? result : (result as unknown as GetPodsResponse).pods || [];
      
      console.log(`Successfully fetched ${pods.length} pNodes from ${endpoint}`);
      cachedPods = pods;
      lastFetchTime = now;
      return pods;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to fetch from ${endpoint}:`, errorMsg);
      errors.push(`${endpoint}: ${errorMsg}`);
      continue;
    }
  }

  // If all endpoints fail but we have cached data, return it
  if (cachedPods) {
    console.warn("All endpoints failed, returning stale cache");
    return cachedPods;
  }

  throw new Error(`All pRPC endpoints failed: ${errors.join("; ")}`);
}

export async function fetchPodByPubkey(pubkey: string): Promise<PNode | null> {
  const pods = await fetchPods();
  return pods.find((pod) => pod.pubkey === pubkey) || null;
}

export function clearCache(): void {
  cachedPods = null;
  lastFetchTime = 0;
}
