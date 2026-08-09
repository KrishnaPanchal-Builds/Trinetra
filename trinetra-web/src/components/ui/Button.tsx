import * as React from "react";
import { Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Icon rendered before the label */
  leadingIcon?: React.ReactNode;
  /** Icon rendered after the label */
  trailingIcon?: React.ReactNode;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-brand-500 text-text-inverse border border-brand-500",
    "hover:bg-brand-600 hover:border-brand-600",
    "active:bg-brand-600",
    "disabled:bg-brand-100 disabled:text-brand-400 disabled:border-brand-100",
  ].join(" "),

  secondary: [
    "bg-surface-base text-text-primary border border-border-default",
    "hover:bg-surface-subtle",
    "active:bg-surface-raised",
    "disabled:text-text-tertiary disabled:border-border-default",
  ].join(" "),

  ghost: [
    "bg-transparent text-text-secondary border border-transparent",
    "hover:bg-surface-subtle hover:text-text-primary",
    "active:bg-surface-raised",
    "disabled:text-text-tertiary",
  ].join(" "),

  danger: [
    "bg-risk-critical text-text-inverse border border-risk-critical",
    "hover:opacity-90",
    "active:opacity-100",
    "disabled:bg-risk-critical-bg disabled:text-risk-critical disabled:border-risk-critical-border",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5 rounded",
  md: "h-9 px-3.5 text-sm gap-1.5 rounded",
  lg: "h-11 px-4.5 text-sm gap-2 rounded-md",
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-4",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      loading = false,
      leadingIcon,
      trailingIcon,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={[
          // Base
          "inline-flex items-center justify-center font-medium",
          "whitespace-nowrap select-none",
          "transition-colors duration-75",
          "focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          // Variant + size
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {/* Leading icon or spinner */}
        {loading ? (
          <Loader2
            className={`${iconSizeClasses[size]} animate-spin shrink-0`}
            aria-hidden="true"
          />
        ) : (
          leadingIcon && (
            <span className={`${iconSizeClasses[size]} shrink-0`} aria-hidden="true">
              {leadingIcon}
            </span>
          )
        )}

        {/* Label */}
        {children && <span>{children}</span>}

        {/* Trailing icon (hidden during loading to avoid shift) */}
        {!loading && trailingIcon && (
          <span className={`${iconSizeClasses[size]} shrink-0`} aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
