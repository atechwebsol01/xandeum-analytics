import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function truncateAddress(address: string, chars = 8): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function calculateXScore(node: {
  uptime: number;
  storage_usage_percent: number;
  is_public: boolean;
  last_seen_timestamp: number;
}): number {
  const now = Math.floor(Date.now() / 1000);
  const timeSinceLastSeen = now - node.last_seen_timestamp;
  
  let score = 0;
  
  // Uptime score (max 40 points)
  const uptimeDays = node.uptime / 86400;
  score += Math.min(40, uptimeDays * 2);
  
  // Storage utilization score (max 25 points)
  score += Math.min(25, node.storage_usage_percent * 0.25);
  
  // Availability score (max 25 points) - based on last seen
  if (timeSinceLastSeen < 60) score += 25;
  else if (timeSinceLastSeen < 300) score += 20;
  else if (timeSinceLastSeen < 900) score += 15;
  else if (timeSinceLastSeen < 3600) score += 10;
  else score += 5;
  
  // Public accessibility bonus (max 10 points)
  if (node.is_public) score += 10;
  
  return Math.round(Math.min(100, score));
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20";
  if (score >= 40) return "bg-orange-500/10 border-orange-500/20";
  return "bg-red-500/10 border-red-500/20";
}

export function getStatusColor(lastSeen: number): "online" | "warning" | "offline" {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - lastSeen;
  
  if (diff < 120) return "online";
  if (diff < 600) return "warning";
  return "offline";
}
