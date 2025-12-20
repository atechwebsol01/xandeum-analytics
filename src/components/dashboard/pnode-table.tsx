"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  ExternalLink,
  Copy,
  Check,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "./status-badge";
import { XScoreBadge } from "./x-score-badge";
import {
  cn,
  formatBytes,
  formatUptime,
  timeAgo,
  truncateAddress,
} from "@/lib/utils";
import type { PNodeWithScore, SortConfig, FilterConfig } from "@/types/pnode";

interface PNodeTableProps {
  nodes: PNodeWithScore[];
  isLoading: boolean;
}

export function PNodeTable({ nodes, isLoading }: PNodeTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "xScore",
    direction: "desc",
  });
  const [filters, setFilters] = useState<FilterConfig>({
    search: "",
    status: "all",
    version: "all",
    minScore: 0,
  });
  const [copiedPubkey, setCopiedPubkey] = useState<string | null>(null);

  const versions = useMemo(() => {
    const versionSet = new Set(nodes.map((n) => n.version));
    return Array.from(versionSet).sort().reverse();
  }, [nodes]);

  const filteredAndSortedNodes = useMemo(() => {
    let result = [...nodes];

    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (node) =>
          node.pubkey.toLowerCase().includes(search) ||
          node.address.toLowerCase().includes(search)
      );
    }

    if (filters.status !== "all") {
      result = result.filter((node) => node.status === filters.status);
    }

    if (filters.version !== "all") {
      result = result.filter((node) => node.version === filters.version);
    }

    if (filters.minScore > 0) {
      result = result.filter((node) => node.xScore >= filters.minScore);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });

    return result;
  }, [nodes, sortConfig, filters]);

  const handleSort = (key: keyof PNodeWithScore) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleCopyPubkey = async (pubkey: string) => {
    await navigator.clipboard.writeText(pubkey);
    setCopiedPubkey(pubkey);
    toast.success("Copied to clipboard!", {
      description: `${pubkey.slice(0, 12)}...${pubkey.slice(-8)}`,
    });
    setTimeout(() => setCopiedPubkey(null), 2000);
  };

  const renderSortIcon = useCallback(
    (column: keyof PNodeWithScore) => {
      if (sortConfig.key !== column) {
        return <ArrowUpDown className="h-4 w-4 opacity-50" />;
      }
      return sortConfig.direction === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      );
    },
    [sortConfig.key, sortConfig.direction]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>pNodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            pNodes
            <Badge variant="secondary">{filteredAndSortedNodes.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by pubkey or address..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value as FilterConfig["status"],
              }))
            }
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.version}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, version: value }))
            }
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Versions</SelectItem>
              {versions.map((version) => (
                <SelectItem key={version} value={version}>
                  {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filters.search ||
            filters.status !== "all" ||
            filters.version !== "all") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setFilters({
                  search: "",
                  status: "all",
                  version: "all",
                  minScore: 0,
                })
              }
              className="shrink-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto" role="region" aria-label="pNodes data table" tabIndex={0}>
          <table className="w-full" aria-describedby="table-description">
            <caption id="table-description" className="sr-only">
              List of pNodes in the Xandeum network with their status, scores, and performance metrics
            </caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("xScore")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Score
                    {renderSortIcon("xScore")}
                  </button>
                </th>
                <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("pubkey")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Pubkey
                    {renderSortIcon("pubkey")}
                  </button>
                </th>
                <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("version")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Version
                    {renderSortIcon("version")}
                  </button>
                </th>
                <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("storage_usage_percent")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Storage
                    {renderSortIcon("storage_usage_percent")}
                  </button>
                </th>
                <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("uptime")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Uptime
                    {renderSortIcon("uptime")}
                  </button>
                </th>
                <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("last_seen_timestamp")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Last Seen
                    {renderSortIcon("last_seen_timestamp")}
                  </button>
                </th>
                <th scope="col" className="text-right py-3 px-4 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedNodes.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No pNodes found matching your filters
                  </td>
                </tr>
              ) : (
                filteredAndSortedNodes.map((node) => (
                  <tr
                    key={node.pubkey}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <XScoreBadge score={node.xScore} />
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={node.status} size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">
                          {truncateAddress(node.pubkey, 6)}
                        </code>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopyPubkey(node.pubkey)}
                            >
                              {copiedPubkey === node.pubkey ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedPubkey === node.pubkey
                              ? "Copied!"
                              : "Copy pubkey"}
                          </TooltipContent>
                        </Tooltip>
                        {node.is_public && (
                          <Badge variant="info" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary">{node.version}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatBytes(node.storage_used)} /{" "}
                          {formatBytes(node.storage_committed)}
                        </div>
                        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              node.storage_usage_percent > 80
                                ? "bg-red-500"
                                : node.storage_usage_percent > 50
                                ? "bg-yellow-500"
                                : "bg-emerald-500"
                            )}
                            style={{
                              width: `${Math.min(100, node.storage_usage_percent)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {formatUptime(node.uptime)}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {timeAgo(node.last_seen_timestamp)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/pnodes/${node.pubkey}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>View details</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
