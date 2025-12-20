import type { PNode, PRPCResponse, GetPodsResponse } from "@/types/pnode";

// Get pRPC endpoints from environment or use defaults
// Note: These endpoints are used to fetch pNode data from the Xandeum network
const getEndpoints = (): string[] => {
  const envEndpoints = process.env.NEXT_PUBLIC_PRPC_ENDPOINTS;
  if (envEndpoints) {
    return envEndpoints.split(",").map((e) => e.trim()).filter(Boolean);
  }
  // Default endpoints - using multiple for redundancy
  return [
    "https://prpc.xandeum.network",
    "https://rpc.xandeum.network",
  ];
};

const PRPC_ENDPOINTS = getEndpoints();
const CACHE_TTL = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || 30000; // 30 seconds default
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout (reduced for faster fallback)
let cachedPods: PNode[] | null = null;
let lastFetchTime = 0;
let useDemoData = false;

// Demo data for when real endpoints are unavailable
// This ensures the app is always functional for demonstration
function generateDemoData(): PNode[] {
  const now = Math.floor(Date.now() / 1000);
  const versions = ["1.2.0", "1.1.9", "1.1.8", "1.1.7"];
  
  return Array.from({ length: 25 }, (_, i) => {
    const isOnline = Math.random() > 0.15;
    const uptimeDays = Math.floor(Math.random() * 60) + 1;
    const storageCommitted = (Math.floor(Math.random() * 900) + 100) * 1024 * 1024 * 1024; // 100GB - 1TB
    const storageUsed = Math.floor(storageCommitted * (Math.random() * 0.8 + 0.1));
    
    return {
      pubkey: `${generatePubkey()}`,
      address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}:${6000 + i}`,
      rpc_port: 6000 + i,
      version: versions[Math.floor(Math.random() * versions.length)],
      is_public: Math.random() > 0.3,
      last_seen_timestamp: isOnline ? now - Math.floor(Math.random() * 60) : now - Math.floor(Math.random() * 3600),
      storage_committed: storageCommitted,
      storage_used: storageUsed,
      storage_usage_percent: (storageUsed / storageCommitted) * 100,
      uptime: uptimeDays * 86400 + Math.floor(Math.random() * 86400),
    };
  });
}

function generatePubkey(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function callPRPC<T>(
  endpoint: string,
  method: string,
  params?: Record<string, unknown>
): Promise<T> {
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
        params: params || {},
        id: 1,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as PRPCResponse<T>;

    if ("error" in data) {
      throw new Error(
        (data as unknown as { error: { message: string } }).error.message
      );
    }

    return data.result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${REQUEST_TIMEOUT / 1000}s`);
    }
    throw error;
  }
}

export async function fetchPods(): Promise<PNode[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedPods && now - lastFetchTime < CACHE_TTL) {
    return cachedPods;
  }

  // If we're in demo mode, return demo data
  if (useDemoData && cachedPods) {
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
      
      if (pods.length > 0) {
        console.log(`Successfully fetched ${pods.length} pNodes from ${endpoint}`);
        cachedPods = pods;
        lastFetchTime = now;
        useDemoData = false;
        return pods;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to fetch from ${endpoint}:`, errorMsg);
      errors.push(`${endpoint}: ${errorMsg}`);
      continue;
    }
  }

  // If all endpoints fail but we have cached data, return it
  if (cachedPods && !useDemoData) {
    console.warn("All endpoints failed, returning stale cache");
    return cachedPods;
  }

  // Fallback to demo data - this ensures the app always works for demonstration
  console.warn("All pRPC endpoints unreachable. Using demo data for demonstration.");
  useDemoData = true;
  cachedPods = generateDemoData();
  lastFetchTime = now;
  return cachedPods;
}

export async function fetchPodByPubkey(pubkey: string): Promise<PNode | null> {
  const pods = await fetchPods();
  return pods.find((pod) => pod.pubkey === pubkey) || null;
}

export function clearCache(): void {
  cachedPods = null;
  lastFetchTime = 0;
  useDemoData = false;
}

export function isUsingDemoData(): boolean {
  return useDemoData;
}
