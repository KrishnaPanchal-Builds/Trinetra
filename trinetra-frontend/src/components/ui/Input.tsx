import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  /** Icon rendered inside the input on the left */
  leadingIcon?: React.ReactNode;
  /** Icon or element rendered inside the input on the right */
  trailingIcon?: React.ReactNode;
  /** Renders the required asterisk and sets aria-required */
  required?: boolean;
  /** ID used to link label + input + helper/error. Auto-generated if omitted. */
  id?: string;
}

// ─── Shared base classes ──────────────────────────────────────────────────────

const inputBase = [
  "w-full h-9 rounded px-3 text-sm",
  "bg-surface-base text-text-primary placeholder:text-text-tertiary",
  "border border-border-default",
  "transition-colors duration-75",
  "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
  "disabled:bg-surface-subtle disabled:text-text-tertiary disabled:cursor-not-allowed",
  "read-only:bg-surface-subtle",
].join(" ");

const inputError = "border-red-400 focus:border-red-500 focus:ring-red-500/15";

// ─── Component ────────────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      leadingIcon,
      trailingIcon,
      required,
      id: idProp,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    // Stable ID for label association
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
        {/* Label */}
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

        {/* Input wrapper — handles icon positioning */}
        <div className="relative flex items-center">
          {leadingIcon && (
            <span
              className="pointer-events-none absolute left-3 flex size-4 items-center justify-center text-text-tertiary"
              aria-hidden="true"
            >
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-required={required}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
            className={[
              inputBase,
              hasError ? inputError : "",
              leadingIcon ? "pl-9" : "",
              trailingIcon ? "pr-9" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {trailingIcon && (
            <span
              className="pointer-events-none absolute right-3 flex size-4 items-center justify-center text-text-tertiary"
              aria-hidden="true"
            >
              {trailingIcon}
            </span>
          )}
        </div>

        {/* Error text — shown above helper when present */}
        {hasError && (
          <p id={errorId} className="text-xs text-risk-critical leading-none" role="alert">
            {errorText}
          </p>
        )}

        {/* Helper text */}
        {helperText && !hasError && (
          <p id={helperId} className="text-xs text-text-tertiary leading-none">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
