import * as React from "react";
import type { AESScore, RiskLevel } from "@/types/common";
import { aesToRiskLevel, RISK_LEVEL_LABELS } from "@/types/common";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  riskLevel: RiskLevel;
  showDot?: boolean;
}

export interface AESScoreDisplayProps {
  score: AESScore;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

// ─── Risk color maps ──────────────────────────────────────────────────────────

const riskColorMap: Record<
  RiskLevel,
  { text: string; bg: string; border: string; dot: string }
> = {
  critical: {
    text: "text-risk-critical",
    bg: "bg-risk-critical-bg",
    border: "border-risk-critical-border",
    dot: "bg-risk-critical",
  },
  high: {
    text: "text-risk-high",
    bg: "bg-risk-high-bg",
    border: "border-risk-high-border",
    dot: "bg-risk-high",
  },
  medium: {
    text: "text-risk-medium",
    bg: "bg-risk-medium-bg",
    border: "border-risk-medium-border",
    dot: "bg-risk-medium",
  },
  low: {
    text: "text-risk-low",
    bg: "bg-risk-low-bg",
    border: "border-risk-low-border",
    dot: "bg-risk-low",
  },
};

const aesTextColor: Record<RiskLevel, string> = {
  critical: "text-risk-critical",
  high: "text-risk-high",
  medium: "text-risk-medium",
  low: "text-risk-low",
};

// ─── RiskBadge ────────────────────────────────────────────────────────────────

export function RiskBadge({
  riskLevel,
  showDot = true,
  className = "",
  ...props
}: RiskBadgeProps) {
  const colors = riskColorMap[riskLevel];
  const label = RISK_LEVEL_LABELS[riskLevel];

  return (
    <span
      aria-label={`Risk level: ${label}`}
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-sm px-1.5 py-0.5",
        "text-[11px] font-mono font-medium leading-4 tracking-wide uppercase whitespace-nowrap select-none",
        "border",
        colors.text,
        colors.bg,
        colors.border,
        className,
      ].join(" ")}
      {...props}
    >
      {showDot && (
        <span className={`size-1.5 rounded-full shrink-0 ${colors.dot}`} aria-hidden="true" />
      )}
      {label}
    </span>
  );
}

// ─── AESScoreDisplay ──────────────────────────────────────────────────────────

const aesScoreSizeMap = {
  sm: {
    number: "text-xl font-semibold font-mono",
    denom: "text-xs font-mono text-text-tertiary",
    badge: "mt-0.5",
  },
  md: {
    number: "text-3xl font-semibold font-mono",
    denom: "text-sm font-mono text-text-tertiary",
    badge: "mt-1",
  },
  lg: {
    number: "text-5xl font-bold font-mono",
    denom: "text-base font-mono text-text-tertiary",
    badge: "mt-2",
  },
};

export function AESScoreDisplay({
  score,
  size = "md",
  showLabel = true,
  className = "",
}: AESScoreDisplayProps) {
  const riskLevel = aesToRiskLevel(score);
  const colors = aesTextColor[riskLevel];
  const sizes = aesScoreSizeMap[size];

  return (
    <div className={["flex flex-col items-start gap-1", className].join(" ")}>
      <div className="flex items-baseline gap-1">
        <span className={[sizes.number, colors].join(" ")} aria-label={`AES Score: ${score} out of 100`}>
          {score}
        </span>
        <span className={sizes.denom}>/100</span>
      </div>
      {showLabel && (
        <div className={sizes.badge}>
          <RiskBadge riskLevel={riskLevel} />
        </div>
      )}
    </div>
  );
}
