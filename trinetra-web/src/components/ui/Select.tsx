import * as React from "react";
import { ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  /** Placeholder option (disabled, selected by default) */
  placeholder?: string;
  required?: boolean;
  id?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      errorText,
      placeholder,
      required,
      id: idProp,
      className = "",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const stableId = React.useId();
    const id = idProp ?? stableId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;
    const hasError = Boolean(errorText);
    const describedBy =
      [hasError ? errorId : null, helperText ? helperId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-text-primary leading-none"
          >
            {label}
            {required && (
              <span className="ml-1 text-risk-critical" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Wrapper provides the custom chevron icon */}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-required={required}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
            className={[
              // Base
              "w-full h-9 appearance-none rounded px-3 pr-9 text-sm",
              "bg-surface-base text-text-primary",
              "border border-border-default",
              "transition-colors duration-75",
              "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
              "disabled:bg-surface-subtle disabled:text-text-tertiary disabled:cursor-not-allowed",
              hasError ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          {/* Chevron icon — pointer-events-none so clicks pass through */}
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary"
            aria-hidden="true"
          />
        </div>

        {hasError && (
          <p id={errorId} className="text-xs text-risk-critical leading-none" role="alert">
            {errorText}
          </p>
        )}

        {helperText && !hasError && (
          <p id={helperId} className="text-xs text-text-tertiary leading-none">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
