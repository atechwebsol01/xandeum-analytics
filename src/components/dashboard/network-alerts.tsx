"use client";

import { AlertTriangle, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo, truncateAddress } from "@/lib/utils";
import type { PNodeWithScore } from "@/types/pnode";
import Link from "next/link";

interface NetworkAlertsProps {
  nodes: PNodeWithScore[];
  isLoading: boolean;
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  node?: PNodeWithScore;
  timestamp: number;
}

function generateAlerts(nodes: PNodeWithScore[]): Alert[] {
  const alerts: Alert[] = [];
  const now = Math.floor(Date.now() / 1000);
  
  // Check for offline nodes
  const offlineNodes = nodes.filter(n => n.status === "offline");
  if (offlineNodes.length > 0) {
    offlineNodes.slice(0, 3).forEach(node => {
      alerts.push({
        id: `offline-${node.pubkey}`,
        type: "critical",
        title: "Node Offline",
        message: `Node ${truncateAddress(node.pubkey, 4)} has been offline for ${timeAgo(node.last_seen_timestamp)}`,
        node,
        timestamp: node.last_seen_timestamp,
      });
    });
  }
  
  // Check for warning nodes
  const warningNodes = nodes.filter(n => n.status === "warning");
  if (warningNodes.length > 0) {
    warningNodes.slice(0, 2).forEach(node => {
      alerts.push({
        id: `warning-${node.pubkey}`,
        type: "warning",
        title: "Node Degraded",
        message: `Node ${truncateAddress(node.pubkey, 4)} showing delayed responses`,
        node,
        timestamp: node.last_seen_timestamp,
      });
    });
  }
  
  // Check for low X-Score nodes
  const lowScoreNodes = nodes.filter(n => n.xScore < 40 && n.status === "online");
  if (lowScoreNodes.length > 0) {
    alerts.push({
      id: "low-score",
      type: "warning",
      title: "Low Performance",
      message: `${lowScoreNodes.length} node(s) with X-Score below 40`,
      timestamp: now,
    });
  }
  
  // Check for high storage usage
  const highStorageNodes = nodes.filter(n => n.storage_usage_percent > 85);
  if (highStorageNodes.length > 0) {
    alerts.push({
      id: "high-storage",
      type: "warning",
      title: "Storage Warning",
      message: `${highStorageNodes.length} node(s) with storage usage above 85%`,
      timestamp: now,
    });
  }
  
  // If no issues, show all-clear
  if (alerts.length === 0) {
    alerts.push({
      id: "all-clear",
      type: "info",
      title: "All Systems Operational",
      message: "No issues detected. Network is healthy.",
      timestamp: now,
    });
  }
  
  return alerts.slice(0, 5);
}

const alertIcons = {
  critical: XCircle,
  warning: AlertTriangle,
  info: CheckCircle,
};

const alertStyles = {
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "text-red-500",
    badge: "error" as const,
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    icon: "text-yellow-500",
    badge: "warning" as const,
  },
  info: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "text-emerald-500",
    badge: "success" as const,
  },
};

export function NetworkAlerts({ nodes, isLoading }: NetworkAlertsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5" />
            Network Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const alerts = generateAlerts(nodes);
  const criticalCount = alerts.filter(a => a.type === "critical").length;
  const warningCount = alerts.filter(a => a.type === "warning").length;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-violet-500" />
            Network Alerts
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="error" className="text-xs">
                {criticalCount} Critical
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="warning" className="text-xs">
                {warningCount} Warning
              </Badge>
            )}
            {criticalCount === 0 && warningCount === 0 && (
              <Badge variant="success" className="text-xs">
                All Clear
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type];
            const styles = alertStyles[alert.type];
            
            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50",
                  styles.bg,
                  styles.border
                )}
              >
                <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", styles.icon)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      {timeAgo(alert.timestamp)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {alert.message}
                  </p>
                  {alert.node && (
                    <Link
                      href={`/pnodes/${alert.node.pubkey}`}
                      className="text-xs text-violet-500 hover:underline mt-1 inline-block"
                    >
                      View Node Details →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
