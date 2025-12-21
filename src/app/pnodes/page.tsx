"use client";

import { RefreshCw, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PNodeTable } from "@/components/dashboard/pnode-table";
import { NodeComparison } from "@/components/dashboard/node-comparison";
import { usePNodes } from "@/hooks/use-pnodes";
import { cn, timeAgo } from "@/lib/utils";

export default function PNodesPage() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } =
    usePNodes();

  const nodes = data?.success ? data.data.nodes : [];
  const apiError = data?.success === false ? data?.error : null;

  const handleExport = () => {
    const csv = [
      [
        "Pubkey",
        "Address",
        "Version",
        "Status",
        "X-Score",
        "Storage Committed",
        "Storage Used",
        "Usage %",
        "Uptime (s)",
        "Last Seen",
        "Is Public",
      ].join(","),
      ...nodes.map((node) =>
        [
          node.pubkey,
          node.address,
          node.version,
          node.status,
          node.xScore,
          node.storage_committed,
          node.storage_used,
          node.storage_usage_percent.toFixed(2),
          node.uptime,
          node.last_seen_timestamp,
          node.is_public,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xandeum-pnodes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">pNodes Explorer</h1>
          <p className="text-muted-foreground">
            Browse and analyze all pNodes in the Xandeum network
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dataUpdatedAt && !isError && !apiError && (
            <span className="text-sm text-muted-foreground">
              Updated {timeAgo(Math.floor(dataUpdatedAt / 1000))}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isLoading || nodes.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {(isError || apiError) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">
                Failed to load pNode data
              </p>
              <p className="text-sm text-muted-foreground">
                {apiError || "Unable to connect to Xandeum pRPC endpoints. Please try again."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Node Comparison Tool */}
      {!isLoading && nodes.length > 0 && (
        <NodeComparison nodes={nodes} />
      )}

      {/* pNode Table */}
      <PNodeTable nodes={nodes} isLoading={isLoading} />
    </div>
  );
}
