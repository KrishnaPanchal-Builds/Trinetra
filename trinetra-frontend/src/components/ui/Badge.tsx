import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeVariant =
  | "default"
  | "subtle"
  | "video"
  | "audio"
  | "image"
  | "document"
  | "api"
  | "sandbox"
  | "production";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

// ─── Style map ────────────────────────────────────────────────────────────────

const variantClasses: Record<BadgeVariant, string> = {
  // Neutral default — used for arbitrary category labels
  default:
    "bg-surface-subtle text-text-secondary border border-border-default",
  subtle:
    "bg-surface-raised text-text-tertiary border border-border-default",

  // Media-type badges — neutral palette, slight tint differentiators
  video:
    "bg-surface-subtle text-text-primary border border-border-default",
  audio:
    "bg-surface-subtle text-text-primary border border-border-default",
  image:
    "bg-surface-subtle text-text-primary border border-border-default",
  document:
    "bg-surface-subtle text-text-primary border border-border-default",

  // Context badges
  api:
    "bg-brand-50 text-brand-600 border border-brand-100",
  sandbox:
    "bg-surface-subtle text-text-secondary border border-border-default",
  production:
    "bg-risk-low-bg text-risk-low border border-risk-low-border",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        // Base — rectangular, compact, mono-label sizing
        "inline-flex items-center gap-1",
        "rounded-sm px-1.5 py-0.5",
        "text-[11px] font-medium leading-4 tracking-wide",
        "font-mono uppercase",
        "whitespace-nowrap select-none",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
