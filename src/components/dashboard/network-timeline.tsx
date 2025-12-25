"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Server,
  Wifi,
  WifiOff,
  AlertTriangle
} from "lucide-react";
import { usePNodes } from "@/hooks/use-pnodes";
import { cn } from "@/lib/utils";

export function NetworkTimeline() {
  const { data, isLoading } = usePNodes();
  
  const responseData = data?.success ? data.data : null;
  const stats = responseData?.stats;
  const nodes = responseData?.nodes || [];
  
  const totalNodes = stats?.totalNodes || 0;
  const onlineNodes = stats?.onlineNodes || 0;
  const warningNodes = stats?.warningNodes || 0;
  const offlineNodes = stats?.offlineNodes || 0;
  
  const onlinePct = totalNodes > 0 ? (onlineNodes / totalNodes) * 100 : 0;
  const warningPct = totalNodes > 0 ? (warningNodes / totalNodes) * 100 : 0;
  const offlinePct = totalNodes > 0 ? (offlineNodes / totalNodes) * 100 : 0;
  
  const healthScore = onlinePct + (warningPct * 0.5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
              <Clock className="h-4 w-4 text-white" />
            </div>
            Network Status
          </CardTitle>
          <Badge 
            variant={healthScore >= 80 ? "success" : healthScore >= 50 ? "warning" : "error"}
          >
            {healthScore.toFixed(1)}% health
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Donut Chart */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/20" />
              {/* Online segment (green) */}
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke="#10b981" strokeWidth="12"
                strokeDasharray={`${onlinePct * 2.51} 251`}
                strokeLinecap="round"
              />
              {/* Warning segment (yellow) */}
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke="#eab308" strokeWidth="12"
                strokeDasharray={`${warningPct * 2.51} 251`}
                strokeDashoffset={`${-onlinePct * 2.51}`}
                strokeLinecap="round"
              />
              {/* Offline segment (red) */}
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke="#ef4444" strokeWidth="12"
                strokeDasharray={`${offlinePct * 2.51} 251`}
                strokeDashoffset={`${-(onlinePct + warningPct) * 2.51}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Server className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xl font-bold">{totalNodes}</span>
              <span className="text-[10px] text-muted-foreground">nodes</span>
            </div>
          </div>
          
          {/* Status Breakdown */}
          <div className="flex-1 space-y-3">
            {/* Online */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Wifi className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Online</span>
                  <span className="text-sm font-bold text-emerald-500">{onlineNodes}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${onlinePct}%` }} 
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{onlinePct.toFixed(1)}%</span>
              </div>
            </div>
            
            {/* Warning */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Warning</span>
                  <span className="text-sm font-bold text-yellow-500">{warningNodes}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full transition-all duration-500" 
                    style={{ width: `${warningPct}%` }} 
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{warningPct.toFixed(1)}%</span>
              </div>
            </div>
            
            {/* Offline */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <WifiOff className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Offline</span>
                  <span className="text-sm font-bold text-red-500">{offlineNodes}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-500" 
                    style={{ width: `${offlinePct}%` }} 
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{offlinePct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Health Indicator Bar */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Network Health Score</span>
            <span className={cn(
              "text-lg font-bold",
              healthScore >= 80 ? "text-emerald-500" :
              healthScore >= 50 ? "text-yellow-500" : "text-red-500"
            )}>
              {healthScore.toFixed(0)}/100
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                healthScore >= 80 ? "bg-gradient-to-r from-emerald-600 to-emerald-400" :
                healthScore >= 50 ? "bg-gradient-to-r from-yellow-600 to-yellow-400" :
                "bg-gradient-to-r from-red-600 to-red-400"
              )}
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>Critical</span>
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
