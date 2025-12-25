"use client";

import { useMemo } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpCircle,
  Package,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PNodeWithScore } from "@/types/pnode";

interface VersionTrackerProps {
  nodes: PNodeWithScore[];
  isLoading?: boolean;
}

export function VersionTracker({ nodes, isLoading }: VersionTrackerProps) {
  const versionAnalysis = useMemo(() => {
    if (nodes.length === 0) return null;

    // Get all versions and their counts
    const versionCounts: Record<string, number> = {};
    nodes.forEach((node) => {
      const version = node.version || "unknown";
      versionCounts[version] = (versionCounts[version] || 0) + 1;
    });

    // Sort versions (assuming semver-like format)
    const sortedVersions = Object.entries(versionCounts)
      .map(([version, count]) => ({ version, count }))
      .sort((a, b) => {
        // Try to parse version numbers
        const parseVersion = (v: string) => {
          const match = v.match(/(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            return parseInt(match[1]) * 10000 + parseInt(match[2]) * 100 + parseInt(match[3]);
          }
          return 0;
        };
        return parseVersion(b.version) - parseVersion(a.version);
      });

    // Determine latest version (most common among recent or highest number)
    const latestVersion = sortedVersions[0]?.version || "unknown";
    
    // Find outdated nodes (not on the most popular version)
    const outdatedNodes = nodes.filter((n) => n.version && n.version !== latestVersion);
    const unknownVersionNodes = nodes.filter((n) => !n.version || n.version === "unknown");
    
    // Calculate percentages
    const upToDatePercent = ((nodes.length - outdatedNodes.length - unknownVersionNodes.length) / nodes.length) * 100;

    return {
      latestVersion,
      sortedVersions,
      outdatedCount: outdatedNodes.length,
      unknownCount: unknownVersionNodes.length,
      upToDateCount: nodes.length - outdatedNodes.length - unknownVersionNodes.length,
      upToDatePercent,
      totalNodes: nodes.length,
    };
  }, [nodes]);

  if (isLoading || !versionAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Version Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Loading version data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const { latestVersion, sortedVersions, outdatedCount, upToDateCount, upToDatePercent } = versionAnalysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-violet-500" />
          Version Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Latest Version Banner */}
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Latest Version</p>
                <p className="text-xl font-bold font-mono">{latestVersion}</p>
              </div>
            </div>
            <Badge variant="success" className="text-lg px-3 py-1">
              {upToDatePercent.toFixed(0)}% up to date
            </Badge>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-emerald-500">{upToDateCount}</p>
            <p className="text-xs text-muted-foreground">Up to Date</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-500/10">
            <ArrowUpCircle className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-yellow-500">{outdatedCount}</p>
            <p className="text-xs text-muted-foreground">Need Update</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Info className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{versionAnalysis.unknownCount}</p>
            <p className="text-xs text-muted-foreground">Unknown</p>
          </div>
        </div>

        {/* Version Breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Version Distribution</p>
          {sortedVersions.slice(0, 5).map((v, index) => {
            const percent = (v.count / versionAnalysis.totalNodes) * 100;
            const isLatest = v.version === latestVersion;
            
            return (
              <div key={v.version} className="flex items-center gap-3">
                <div className="w-24 font-mono text-sm flex items-center gap-2">
                  {isLatest && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                  {!isLatest && index > 0 && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                  {v.version}
                </div>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isLatest ? "bg-emerald-500" : "bg-yellow-500"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="w-20 text-right text-sm text-muted-foreground">
                  {v.count} ({percent.toFixed(0)}%)
                </div>
              </div>
            );
          })}
        </div>

        {/* Outdated Warning */}
        {outdatedCount > 0 && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-600 dark:text-yellow-500">
                  {outdatedCount} nodes need updates
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Running outdated versions may affect node performance and rewards.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
