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

export interface PodCredit {
  pod_id: string;
  credits: number;
}

export interface PodCreditsResponse {
  status: string;
  pods_credits: PodCredit[];
}

export interface PNodeWithScore extends PNode {
  xScore: number;
  status: "online" | "warning" | "offline";
  credits: number; // Official pod credits from API
  ip: string; // Extracted IP address
  port: number; // Extracted port
}

export interface GeoLocation {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  isp: string;
  org: string;
}

export interface PNodeWithGeo extends PNodeWithScore {
  geo?: GeoLocation;
}

export interface NetworkStats {
  totalNodes: number;
  onlineNodes: number;
  warningNodes: number;
  offlineNodes: number;
  publicNodes: number;
  privateNodes: number;
  totalStorageCommitted: number;
  totalStorageUsed: number;
  averageUptime: number;
  averageXScore: number;
  totalCredits: number;
  averageCredits: number;
  versionDistribution: Record<string, number>;
  countryDistribution: Record<string, number>;
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
