import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DividerProps extends React.HTMLAttributes<HTMLElement> {
  orientation?: "horizontal" | "vertical";
  /** Optional text label centered in the divider */
  label?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Divider({
  orientation = "horizontal",
  label,
  className = "",
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={[
          "w-px self-stretch bg-border-default shrink-0",
          className,
        ].join(" ")}
        {...props}
      />
    );
  }

  // Horizontal — with optional centered label
  if (label) {
    return (
      <div
        role="separator"
        className={["flex items-center gap-3", className].join(" ")}
        {...props}
      >
        <div className="flex-1 h-px bg-border-default" />
        <span className="text-xs text-text-tertiary font-medium select-none whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-border-default" />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      className={["border-none h-px bg-border-default w-full", className].join(
        " ",
      )}
      {...props}
    />
  );
}
