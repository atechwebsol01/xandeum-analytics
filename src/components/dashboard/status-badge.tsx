import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "online" | "warning" | "offline";
  showLabel?: boolean;
  size?: "sm" | "md";
}

const statusConfig = {
  online: {
    label: "Online",
    dotClass: "bg-emerald-500",
    ringClass: "ring-emerald-500/20",
    textClass: "text-emerald-500",
  },
  warning: {
    label: "Warning",
    dotClass: "bg-yellow-500",
    ringClass: "ring-yellow-500/20",
    textClass: "text-yellow-500",
  },
  offline: {
    label: "Offline",
    dotClass: "bg-red-500",
    ringClass: "ring-red-500/20",
    textClass: "text-red-500",
  },
};

export function StatusBadge({
  status,
  showLabel = true,
  size = "md",
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const dotSize = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";

  return (
    <div className="flex items-center gap-2">
      <span className={cn("relative flex", dotSize)}>
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            status === "online" && config.dotClass
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-full w-full rounded-full ring-2",
            config.dotClass,
            config.ringClass
          )}
        />
      </span>
      {showLabel && (
        <span className={cn("text-sm font-medium", config.textClass)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
