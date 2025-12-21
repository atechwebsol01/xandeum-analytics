import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cn,
  formatBytes,
  formatUptime,
  formatTimestamp,
  timeAgo,
  truncateAddress,
  calculateXScore,
  getScoreColor,
  getScoreBgColor,
  getStatusColor,
} from "./utils";

describe("cn (classname merge)", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});

describe("formatBytes", () => {
  it("formats 0 bytes correctly", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });

  it("formats bytes correctly", () => {
    expect(formatBytes(500)).toBe("500 Bytes");
  });

  it("formats kilobytes correctly", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats megabytes correctly", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
  });

  it("formats gigabytes correctly", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("formats terabytes correctly", () => {
    expect(formatBytes(1099511627776)).toBe("1 TB");
  });

  it("respects decimal places", () => {
    expect(formatBytes(1536, 1)).toBe("1.5 KB");
  });

  it("handles negative values", () => {
    expect(formatBytes(-100)).toBe("0 Bytes");
  });

  it("handles NaN", () => {
    expect(formatBytes(NaN)).toBe("0 Bytes");
  });

  it("handles Infinity", () => {
    expect(formatBytes(Infinity)).toBe("0 Bytes");
  });
});

describe("formatUptime", () => {
  it("formats minutes only", () => {
    expect(formatUptime(300)).toBe("5m");
  });

  it("formats hours and minutes", () => {
    expect(formatUptime(3700)).toBe("1h 1m");
  });

  it("formats days, hours, and minutes", () => {
    expect(formatUptime(90061)).toBe("1d 1h 1m");
  });

  it("handles 0 seconds", () => {
    expect(formatUptime(0)).toBe("0m");
  });
});

describe("formatTimestamp", () => {
  it("formats unix timestamp to locale string", () => {
    const timestamp = 1700000000;
    const result = formatTimestamp(timestamp);
    expect(result).toContain("2023");
  });
});

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows seconds ago", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(timeAgo(now - 30)).toBe("30s ago");
  });

  it("shows minutes ago", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(timeAgo(now - 120)).toBe("2m ago");
  });

  it("shows hours ago", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(timeAgo(now - 7200)).toBe("2h ago");
  });

  it("shows days ago", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(timeAgo(now - 172800)).toBe("2d ago");
  });
});

describe("truncateAddress", () => {
  it("truncates long addresses", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";
    expect(truncateAddress(address, 8)).toBe("0x123456...12345678");
  });

  it("returns short addresses unchanged", () => {
    const address = "0x1234";
    expect(truncateAddress(address, 8)).toBe("0x1234");
  });

  it("handles null address", () => {
    expect(truncateAddress(null)).toBe("Unknown");
  });

  it("handles undefined address", () => {
    expect(truncateAddress(undefined)).toBe("Unknown");
  });

  it("handles empty string", () => {
    expect(truncateAddress("")).toBe("Unknown");
  });
});

describe("calculateXScore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates score for a high-performing node with credits", () => {
    const node = {
      uptime: 2592000, // 30 days
      storage_usage_percent: 80,
      is_public: true,
      last_seen_timestamp: Math.floor(Date.now() / 1000) - 30,
    };
    // With high credits (45000), should get high score
    const score = calculateXScore(node, 45000);
    expect(score).toBeGreaterThanOrEqual(75);
  });

  it("calculates score for a low-performing node", () => {
    const node = {
      uptime: 3600, // 1 hour
      storage_usage_percent: 10,
      is_public: false,
      last_seen_timestamp: Math.floor(Date.now() / 1000) - 7200,
    };
    // With no credits, should get low score
    const score = calculateXScore(node, 0);
    expect(score).toBeLessThan(40);
  });

  it("caps score at 100", () => {
    const node = {
      uptime: 8640000, // 100 days
      storage_usage_percent: 100,
      is_public: true,
      last_seen_timestamp: Math.floor(Date.now() / 1000),
    };
    // Even with very high credits
    const score = calculateXScore(node, 100000);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("getScoreColor", () => {
  it("returns emerald for high scores", () => {
    expect(getScoreColor(85)).toBe("text-emerald-500");
  });

  it("returns yellow for medium scores", () => {
    expect(getScoreColor(65)).toBe("text-yellow-500");
  });

  it("returns orange for low scores", () => {
    expect(getScoreColor(45)).toBe("text-orange-500");
  });

  it("returns red for very low scores", () => {
    expect(getScoreColor(30)).toBe("text-red-500");
  });
});

describe("getScoreBgColor", () => {
  it("returns correct bg color for high scores", () => {
    expect(getScoreBgColor(85)).toContain("emerald");
  });

  it("returns correct bg color for low scores", () => {
    expect(getScoreBgColor(30)).toContain("red");
  });
});

describe("getStatusColor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns online for recent activity", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(getStatusColor(now - 60)).toBe("online");
  });

  it("returns warning for moderate delay", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(getStatusColor(now - 300)).toBe("warning");
  });

  it("returns offline for long delay", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(getStatusColor(now - 1000)).toBe("offline");
  });
});
