"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  Activity,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { NetworkSnapshot } from "@/types/database";

interface TimelinePoint {
  time: string;
  timestamp: Date;
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  healthPercent: number;
}

export function NetworkTimeline() {
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setIsLoading(true);
        
        // Fetch last 24 hours of snapshots
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        
        const { data, error: fetchError } = await supabase
          .from("network_snapshots")
          .select("*")
          .gte("created_at", twentyFourHoursAgo.toISOString())
          .order("created_at", { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (data && data.length > 0) {
          // Group by hour and take latest snapshot per hour
          const hourlyData = new Map<string, NetworkSnapshot>();
          
          (data as NetworkSnapshot[]).forEach((snapshot) => {
            const date = new Date(snapshot.created_at);
            const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
            hourlyData.set(hourKey, snapshot);
          });

          const points: TimelinePoint[] = Array.from(hourlyData.values()).map((snapshot) => {
            const date = new Date(snapshot.created_at);
            return {
              time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              timestamp: date,
              totalNodes: snapshot.total_nodes,
              onlineNodes: snapshot.online_nodes,
              offlineNodes: snapshot.offline_nodes,
              healthPercent: snapshot.total_nodes > 0 
                ? (snapshot.online_nodes / snapshot.total_nodes) * 100 
                : 0,
            };
          });

          setTimelineData(points.slice(-12)); // Last 12 data points
        } else {
          // No historical data available yet
          setTimelineData([]);
        }
      } catch {
        // Timeline fetch failed silently
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchTimeline, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const maxNodes = Math.max(...timelineData.map((d) => d.totalNodes), 1);
  const avgHealth = timelineData.length > 0
    ? timelineData.reduce((sum, d) => sum + d.healthPercent, 0) / timelineData.length
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Network Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = timelineData.some(d => d.totalNodes > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
              <Clock className="h-4 w-4 text-white" />
            </div>
            24h Network Timeline
          </CardTitle>
          <Badge 
            variant={avgHealth >= 80 ? "success" : avgHealth >= 50 ? "warning" : "error"}
          >
            {avgHealth.toFixed(1)}% avg health
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No historical data yet</p>
            <p className="text-xs">Data collection will start automatically</p>
          </div>
        ) : (
          <>
            {/* Mini chart */}
            <div className="h-32 flex items-end gap-1 mb-2">
              {timelineData.map((point, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-0.5 group"
                >
                  <div className="w-full relative">
                    {/* Online nodes bar */}
                    <div
                      className="w-full rounded-t bg-emerald-500 transition-all group-hover:bg-emerald-400"
                      style={{
                        height: `${(point.onlineNodes / maxNodes) * 100}px`,
                        minHeight: point.onlineNodes > 0 ? "4px" : "0",
                      }}
                    />
                    {/* Offline nodes bar */}
                    <div
                      className="w-full rounded-b bg-red-500/50 transition-all"
                      style={{
                        height: `${(point.offlineNodes / maxNodes) * 20}px`,
                        minHeight: point.offlineNodes > 0 ? "2px" : "0",
                      }}
                    />
                  </div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 px-2 py-1 bg-background border rounded shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <p className="font-medium">{point.time}</p>
                    <p className="text-emerald-500">{point.onlineNodes} online</p>
                    <p className="text-red-500">{point.offlineNodes} offline</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Time labels */}
            <div className="flex justify-between text-[10px] text-muted-foreground border-t pt-2">
              {timelineData.filter((_, i) => i % 3 === 0).map((point, index) => (
                <span key={index}>{point.time}</span>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-500/50" />
                  <span className="text-xs text-muted-foreground">Offline</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                {timelineData[timelineData.length - 1]?.totalNodes || 0} total nodes
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
