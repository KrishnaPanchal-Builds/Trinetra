import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SectionHeadingProps {
  /** Small overline label above the title */
  eyebrow?: string;
  /** Main heading — rendered as the appropriate h-level */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Heading level (default: 2) */
  as?: "h1" | "h2" | "h3" | "h4";
  /** Slot for an action element aligned to the right */
  action?: React.ReactNode;
  /** Text alignment (default: left) */
  align?: "left" | "center";
  /** className on the outer container */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Tag = "h2",
  action,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={[
        "flex gap-4",
        isCenter ? "flex-col items-center text-center" : "flex-col",
        className,
      ].join(" ")}
    >
      {/* Top row: eyebrow / action */}
      {(eyebrow || action) && (
        <div
          className={[
            "flex items-center",
            isCenter ? "justify-center" : "justify-between",
            "gap-4",
          ].join(" ")}
        >
          {eyebrow && (
            <p className="text-[11px] font-semibold font-mono uppercase tracking-[0.08em] text-brand-500">
              {eyebrow}
            </p>
          )}
          {/* When centered, action goes below — skip it here */}
          {!isCenter && action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Title row — when not centered, action can be inline */}
      <div
        className={[
          "flex items-start",
          isCenter ? "justify-center" : "justify-between",
          "gap-4",
        ].join(" ")}
      >
        <Tag
          className={[
            "font-semibold text-text-primary tracking-tight",
            // Size by heading level
            Tag === "h1" ? "text-3xl leading-10" : "",
            Tag === "h2" ? "text-2xl leading-8" : "",
            Tag === "h3" ? "text-xl leading-7" : "",
            Tag === "h4" ? "text-lg leading-6" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {title}
        </Tag>

        {/* Action inline with title when left-aligned and no eyebrow */}
        {!isCenter && !eyebrow && action && (
          <div className="shrink-0 mt-0.5">{action}</div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p
          className={[
            "text-sm text-text-secondary leading-6",
            isCenter ? "max-w-xl" : "max-w-2xl",
          ].join(" ")}
        >
          {description}
        </p>
      )}

      {/* Action below when center-aligned */}
      {isCenter && action && <div className="mt-1">{action}</div>}
    </div>
  );
}
