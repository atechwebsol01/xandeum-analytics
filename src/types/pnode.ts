export interface PNode {
  pubkey: string;
  address: string;
  rpc_port: number;
  version: string;
  is_public: boolean;
  last_seen_timestamp: number;
  storage_committed: number;
  storage_used: number;
  storage_usage_percent: number;
  uptime: number;
}

export interface PNodeWithScore extends PNode {
  xScore: number;
  status: "online" | "warning" | "offline";
}

export interface NetworkStats {
  totalNodes: number;
  onlineNodes: number;
  totalStorageCommitted: number;
  totalStorageUsed: number;
  averageUptime: number;
  averageXScore: number;
  versionDistribution: Record<string, number>;
}

export interface PRPCResponse<T> {
  jsonrpc: string;
  result: T;
  id: number;
}

export interface PRPCError {
  jsonrpc: string;
  error: {
    code: number;
    message: string;
  };
  id: number;
}

export interface GetPodsResponse {
  pods: PNode[];
}

export interface GetVersionResponse {
  version: string;
}

export interface GetStatsResponse {
  stats: {
    cpu_percent: number;
    memory_percent: number;
    disk_percent: number;
    uptime: number;
  };
}

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: keyof PNodeWithScore;
  direction: SortDirection;
}

export interface FilterConfig {
  search: string;
  status: "all" | "online" | "warning" | "offline";
  version: string;
  minScore: number;
}
