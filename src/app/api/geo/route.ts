import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface GeoResult {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  isp: string;
  org: string;
}

// Cache for geolocation results
const geoCache = new Map<string, GeoResult>();

export async function POST(request: Request) {
  try {
    const { ips } = await request.json();

    if (!Array.isArray(ips) || ips.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid or empty IPs array" },
        { status: 400 }
      );
    }

    // Limit to 100 IPs per request
    const limitedIps = ips.slice(0, 100);
    const results: Record<string, GeoResult> = {};
    const uncachedIps: string[] = [];

    // Check cache first
    for (const ip of limitedIps) {
      if (geoCache.has(ip)) {
        results[ip] = geoCache.get(ip)!;
      } else {
        uncachedIps.push(ip);
      }
    }

    // Fetch uncached IPs from ip-api.com batch endpoint
    if (uncachedIps.length > 0) {
      try {
        const response = await fetch("http://ip-api.com/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            uncachedIps.map((ip) => ({
              query: ip,
              fields: "status,query,country,countryCode,region,city,lat,lon,isp,org",
            }))
          ),
        });

        if (response.ok) {
          const batchResults = await response.json();
          
          for (const data of batchResults) {
            if (data.status === "success") {
              const geoData: GeoResult = {
                ip: data.query,
                country: data.country || "Unknown",
                countryCode: data.countryCode || "XX",
                region: data.region || "",
                city: data.city || "",
                lat: data.lat || 0,
                lon: data.lon || 0,
                isp: data.isp || "",
                org: data.org || "",
              };
              geoCache.set(data.query, geoData);
              results[data.query] = geoData;
            }
          }
        }
      } catch (error) {
        console.warn("Batch geolocation failed:", error);
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      cached: Object.keys(results).length - uncachedIps.filter(ip => results[ip]).length,
      fetched: uncachedIps.filter(ip => results[ip]).length,
    });
  } catch (error) {
    console.error("Geo API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch geolocation data" },
      { status: 500 }
    );
  }
}
