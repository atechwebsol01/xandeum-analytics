"use client";

import { useQuery } from "@tanstack/react-query";
import type { GeoLocation } from "@/types/pnode";

interface GeoResponse {
  success: boolean;
  data: Record<string, GeoLocation>;
}

async function fetchGeolocation(ips: string[]): Promise<Map<string, GeoLocation>> {
  if (ips.length === 0) return new Map();

  try {
    const response = await fetch("/api/geo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ips }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch geolocation");
    }

    const data: GeoResponse = await response.json();
    
    if (data.success && data.data) {
      const geoMap = new Map<string, GeoLocation>();
      for (const [ip, geo] of Object.entries(data.data)) {
        geoMap.set(ip, geo);
      }
      return geoMap;
    }
    
    return new Map();
  } catch {
    return new Map();
  }
}

export function useGeolocation(ips: string[]) {
  return useQuery({
    queryKey: ["geolocation", ips.sort().join(",")],
    queryFn: () => fetchGeolocation(ips),
    enabled: ips.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
