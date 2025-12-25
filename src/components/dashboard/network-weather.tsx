"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NetworkWeatherProps {
  onlinePercent: number;
  avgXScore: number;
  totalNodes: number;
  isLoading?: boolean;
}

type WeatherType = "sunny" | "partly-cloudy" | "cloudy" | "rainy" | "stormy";

interface WeatherInfo {
  type: WeatherType;
  emoji: string;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

export function NetworkWeather({ onlinePercent, avgXScore, totalNodes, isLoading }: NetworkWeatherProps) {
  const weather = useMemo((): WeatherInfo => {
    // Calculate overall health score (0-100)
    const healthScore = (onlinePercent * 0.6) + (avgXScore * 0.4);
    
    if (healthScore >= 90) {
      return {
        type: "sunny",
        emoji: "☀️",
        label: "Sunny",
        description: "Network is thriving! Excellent health across all nodes.",
        color: "text-amber-500",
        bgColor: "from-amber-500/20 to-yellow-500/20",
      };
    }
    if (healthScore >= 75) {
      return {
        type: "partly-cloudy",
        emoji: "⛅",
        label: "Partly Cloudy",
        description: "Network is healthy with minor fluctuations.",
        color: "text-blue-500",
        bgColor: "from-blue-500/20 to-cyan-500/20",
      };
    }
    if (healthScore >= 60) {
      return {
        type: "cloudy",
        emoji: "☁️",
        label: "Cloudy",
        description: "Some nodes experiencing issues. Monitor closely.",
        color: "text-slate-500",
        bgColor: "from-slate-500/20 to-gray-500/20",
      };
    }
    if (healthScore >= 40) {
      return {
        type: "rainy",
        emoji: "🌧️",
        label: "Rainy",
        description: "Network degraded. Multiple nodes need attention.",
        color: "text-blue-600",
        bgColor: "from-blue-600/20 to-indigo-600/20",
      };
    }
    return {
      type: "stormy",
      emoji: "⛈️",
      label: "Stormy",
      description: "Critical! Network experiencing major issues.",
      color: "text-red-500",
      bgColor: "from-red-500/20 to-orange-500/20",
    };
  }, [onlinePercent, avgXScore]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-muted/50 to-muted/30">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-pulse">🌤️</div>
            <div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-gradient-to-br border-0", weather.bgColor)}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{weather.emoji}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className={cn("text-lg font-bold", weather.color)}>
                  {weather.label}
                </span>
                <Badge variant="outline" className="text-xs">
                  {totalNodes} nodes
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {weather.description}
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-2xl font-bold">{onlinePercent.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
