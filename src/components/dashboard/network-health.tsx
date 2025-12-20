"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Activity, Shield, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NetworkStats } from "@/types/pnode";

interface NetworkHealthProps {
  stats: NetworkStats | null;
  isLoading: boolean;
}

function calculateHealthScore(stats: NetworkStats): number {
  if (!stats || stats.totalNodes === 0) return 0;
  
  // Weight factors for health calculation
  const onlineRatio = stats.onlineNodes / stats.totalNodes;
  const avgScoreNormalized = stats.averageXScore / 100;
  const storageUtilization = stats.totalStorageUsed / stats.totalStorageCommitted;
  
  // Optimal storage utilization is between 40-80%
  const storageScore = storageUtilization >= 0.4 && storageUtilization <= 0.8 
    ? 1 
    : storageUtilization < 0.4 
      ? storageUtilization / 0.4 
      : 1 - ((storageUtilization - 0.8) / 0.2);
  
  // Weighted health score
  const health = (
    onlineRatio * 0.4 +           // 40% weight on uptime
    avgScoreNormalized * 0.35 +   // 35% weight on performance
    storageScore * 0.25           // 25% weight on storage efficiency
  ) * 100;
  
  return Math.round(Math.min(100, Math.max(0, health)));
}

function getHealthColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getHealthBg(score: number): string {
  if (score >= 80) return "from-emerald-500/20 to-emerald-500/5";
  if (score >= 60) return "from-yellow-500/20 to-yellow-500/5";
  if (score >= 40) return "from-orange-500/20 to-orange-500/5";
  return "from-red-500/20 to-red-500/5";
}

function getHealthStatus(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Critical";
}

function getHealthRing(score: number): string {
  if (score >= 80) return "ring-emerald-500/30";
  if (score >= 60) return "ring-yellow-500/30";
  if (score >= 40) return "ring-orange-500/30";
  return "ring-red-500/30";
}

export function NetworkHealth({ stats, isLoading }: NetworkHealthProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const healthScore = stats ? calculateHealthScore(stats) : 0;
  
  const startAnimation = useCallback(() => {
    const duration = 1500;
    startTimeRef.current = null;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(healthScore * progress);
      
      setDisplayScore(current);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(animate);
  }, [healthScore]);
  
  // Trigger animation when data loads
  useEffect(() => {
    if (isLoading || !stats) return;
    
    // Small delay to ensure component is mounted
    const timeoutId = setTimeout(startAnimation, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoading, stats, startAnimation]);
  
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Network Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-violet-500" />
          Network Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Circular Progress */}
          <div className="relative">
            <svg className="h-36 w-36 -rotate-90 transform">
              {/* Background circle */}
              <circle
                cx="72"
                cy="72"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              {/* Progress circle */}
              <circle
                cx="72"
                cy="72"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-1000 ease-out",
                  getHealthColor(displayScore)
                )}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>
            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                "text-4xl font-bold transition-colors",
                getHealthColor(displayScore)
              )}>
                {displayScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            {/* Pulse animation */}
            {isAnimating && (
              <div className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-20",
                `bg-gradient-to-r ${getHealthBg(displayScore)}`
              )} />
            )}
          </div>
          
          {/* Status */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full ring-2",
            `bg-gradient-to-r ${getHealthBg(displayScore)}`,
            getHealthRing(displayScore)
          )}>
            {displayScore >= 60 ? (
              <Activity className={cn("h-4 w-4", getHealthColor(displayScore))} />
            ) : (
              <AlertTriangle className={cn("h-4 w-4", getHealthColor(displayScore))} />
            )}
            <span className={cn("font-semibold", getHealthColor(displayScore))}>
              {getHealthStatus(displayScore)}
            </span>
          </div>
          
          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3 text-emerald-500" />
                  <span className="text-lg font-bold">
                    {Math.round((stats.onlineNodes / stats.totalNodes) * 100)}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Uptime</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3 text-violet-500" />
                  <span className="text-lg font-bold">
                    {stats.averageXScore.toFixed(0)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Avg Score</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Activity className="h-3 w-3 text-blue-500" />
                  <span className="text-lg font-bold">
                    {stats.onlineNodes}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
