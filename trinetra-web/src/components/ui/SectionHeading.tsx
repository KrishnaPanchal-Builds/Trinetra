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
        "flex gap-3",
        isCenter
          ? "flex-col items-center text-center"
          : "flex-col sm:flex-row sm:items-start sm:justify-between",
        className,
      ].join(" ")}
    >
      {/* Left column: eyebrow + title + description */}
      <div className={["flex flex-col gap-2", isCenter ? "items-center" : ""].join(" ")}>
        {eyebrow && (
          <p className="text-[11px] font-semibold font-mono uppercase tracking-[0.08em] text-brand-500">
            {eyebrow}
          </p>
        )}

        <Tag
          className={[
            "font-semibold text-text-primary tracking-tight",
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
      </div>

      {/* Right column: action — stacks below on mobile, aligns right on sm+ */}
      {action && (
        <div className={["shrink-0", isCenter ? "mt-1" : "sm:mt-0.5"].join(" ")}>
          {action}
        </div>
      )}
    </div>
  );
}
