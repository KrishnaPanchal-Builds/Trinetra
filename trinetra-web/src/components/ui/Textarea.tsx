import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  id?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      errorText,
      required,
      id: idProp,
      className = "",
      disabled,
      rows = 4,
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

        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          className={[
            "w-full rounded px-3 py-2.5 text-sm",
            "bg-surface-base text-text-primary placeholder:text-text-tertiary",
            "border border-border-default",
            "resize-y min-h-[80px]",
            "transition-colors duration-75",
            "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
            "disabled:bg-surface-subtle disabled:text-text-tertiary disabled:cursor-not-allowed",
            hasError ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

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

Textarea.displayName = "Textarea";
