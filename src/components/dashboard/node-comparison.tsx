"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitCompare, ArrowRight, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatBytes, formatUptime, formatCredits } from "@/lib/utils";
import type { PNodeWithScore } from "@/types/pnode";

interface NodeComparisonProps {
  nodes: PNodeWithScore[];
}

interface ComparisonMetric {
  label: string;
  key: keyof PNodeWithScore | "none";
  format: (value: number | string | boolean) => string;
  higherIsBetter: boolean;
}

const metrics: ComparisonMetric[] = [
  {
    label: "Pod Credits",
    key: "credits",
    format: (v) => formatCredits(v as number),
    higherIsBetter: true,
  },
  {
    label: "X-Score",
    key: "xScore",
    format: (v) => `${v}/100`,
    higherIsBetter: true,
  },
  {
    label: "Uptime",
    key: "uptime",
    format: (v) => formatUptime(v as number),
    higherIsBetter: true,
  },
  {
    label: "Storage Committed",
    key: "storage_committed",
    format: (v) => formatBytes(v as number),
    higherIsBetter: true,
  },
  {
    label: "Storage Used",
    key: "storage_used",
    format: (v) => formatBytes(v as number),
    higherIsBetter: true,
  },
  {
    label: "Version",
    key: "version",
    format: (v) => String(v),
    higherIsBetter: true, // newer is usually better
  },
  {
    label: "Public Access",
    key: "is_public",
    format: (v) => (v ? "Yes" : "No"),
    higherIsBetter: true,
  },
];

export function NodeComparison({ nodes }: NodeComparisonProps) {
  const [node1Pubkey, setNode1Pubkey] = useState<string>("");
  const [node2Pubkey, setNode2Pubkey] = useState<string>("");

  const node1 = useMemo(
    () => nodes.find((n) => n.pubkey === node1Pubkey),
    [nodes, node1Pubkey]
  );

  const node2 = useMemo(
    () => nodes.find((n) => n.pubkey === node2Pubkey),
    [nodes, node2Pubkey]
  );

  // Sort nodes by credits for the dropdown
  const sortedNodes = useMemo(
    () => [...nodes].sort((a, b) => b.credits - a.credits),
    [nodes]
  );

  const getComparisonResult = (
    metric: ComparisonMetric,
    val1: number | string | boolean,
    val2: number | string | boolean
  ): "node1" | "node2" | "tie" => {
    if (typeof val1 === "boolean" || typeof val2 === "boolean") {
      if (val1 === val2) return "tie";
      return val1 ? "node1" : "node2";
    }
    if (typeof val1 === "string" || typeof val2 === "string") {
      if (val1 === val2) return "tie";
      return String(val1) > String(val2) ? "node1" : "node2";
    }
    if (val1 === val2) return "tie";
    const winner = val1 > val2 ? "node1" : "node2";
    return metric.higherIsBetter ? winner : winner === "node1" ? "node2" : "node1";
  };

  const getWinnerStats = useMemo(() => {
    if (!node1 || !node2) return { node1: 0, node2: 0, ties: 0 };
    
    let node1Wins = 0;
    let node2Wins = 0;
    let ties = 0;

    for (const metric of metrics) {
      if (metric.key === "none") continue;
      const val1 = node1[metric.key];
      const val2 = node2[metric.key];
      const result = getComparisonResult(metric, val1 as number | string | boolean, val2 as number | string | boolean);
      if (result === "node1") node1Wins++;
      else if (result === "node2") node2Wins++;
      else ties++;
    }

    return { node1: node1Wins, node2: node2Wins, ties };
  }, [node1, node2]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-violet-500" />
          Node Comparison Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Node Selection */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Node 1
            </label>
            <Select value={node1Pubkey} onValueChange={setNode1Pubkey}>
              <SelectTrigger>
                <SelectValue placeholder="Select first node..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {sortedNodes.map((node) => (
                  <SelectItem
                    key={node.pubkey}
                    value={node.pubkey}
                    disabled={node.pubkey === node2Pubkey}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {node.pubkey.slice(0, 8)}...
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {formatCredits(node.credits)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center">
            <div className="p-2 rounded-full bg-muted">
              <ArrowRight className="h-5 w-5 text-muted-foreground rotate-0 md:rotate-0" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Node 2
            </label>
            <Select value={node2Pubkey} onValueChange={setNode2Pubkey}>
              <SelectTrigger>
                <SelectValue placeholder="Select second node..." />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {sortedNodes.map((node) => (
                  <SelectItem
                    key={node.pubkey}
                    value={node.pubkey}
                    disabled={node.pubkey === node1Pubkey}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {node.pubkey.slice(0, 8)}...
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {formatCredits(node.credits)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparison Results */}
        {node1 && node2 ? (
          <>
            {/* Winner Summary */}
            <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-500">
                  {getWinnerStats.node1}
                </p>
                <p className="text-xs text-muted-foreground">Node 1 Wins</p>
              </div>
              <div className="text-center px-4 border-x">
                <p className="text-2xl font-bold text-muted-foreground">
                  {getWinnerStats.ties}
                </p>
                <p className="text-xs text-muted-foreground">Ties</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {getWinnerStats.node2}
                </p>
                <p className="text-xs text-muted-foreground">Node 2 Wins</p>
              </div>
            </div>

            {/* Detailed Comparison */}
            <div className="space-y-2">
              {metrics.map((metric) => {
                if (metric.key === "none") return null;
                const val1 = node1[metric.key];
                const val2 = node2[metric.key];
                const result = getComparisonResult(
                  metric,
                  val1 as number | string | boolean,
                  val2 as number | string | boolean
                );

                return (
                  <div
                    key={metric.key}
                    className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "text-right",
                        result === "node1" && "font-semibold text-emerald-500"
                      )}
                    >
                      <div className="flex items-center justify-end gap-2">
                        {result === "node1" && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                        {metric.format(val1 as number | string | boolean)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.label}
                      </p>
                      <div className="flex justify-center mt-1">
                        {result === "node1" ? (
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        ) : result === "node2" ? (
                          <TrendingDown className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-left",
                        result === "node2" && "font-semibold text-blue-500"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {metric.format(val2 as number | string | boolean)}
                        {result === "node2" && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <GitCompare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select two nodes above to compare their metrics</p>
          </div>
        )}

        {/* Quick Compare Suggestions */}
        {!node1 && !node2 && sortedNodes.length >= 2 && (
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNode1Pubkey(sortedNodes[0].pubkey);
                setNode2Pubkey(sortedNodes[1].pubkey);
              }}
            >
              Compare Top 2 by Credits
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
