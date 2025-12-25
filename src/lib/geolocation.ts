import type { GeoLocation } from "@/types/pnode";

// Client-side cache for geolocation data
const geoCache = new Map<string, GeoLocation>();

// Fetch geolocation via our server-side API (avoids CORS issues)
export async function fetchBatchGeoLocations(
  ips: string[]
): Promise<Map<string, GeoLocation>> {
  const results = new Map<string, GeoLocation>();
  const uniqueIps = [...new Set(ips)].filter(Boolean);
  
  if (uniqueIps.length === 0) {
    return results;
  }

  // Return cached results for IPs we already have
  const uncachedIps: string[] = [];
  for (const ip of uniqueIps) {
    if (geoCache.has(ip)) {
      results.set(ip, geoCache.get(ip)!);
    } else {
      uncachedIps.push(ip);
    }
  }

  // Fetch uncached IPs via our API
  if (uncachedIps.length > 0) {
    try {
      const response = await fetch("/api/geo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ips: uncachedIps }),
      });

      if (response.ok) {
        const { success, data } = await response.json();
        
        if (success && data) {
          for (const [ip, geoData] of Object.entries(data)) {
            const geo = geoData as GeoLocation;
            geoCache.set(ip, geo);
            results.set(ip, geo);
          }
        }
      }
    } catch {
      // Batch request failed silently
    }
  }

  return results;
}

// Get country statistics from geo data
export function getCountryStats(
  geoData: Map<string, GeoLocation>
): Record<string, number> {
  const stats: Record<string, number> = {};
  
  for (const geo of geoData.values()) {
    const country = geo.country || "Unknown";
    stats[country] = (stats[country] || 0) + 1;
  }

  return stats;
}

// Clear geo cache
export function clearGeoCache(): void {
  geoCache.clear();
}
