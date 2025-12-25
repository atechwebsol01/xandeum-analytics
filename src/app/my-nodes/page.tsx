"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  Plus,
  Trash2,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  HardDrive,
  Bell,
  BellOff,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePNodes } from "@/hooks/use-pnodes";
import { cn, formatBytes, formatCredits } from "@/lib/utils";

const STORAGE_KEY = "xandeum-my-nodes";
const MAX_NODES = 20;

interface SavedNode {
  pubkey: string;
  addedAt: string;
  nickname?: string;
  alertsEnabled: boolean;
}

export default function MyNodesPage() {
  const [savedNodes, setSavedNodes] = useState<SavedNode[]>([]);
  const [newPubkey, setNewPubkey] = useState("");
  const [nickname, setNickname] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const { data, isLoading, refetch, isFetching } = usePNodes();
  const allNodes = data?.success ? data.data.nodes : [];

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedNodes(JSON.parse(stored));
      } catch {
        setSavedNodes([]);
      }
    }
  }, []);

  // Save to localStorage when savedNodes changes
  useEffect(() => {
    if (isClient && savedNodes.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedNodes));
    }
  }, [savedNodes, isClient]);

  // Match saved nodes with live data
  const myNodesData = useMemo(() => {
    return savedNodes.map((saved) => {
      const liveNode = allNodes.find((n) => n.pubkey === saved.pubkey);
      return {
        ...saved,
        liveData: liveNode || null,
      };
    });
  }, [savedNodes, allNodes]);

  // Calculate summary stats for my nodes
  const summaryStats = useMemo(() => {
    const nodesWithData = myNodesData.filter((n) => n.liveData);
    const online = nodesWithData.filter((n) => n.liveData?.status === "online").length;
    const warning = nodesWithData.filter((n) => n.liveData?.status === "warning").length;
    const offline = nodesWithData.filter((n) => n.liveData?.status === "offline").length;
    const avgXScore = nodesWithData.length > 0
      ? nodesWithData.reduce((sum, n) => sum + (n.liveData?.xScore || 0), 0) / nodesWithData.length
      : 0;
    const totalCredits = nodesWithData.reduce((sum, n) => sum + (n.liveData?.credits || 0), 0);
    
    return { online, warning, offline, avgXScore, totalCredits, total: nodesWithData.length };
  }, [myNodesData]);

  const addNode = () => {
    const pubkey = newPubkey.trim();
    if (!pubkey) return;
    
    // Check if already added
    if (savedNodes.some((n) => n.pubkey === pubkey)) {
      alert("This node is already in your list!");
      return;
    }
    
    // Check max limit
    if (savedNodes.length >= MAX_NODES) {
      alert(`You can only save up to ${MAX_NODES} nodes.`);
      return;
    }
    
    // Check if node exists in network
    const exists = allNodes.some((n) => n.pubkey === pubkey);
    if (!exists) {
      const confirm = window.confirm(
        "This pubkey was not found in the current network data. Add anyway?"
      );
      if (!confirm) return;
    }
    
    setSavedNodes([
      ...savedNodes,
      {
        pubkey,
        addedAt: new Date().toISOString(),
        nickname: nickname.trim() || undefined,
        alertsEnabled: true,
      },
    ]);
    setNewPubkey("");
    setNickname("");
  };

  const removeNode = (pubkey: string) => {
    setSavedNodes(savedNodes.filter((n) => n.pubkey !== pubkey));
  };

  const toggleAlerts = (pubkey: string) => {
    setSavedNodes(
      savedNodes.map((n) =>
        n.pubkey === pubkey ? { ...n, alertsEnabled: !n.alertsEnabled } : n
      )
    );
  };

  const copyPubkey = (pubkey: string) => {
    navigator.clipboard.writeText(pubkey);
    setCopied(pubkey);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusIcon = (status?: string) => {
    if (status === "online") return <Wifi className="h-4 w-4 text-emerald-500" />;
    if (status === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <WifiOff className="h-4 w-4 text-red-500" />;
  };

  const getHealthRisk = (node: typeof myNodesData[0]) => {
    if (!node.liveData) return { level: "unknown", label: "Unknown", color: "text-muted-foreground" };
    
    const { xScore, credits, status } = node.liveData;
    
    if (status === "offline") return { level: "critical", label: "Critical", color: "text-red-500" };
    if (status === "warning") return { level: "warning", label: "At Risk", color: "text-yellow-500" };
    if (xScore < 30 || credits < 1000) return { level: "low", label: "Low Health", color: "text-orange-500" };
    if (xScore >= 70 && credits >= 10000) return { level: "excellent", label: "Excellent", color: "text-emerald-500" };
    return { level: "good", label: "Good", color: "text-blue-500" };
  };

  if (!isClient) {
    return (
      <div className="container py-8 px-4">
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
              <Star className="h-6 w-6 text-white" />
            </div>
            My Nodes
          </h1>
          <p className="text-muted-foreground">
            Track and monitor your favorite pNodes in one place
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Add Node Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-500" />
            Add a Node to Track
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter pNode pubkey..."
                value={newPubkey}
                onChange={(e) => setNewPubkey(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="w-full sm:w-48">
              <Input
                placeholder="Nickname (optional)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            <Button onClick={addNode} disabled={!newPubkey.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You can track up to {MAX_NODES} nodes. Data is stored locally in your browser.
          </p>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {savedNodes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-violet-500" />
                <div>
                  <p className="text-2xl font-bold">{summaryStats.total}</p>
                  <p className="text-xs text-muted-foreground">Tracked Nodes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold text-emerald-500">{summaryStats.online}</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-500">{summaryStats.warning + summaryStats.offline}</p>
                  <p className="text-xs text-muted-foreground">Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{summaryStats.avgXScore.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Avg X-Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{formatCredits(summaryStats.totalCredits)}</p>
                  <p className="text-xs text-muted-foreground">Total Credits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Node List */}
      {savedNodes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No Nodes Saved Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Add pNode pubkeys above to start tracking their performance. 
              Your data is stored locally and will persist across sessions.
            </p>
            <Link href="/pnodes">
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Browse All Nodes
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Tracked Nodes ({savedNodes.length})</h2>
          
          {myNodesData.map((node) => {
            const risk = getHealthRisk(node);
            const liveData = node.liveData;
            
            return (
              <Card 
                key={node.pubkey}
                className={cn(
                  "transition-all hover:shadow-md",
                  liveData?.status === "offline" && "border-red-500/50 bg-red-500/5",
                  liveData?.status === "warning" && "border-yellow-500/50 bg-yellow-500/5"
                )}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Status & Identity */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "p-2 rounded-lg",
                        liveData?.status === "online" ? "bg-emerald-500/10" :
                        liveData?.status === "warning" ? "bg-yellow-500/10" : "bg-red-500/10"
                      )}>
                        {getStatusIcon(liveData?.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {node.nickname && (
                            <span className="font-semibold">{node.nickname}</span>
                          )}
                          <Badge variant={liveData?.status === "online" ? "success" : liveData?.status === "warning" ? "warning" : "error"}>
                            {liveData?.status || "Unknown"}
                          </Badge>
                          <Badge variant="outline" className={risk.color}>
                            {risk.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs text-muted-foreground font-mono truncate">
                            {node.pubkey.slice(0, 16)}...{node.pubkey.slice(-8)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyPubkey(node.pubkey)}
                          >
                            {copied === node.pubkey ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    {liveData ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
                        <div className="text-center">
                          <p className="text-lg font-bold">{liveData.xScore}</p>
                          <p className="text-xs text-muted-foreground">X-Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{formatCredits(liveData.credits)}</p>
                          <p className="text-xs text-muted-foreground">Credits</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{Math.floor(liveData.uptime / 86400)}d</p>
                          <p className="text-xs text-muted-foreground">Uptime</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{formatBytes(liveData.storage_committed)}</p>
                          <p className="text-xs text-muted-foreground">Storage</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Node not found in current network data
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAlerts(node.pubkey)}
                        title={node.alertsEnabled ? "Disable alerts" : "Enable alerts"}
                      >
                        {node.alertsEnabled ? (
                          <Bell className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Link href={`/pnodes/${node.pubkey}`}>
                        <Button variant="ghost" size="icon" title="View details">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNode(node.pubkey)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        title="Remove from list"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Star className="h-6 w-6 text-amber-500 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Tips for Node Tracking</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your tracked nodes are saved locally in your browser</li>
                <li>• Health risk is calculated based on status, X-Score, and credits</li>
                <li>• Use nicknames to easily identify your nodes</li>
                <li>• Click on a node to view detailed performance metrics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
