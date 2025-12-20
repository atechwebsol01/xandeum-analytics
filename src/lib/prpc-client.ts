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

// Seeded random number generator for consistent demo data
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// Demo data - stable and consistent across requests
// This ensures the app is always functional for demonstration
function generateDemoData(): PNode[] {
  const now = Math.floor(Date.now() / 1000);
  const versions = ["1.2.0", "1.1.9", "1.1.8", "1.1.7", "1.1.6"];
  const rng = new SeededRandom(42); // Fixed seed for consistency
  
  // Pre-defined node configurations for realistic demo
  const nodeConfigs = [
    { name: "alpha", region: "us-east", tier: "premium" },
    { name: "beta", region: "eu-west", tier: "standard" },
    { name: "gamma", region: "asia-pacific", tier: "premium" },
    { name: "delta", region: "us-west", tier: "standard" },
    { name: "epsilon", region: "eu-central", tier: "premium" },
    { name: "zeta", region: "sa-east", tier: "standard" },
    { name: "eta", region: "us-central", tier: "premium" },
    { name: "theta", region: "eu-north", tier: "standard" },
    { name: "iota", region: "asia-south", tier: "premium" },
    { name: "kappa", region: "oceania", tier: "standard" },
    { name: "lambda", region: "us-east", tier: "premium" },
    { name: "mu", region: "eu-west", tier: "standard" },
    { name: "nu", region: "asia-east", tier: "premium" },
    { name: "xi", region: "africa", tier: "standard" },
    { name: "omicron", region: "us-west", tier: "premium" },
    { name: "pi", region: "eu-south", tier: "standard" },
    { name: "rho", region: "middle-east", tier: "premium" },
    { name: "sigma", region: "us-central", tier: "standard" },
    { name: "tau", region: "eu-central", tier: "premium" },
    { name: "upsilon", region: "asia-pacific", tier: "standard" },
    { name: "phi", region: "us-east", tier: "premium" },
    { name: "chi", region: "eu-west", tier: "standard" },
    { name: "psi", region: "asia-south", tier: "premium" },
    { name: "omega", region: "oceania", tier: "standard" },
    { name: "prime", region: "us-west", tier: "premium" },
  ];
  
  return nodeConfigs.map((config, i) => {
    const isPremium = config.tier === "premium";
    const baseUptime = isPremium ? 45 : 25;
    const uptimeDays = baseUptime + rng.nextInt(5, 35);
    
    // Status distribution: 80% online, 12% warning, 8% offline
    // Premium nodes: 88% online, 10% warning, 2% offline
    const statusRoll = rng.next();
    let status: "online" | "warning" | "offline";
    if (isPremium) {
      if (statusRoll < 0.88) status = "online";
      else if (statusRoll < 0.98) status = "warning";
      else status = "offline";
    } else {
      if (statusRoll < 0.76) status = "online";
      else if (statusRoll < 0.92) status = "warning";
      else status = "offline";
    }
    
    // Storage varies by tier - always substantial values
    const storageBase = isPremium ? 600 : 300;
    const storageCommitted = (storageBase + rng.nextInt(100, 600)) * 1024 * 1024 * 1024;
    const usagePercent = isPremium ? rng.nextInt(55, 92) : rng.nextInt(35, 78);
    const storageUsed = Math.floor(storageCommitted * (usagePercent / 100));
    
    const pubkey = generateSeededPubkey(config.name, i);
    
    const regionIPs: Record<string, [number, number]> = {
      "us-east": [34, 35], "us-west": [35, 36], "us-central": [104, 105],
      "eu-west": [52, 53], "eu-central": [18, 19], "eu-north": [13, 14], "eu-south": [15, 16],
      "asia-pacific": [54, 55], "asia-south": [65, 66], "asia-east": [47, 48],
      "oceania": [13, 14], "sa-east": [18, 19], "africa": [41, 42], "middle-east": [157, 158],
    };
    const [ipBase1, ipBase2] = regionIPs[config.region] || [10, 11];
    
    // Generate last_seen based on status (matches getStatusColor thresholds)
    let lastSeenOffset: number;
    if (status === "online") {
      lastSeenOffset = rng.nextInt(5, 90); // 5-90 seconds ago (online < 120s)
    } else if (status === "warning") {
      lastSeenOffset = rng.nextInt(130, 500); // 130-500 seconds ago (warning: 120-600s)
    } else {
      lastSeenOffset = rng.nextInt(700, 1800); // 700-1800 seconds ago (offline > 600s)
    }
    
    return {
      pubkey,
      address: `${ipBase1}.${ipBase2}.${rng.nextInt(1, 254)}.${rng.nextInt(1, 254)}:${6000 + i}`,
      rpc_port: 6000 + i,
      version: versions[i % versions.length],
      is_public: isPremium || rng.next() > 0.4,
      last_seen_timestamp: now - lastSeenOffset,
      storage_committed: storageCommitted,
      storage_used: storageUsed,
      storage_usage_percent: usagePercent,
      uptime: uptimeDays * 86400 + rng.nextInt(3600, 86400),
    };
  });
}

function generateSeededPubkey(seed: string, index: number): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let hash = index * 31;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  
  let result = "";
  for (let i = 0; i < 44; i++) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    result += chars.charAt(hash % chars.length);
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
  
  // IMPORTANT: For demo mode, ALWAYS regenerate fresh data to keep timestamps current
  // This must come BEFORE the cache check
  if (useDemoData) {
    cachedPods = generateDemoData();
    lastFetchTime = now;
    return cachedPods;
  }
  
  // Return cached data if still valid (only for real API data)
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
