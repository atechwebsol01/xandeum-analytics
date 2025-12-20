import { describe, it, expect } from "vitest";
import type {
  PNode,
  PNodeWithScore,
  NetworkStats,
  SortConfig,
  FilterConfig,
} from "./pnode";

describe("PNode Types", () => {
  it("PNode type has correct shape", () => {
    const pnode: PNode = {
      pubkey: "sample-node-identifier-for-testing-purposes-only",
      address: "10.0.0.1:8000",
      rpc_port: 8000,
      version: "1.0.0",
      is_public: true,
      last_seen_timestamp: 1700000000,
      storage_committed: 1000000000,
      storage_used: 500000000,
      storage_usage_percent: 50,
      uptime: 86400,
    };

    expect(pnode.pubkey).toBe("sample-node-identifier-for-testing-purposes-only");
    expect(pnode.is_public).toBe(true);
  });

  it("PNodeWithScore extends PNode correctly", () => {
    const pnodeWithScore: PNodeWithScore = {
      pubkey: "sample-node-identifier-for-testing-purposes-only",
      address: "10.0.0.1:8000",
      rpc_port: 8000,
      version: "1.0.0",
      is_public: true,
      last_seen_timestamp: 1700000000,
      storage_committed: 1000000000,
      storage_used: 500000000,
      storage_usage_percent: 50,
      uptime: 86400,
      xScore: 85,
      status: "online",
    };

    expect(pnodeWithScore.xScore).toBe(85);
    expect(pnodeWithScore.status).toBe("online");
  });

  it("NetworkStats type has correct shape", () => {
    const stats: NetworkStats = {
      totalNodes: 100,
      onlineNodes: 95,
      totalStorageCommitted: 1000000000000,
      totalStorageUsed: 500000000000,
      averageUptime: 86400,
      averageXScore: 75,
      versionDistribution: {
        "1.0.0": 50,
        "1.1.0": 45,
        "0.9.0": 5,
      },
    };

    expect(stats.totalNodes).toBe(100);
    expect(stats.versionDistribution["1.0.0"]).toBe(50);
  });

  it("SortConfig type has correct shape", () => {
    const sortConfig: SortConfig = {
      key: "xScore",
      direction: "desc",
    };

    expect(sortConfig.key).toBe("xScore");
    expect(sortConfig.direction).toBe("desc");
  });

  it("FilterConfig type has correct shape", () => {
    const filterConfig: FilterConfig = {
      search: "test",
      status: "online",
      version: "1.0.0",
      minScore: 50,
    };

    expect(filterConfig.search).toBe("test");
    expect(filterConfig.status).toBe("online");
  });
});
