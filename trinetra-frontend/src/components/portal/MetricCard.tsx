import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  /** Secondary descriptor shown below value */
  subtext?: string;
  /** Optional icon rendered top-right */
  icon?: LucideIcon;
  /** Optional delta indicator */
  delta?: {
    value: string;
    direction: "up" | "down" | "neutral";
    /** Whether up is good or bad (default: good) */
    positiveDirection?: "up" | "down";
  };
  /** Danger / warning / brand color accent on the value text */
  valueVariant?: "default" | "danger" | "warning" | "success" | "brand";
  /** Horizontal progress bar for quota/credit display */
  progress?: {
    current: number;
    max: number;
    label?: string;
  };
  className?: string;
}

// ─── Value color map ──────────────────────────────────────────────────────────

const valueColorMap: Record<NonNullable<MetricCardProps["valueVariant"]>, string> = {
  default: "text-text-primary",
  danger: "text-risk-critical",
  warning: "text-risk-high",
  success: "text-risk-low",
  brand: "text-brand-500",
};

const progressColorMap: Record<NonNullable<MetricCardProps["valueVariant"]>, string> = {
  default: "bg-brand-500",
  danger: "bg-risk-critical",
  warning: "bg-risk-high",
  success: "bg-risk-low",
  brand: "bg-brand-500",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MetricCard({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  delta,
  valueVariant = "default",
  progress,
  className = "",
}: MetricCardProps) {
  const isDeltaPositive =
    delta?.direction === (delta?.positiveDirection ?? "up");

  const deltaColorClass = delta?.direction === "neutral"
    ? "text-text-tertiary"
    : isDeltaPositive
    ? "text-risk-low"
    : "text-risk-high";

  const DeltaIcon =
    delta?.direction === "up"
      ? TrendingUp
      : delta?.direction === "down"
      ? TrendingDown
      : Minus;

  const progressPct = progress
    ? Math.min(100, Math.round((progress.current / progress.max) * 100))
    : null;

  return (
    <div
      className={[
        "bg-surface-base border border-border-default rounded-md p-4 flex flex-col gap-3",
        className,
      ].join(" ")}
    >
      {/* Header row: label + icon */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider leading-tight">
          {label}
        </p>
        {Icon && (
          <Icon className="size-4 text-text-tertiary shrink-0 mt-0.5" aria-hidden="true" />
        )}
      </div>

      {/* Value row */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1 min-w-0">
          <span
            className={[
              "text-2xl font-semibold font-mono leading-none truncate",
              valueColorMap[valueVariant],
            ].join(" ")}
          >
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-text-tertiary shrink-0">{unit}</span>
          )}
        </div>

        {/* Delta */}
        {delta && (
          <div className={["flex items-center gap-1 shrink-0", deltaColorClass].join(" ")}>
            <DeltaIcon className="size-3.5" aria-hidden="true" />
            <span className="font-mono text-xs font-semibold">{delta.value}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {progress && progressPct !== null && (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden">
            <div
              className={["h-full rounded-full transition-all", progressColorMap[valueVariant]].join(" ")}
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={progress.label ?? label}
            />
          </div>
          {progress.label && (
            <p className="text-[10px] font-mono text-text-tertiary">{progress.label}</p>
          )}
        </div>
      )}

      {/* Subtext */}
      {subtext && (
        <p className="text-[11px] text-text-tertiary leading-tight">{subtext}</p>
      )}
    </div>
  );
}
