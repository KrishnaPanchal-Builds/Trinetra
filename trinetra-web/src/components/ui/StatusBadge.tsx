import * as React from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Flag,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusValue =
  | "processing"
  | "completed"
  | "failed"
  | "queued"
  | "verified"
  | "flagged";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusValue;
  /** Show icon alongside label (default: true) */
  showIcon?: boolean;
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<
  StatusValue,
  {
    label: string;
    icon: React.ElementType;
    containerClass: string;
    iconClass: string;
    spin?: boolean;
  }
> = {
  processing: {
    label: "Processing",
    icon: Loader2,
    containerClass:
      "bg-status-processing-bg text-status-processing border border-status-processing/20",
    iconClass: "text-status-processing",
    spin: true,
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    containerClass:
      "bg-risk-low-bg text-risk-low border border-risk-low-border",
    iconClass: "text-risk-low",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    containerClass:
      "bg-status-failed-bg text-status-failed border border-status-failed/20",
    iconClass: "text-status-failed",
  },
  queued: {
    label: "Queued",
    icon: Clock,
    containerClass:
      "bg-surface-subtle text-text-secondary border border-border-default",
    iconClass: "text-text-tertiary",
  },
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    containerClass:
      "bg-risk-low-bg text-risk-low border border-risk-low-border",
    iconClass: "text-risk-low",
  },
  flagged: {
    label: "Flagged",
    icon: Flag,
    containerClass:
      "bg-risk-high-bg text-risk-high border border-risk-high-border",
    iconClass: "text-risk-high",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function StatusBadge({
  status,
  showIcon = true,
  className = "",
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      role="status"
      aria-label={config.label}
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-sm px-1.5 py-0.5",
        "text-[11px] font-medium leading-4 tracking-wide",
        "font-mono uppercase whitespace-nowrap select-none",
        config.containerClass,
        className,
      ].join(" ")}
      {...props}
    >
      {showIcon && (
        <Icon
          className={`size-3 shrink-0 ${config.iconClass} ${config.spin ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
