import { cn } from "@/lib/utils";
import { getScoreColor, getScoreBgColor } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface XScoreBadgeProps {
  score: number;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
}

export function XScoreBadge({
  score,
  showTooltip = true,
  size = "md",
}: XScoreBadgeProps) {
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const badge = (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border font-bold",
        sizeClasses[size],
        getScoreBgColor(score),
        getScoreColor(score)
      )}
    >
      {score}
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1 text-xs">
          <p className="font-semibold">X-Score: {score}/100</p>
          <p className="text-muted-foreground">
            {score >= 80 && "Excellent performance"}
            {score >= 60 && score < 80 && "Good performance"}
            {score >= 40 && score < 60 && "Needs improvement"}
            {score < 40 && "Poor performance"}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
