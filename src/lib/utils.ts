import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes <= 0 || !isFinite(bytes)) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeIndex = Math.min(i, sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, safeIndex)).toFixed(dm)) + " " + sizes[safeIndex];
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

export function truncateAddress(address: string | null | undefined, chars = 8): string {
  if (!address) return "Unknown";
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatCredits(credits: number): string {
  if (credits >= 1000000) {
    return `${(credits / 1000000).toFixed(1)}M`;
  }
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}K`;
  }
  return credits.toLocaleString();
}

export function getCreditsColor(credits: number): string {
  if (credits >= 40000) return "text-emerald-500";
  if (credits >= 20000) return "text-blue-500";
  if (credits >= 10000) return "text-yellow-500";
  if (credits >= 1000) return "text-orange-500";
  return "text-red-500";
}

export function getCreditsLevel(credits: number): string {
  if (credits >= 40000) return "Excellent";
  if (credits >= 20000) return "Good";
  if (credits >= 10000) return "Moderate";
  if (credits >= 1000) return "Low";
  return "Very Low";
}

export function calculateXScore(node: {
  uptime: number;
  storage_usage_percent: number;
  is_public: boolean;
  last_seen_timestamp: number;
}, credits: number = 0): number {
  const now = Math.floor(Date.now() / 1000);
  const timeSinceLastSeen = now - node.last_seen_timestamp;
  
  let score = 0;
  
  // Pod Credits score (max 35 points) - official reputation metric
  // Credits typically range from 0 to 55000+ based on activity
  // Scale: 0-10k = linear to 20 pts, 10k-50k = additional 15 pts
  if (credits > 0) {
    const creditsScore = Math.min(20, (credits / 10000) * 20);
    const bonusScore = credits > 10000 ? Math.min(15, ((credits - 10000) / 40000) * 15) : 0;
    score += creditsScore + bonusScore;
  }
  
  // Uptime score (max 25 points)
  const uptimeDays = node.uptime / 86400;
  score += Math.min(25, uptimeDays * 0.5);
  
  // Availability score (max 25 points) - based on last seen
  if (timeSinceLastSeen < 60) score += 25;
  else if (timeSinceLastSeen < 120) score += 22;
  else if (timeSinceLastSeen < 300) score += 18;
  else if (timeSinceLastSeen < 600) score += 12;
  else if (timeSinceLastSeen < 3600) score += 6;
  else score += 2;
  
  // Storage commitment score (max 10 points)
  // Reward nodes that have committed storage and are using it
  if (node.storage_usage_percent > 0) {
    score += Math.min(10, node.storage_usage_percent * 0.1);
  }
  
  // Public accessibility bonus (max 5 points)
  if (node.is_public) score += 5;
  
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
