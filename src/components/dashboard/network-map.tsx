"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, MapPin } from "lucide-react";
import { fetchBatchGeoLocations, getCountryStats } from "@/lib/geolocation";
import { formatCredits } from "@/lib/utils";
import type { PNodeWithScore, GeoLocation } from "@/types/pnode";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface NetworkMapProps {
  nodes: PNodeWithScore[];
  isLoading: boolean;
}

interface NodeWithGeo extends PNodeWithScore {
  geo?: GeoLocation;
}

export function NetworkMap({ nodes, isLoading }: NetworkMapProps) {
  const [geoData, setGeoData] = useState<Map<string, GeoLocation>>(new Map());
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Extract unique IPs from nodes
  const uniqueIps = useMemo(() => {
    return [...new Set(nodes.map((n) => n.ip).filter(Boolean))];
  }, [nodes]);

  // Fetch geolocation data for all IPs
  useEffect(() => {
    if (uniqueIps.length === 0) return;

    const fetchGeo = async () => {
      setIsLoadingGeo(true);
      try {
        const results = await fetchBatchGeoLocations(uniqueIps);
        setGeoData(results);
      } catch {
        // Geolocation fetch failed silently
      } finally {
        setIsLoadingGeo(false);
      }
    };

    fetchGeo();
  }, [uniqueIps]);

  // Set map ready after component mounts (for SSR)
  useEffect(() => {
    setMapReady(true);
  }, []);

  // Combine nodes with geo data
  const nodesWithGeo: NodeWithGeo[] = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      geo: geoData.get(node.ip),
    }));
  }, [nodes, geoData]);

  // Get country statistics
  const countryStats = useMemo(() => {
    return getCountryStats(geoData);
  }, [geoData]);

  // Sort countries by count
  const topCountries = useMemo(() => {
    return Object.entries(countryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [countryStats]);

  // Get marker color based on status
  const getMarkerColor = (status: string): string => {
    switch (status) {
      case "online":
        return "#10b981"; // emerald
      case "warning":
        return "#f59e0b"; // amber
      case "offline":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Global Node Distribution
          </CardTitle>
          <div className="flex items-center gap-2">
            {isLoadingGeo && (
              <Badge variant="secondary" className="animate-pulse">
                Loading locations...
              </Badge>
            )}
            <Badge variant="outline">{geoData.size} located</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map */}
        <div className="h-[400px] w-full rounded-lg overflow-hidden border bg-muted/50">
          {mapReady && typeof window !== "undefined" ? (
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {nodesWithGeo
                .filter((n) => n.geo && typeof n.geo.lat === 'number' && typeof n.geo.lon === 'number' && isFinite(n.geo.lat) && isFinite(n.geo.lon))
                .map((node) => {
                  const geo = node.geo!;
                  const city = geo.city || 'Unknown';
                  const country = geo.country || 'Unknown';
                  return (
                    <CircleMarker
                      key={node.pubkey}
                      center={[geo.lat, geo.lon]}
                      radius={8}
                      fillColor={getMarkerColor(node.status)}
                      color="#ffffff"
                      weight={2}
                      opacity={1}
                      fillOpacity={0.8}
                    >
                      <Popup>
                        <div className="min-w-[200px] p-1">
                          <p className="font-semibold text-sm mb-1">
                            {node.pubkey ? `${node.pubkey.slice(0, 8)}...${node.pubkey.slice(-6)}` : 'Unknown'}
                          </p>
                          <div className="space-y-1 text-xs">
                            <p>
                              <span className="text-gray-500">Location:</span>{" "}
                              {city}, {country}
                            </p>
                            <p>
                              <span className="text-gray-500">Status:</span>{" "}
                              <span
                                className={
                                  node.status === "online"
                                    ? "text-green-600"
                                    : node.status === "warning"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }
                              >
                                {node.status || 'unknown'}
                              </span>
                            </p>
                            <p>
                              <span className="text-gray-500">Credits:</span>{" "}
                              {formatCredits(node.credits || 0)}
                            </p>
                            <p>
                              <span className="text-gray-500">Version:</span>{" "}
                              {node.version || 'unknown'}
                            </p>
                            <p>
                              <span className="text-gray-500">IP:</span> {node.ip || 'unknown'}
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                <p>Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Country Statistics */}
        {topCountries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {topCountries.map(([country, count]) => (
              <div
                key={country}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{country}</p>
                  <p className="text-xs text-muted-foreground">{count} nodes</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Offline</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
