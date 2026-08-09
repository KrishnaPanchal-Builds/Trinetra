"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CodeBlockProps {
  /** The code string to display */
  code: string;
  /** Language label shown in the header (e.g. "bash", "json", "python") */
  language?: string;
  /** Optional filename shown in the header */
  filename?: string;
  /** Show line numbers (default: false) */
  showLineNumbers?: boolean;
  /** Allow the block to scroll horizontally instead of wrapping */
  scrollable?: boolean;
  /** className applied to the outer container */
  className?: string;
}

// ─── Language display labels ──────────────────────────────────────────────────

const languageLabels: Record<string, string> = {
  bash: "bash",
  sh: "bash",
  curl: "curl",
  json: "json",
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  python: "python",
  py: "python",
  http: "http",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CodeBlock({
  code,
  language,
  filename,
  showLineNumbers = false,
  scrollable = true,
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const codeId = React.useId();
  const langLabel = language ? (languageLabels[language.toLowerCase()] ?? language) : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fail silently
    }
  };

  const lines = code.split("\n");

  return (
    <div
      className={[
        "relative rounded-md overflow-hidden",
        "border border-[#1e293b]",
        "bg-[#0f172a]",
        className,
      ].join(" ")}
    >
      {/* Header */}
      {(filename || langLabel) && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            {filename && (
              <span className="font-mono text-[11px] font-medium text-[#94a3b8] tracking-wide">
                {filename}
              </span>
            )}
            {langLabel && !filename && (
              <span className="font-mono text-[11px] font-medium text-[#64748b] uppercase tracking-widest">
                {langLabel}
              </span>
            )}
            {filename && langLabel && (
              <span className="font-mono text-[11px] text-[#64748b] uppercase tracking-widest">
                {langLabel}
              </span>
            )}
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            aria-label={copied ? "Copied to clipboard" : "Copy code"}
            className={[
              "flex items-center gap-1.5 rounded px-2 py-1",
              "text-[11px] font-medium font-mono",
              "transition-colors duration-75",
              copied
                ? "text-[#4ade80]"
                : "text-[#64748b] hover:text-[#94a3b8] hover:bg-white/5",
              "focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-1",
            ].join(" ")}
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      )}

      {/* Code area */}
      <div
        className={[
          scrollable ? "overflow-x-auto" : "overflow-x-hidden",
          "overflow-y-hidden",
        ].join(" ")}
      >
        <pre
          id={codeId}
          className="p-4 m-0 text-[13px] leading-[1.7] text-[#e2e8f0]"
          tabIndex={0}
          aria-label={filename ?? (langLabel ? `${langLabel} code` : "code")}
        >
          <code className="font-mono">
            {showLineNumbers
              ? lines.map((line, i) => (
                  <span key={i} className="flex">
                    <span
                      className="select-none w-8 shrink-0 text-right text-[#475569] mr-4 text-[11px] leading-[1.7]"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span>{line}</span>
                  </span>
                ))
              : code}
          </code>
        </pre>
      </div>

      {/* No-header copy button — shown only when there's no header bar */}
      {!filename && !langLabel && (
        <div className="absolute top-2 right-2">
          <button
            onClick={handleCopy}
            aria-label={copied ? "Copied to clipboard" : "Copy code"}
            className={[
              "flex items-center gap-1 rounded px-2 py-1",
              "text-[11px] font-mono",
              "transition-colors duration-75",
              copied ? "text-[#4ade80]" : "text-[#64748b] hover:text-[#94a3b8] hover:bg-white/5",
              "focus-visible:outline-2 focus-visible:outline-brand-500",
            ].join(" ")}
          >
            {copied ? (
              <Check className="size-3" aria-hidden="true" />
            ) : (
              <Copy className="size-3" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
