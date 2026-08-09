import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

// ─── API Response Visualization ───────────────────────────────────────────────

function ApiResponsePanel() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 rounded-lg opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-border-default) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border-default) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="relative bg-surface-base border border-border-default rounded-lg overflow-hidden shadow-sm">
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface-subtle border-b border-border-default">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
              Verification Result
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-risk-high opacity-80" aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold text-risk-high uppercase tracking-wider">
              High Risk
            </span>
          </div>
        </div>

        {/* Request line */}
        <div className="px-4 py-2.5 bg-surface-app border-b border-border-default">
          <span className="font-mono text-[11px] text-text-tertiary">
            POST{" "}
            <span className="text-brand-500">https://api.trinetra.ai/v1/scan-media</span>
          </span>
        </div>

        {/* Score display */}
        <div className="px-4 py-4 border-b border-border-default">
          <div className="flex items-end justify-between mb-2">
            <span className="text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">
              Authenticity Evidence Score
            </span>
            <span className="font-mono text-2xl font-bold text-text-primary">82</span>
          </div>
          <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
            <div
              className="h-full bg-risk-high rounded-full"
              style={{ width: "82%" }}
              role="progressbar"
              aria-valuenow={82}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Risk score 82 out of 100"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[10px] text-text-tertiary">Authentic</span>
            <span className="font-mono text-[10px] text-text-tertiary">Synthetic</span>
          </div>
        </div>

        {/* Signal rows */}
        <div className="px-4 py-3 flex flex-col gap-2 border-b border-border-default">
          {[
            { label: "Synthetic Audio", value: "94%", status: "flag" },
            { label: "Provenance / C2PA", value: "Not Found", status: "warn" },
            { label: "Metadata Integrity", value: "Inconsistent", status: "warn" },
            { label: "Visual Frames", value: "12%", status: "ok" },
          ].map(({ label, value, status }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={[
                    "size-1.5 rounded-full shrink-0",
                    status === "flag"
                      ? "bg-risk-high"
                      : status === "warn"
                      ? "bg-risk-medium"
                      : "bg-risk-low",
                  ].join(" ")}
                  aria-hidden="true"
                />
                <span className="text-xs text-text-secondary">{label}</span>
              </div>
              <span
                className={[
                  "font-mono text-xs font-semibold",
                  status === "flag"
                    ? "text-risk-high"
                    : status === "warn"
                    ? "text-risk-medium"
                    : "text-risk-low",
                ].join(" ")}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom fields */}
        <div className="px-4 py-3 flex flex-col gap-1.5">
          {[
            { label: "task_id", value: "trk_982347110_x" },
            { label: "action_recommendation", value: "HOLD_FOR_REVIEW" },
            { label: "fusion_method", value: "stacking" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-text-tertiary shrink-0">{label}:</span>
              <span className="font-mono text-[10px] text-brand-500 truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {
  return (
    <section className="bg-surface-base border-b border-border-default" aria-label="Hero">
      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-block font-mono text-[11px] font-semibold text-brand-500 uppercase tracking-widest mb-4">
                Verification Infrastructure
              </span>
              <h1 className="text-3xl lg:text-4xl xl:text-[2.625rem] font-bold text-text-primary leading-[1.15] tracking-tight">
                The synthetic-media verification layer for your platform.
              </h1>
            </div>

            <p className="text-base text-text-secondary leading-relaxed max-w-lg">
              TRINETRA detects AI-generated content, deepfakes, provenance issues,
              and metadata tampering through a single forensic verification API —
              designed for platforms that need reliable, auditable signal at scale.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 border border-brand-500 rounded hover:bg-brand-600 hover:border-brand-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
              >
                Start Verifying
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="#developers"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text-primary border border-border-default rounded hover:bg-surface-subtle transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
              >
                <BookOpen className="size-4 text-text-tertiary" aria-hidden="true" />
                Read the Docs
              </Link>
            </div>

            {/* Supporting detail row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {[
                "REST API",
                "Webhook delivery",
                "PDF audit reports",
                "DPDP-compliant",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <div className="size-1 rounded-full bg-border-strong" aria-hidden="true" />
                  <span className="text-xs text-text-tertiary font-mono">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: API response visualization */}
          <ApiResponsePanel />
        </div>
      </div>
    </section>
  );
}
