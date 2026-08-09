"use client";

import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TooltipProps {
  /** The content shown in the tooltip */
  content: React.ReactNode;
  /** Element that triggers the tooltip */
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  /** Preferred position */
  side?: "top" | "bottom" | "left" | "right";
  /** Delay before tooltip appears in ms */
  delayMs?: number;
}

// ─── Position classes ─────────────────────────────────────────────────────────

const sideClasses: Record<NonNullable<TooltipProps["side"]>, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Tooltip({
  content,
  children,
  side = "top",
  delayMs = 200,
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = React.useId();

  const show = React.useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), delayMs);
  }, [delayMs]);

  const hide = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Extract existing handlers from props so we can compose them
  const childProps = children.props;

  const trigger = React.cloneElement(children, {
    "aria-describedby": visible ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      show();
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      hide();
      childProps.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      show();
      childProps.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      hide();
      childProps.onBlur?.(e);
    },
  });

  return (
    <span className="relative inline-flex">
      {trigger}

      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={[
            "absolute z-50 pointer-events-none",
            "px-2 py-1 rounded",
            "bg-text-primary text-text-inverse",
            "text-xs font-medium leading-4 whitespace-nowrap",
            "shadow-[0_1px_4px_rgba(15,23,42,0.15)]",
            sideClasses[side],
          ].join(" ")}
        >
          {content}
        </span>
      )}
    </span>
  );
}
