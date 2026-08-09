import React from "react";

// Architecture diagram — pure HTML/CSS engineering-paper style

function DiagramBox({
  label,
  sublabel,
  variant = "default",
  children,
}: {
  label: string;
  sublabel?: string;
  variant?: "default" | "primary" | "output";
  children?: React.ReactNode;
}) {
  return (
    <div
      className={[
        "rounded border px-5 py-3.5 text-center",
        variant === "primary"
          ? "bg-brand-500 border-brand-500 text-white"
          : variant === "output"
          ? "bg-surface-app border-border-strong"
          : "bg-surface-base border-border-default",
      ].join(" ")}
    >
      <p
        className={[
          "font-mono text-[11px] font-bold uppercase tracking-widest",
          variant === "primary" ? "text-blue-200" : "text-text-tertiary",
        ].join(" ")}
      >
        {label}
      </p>
      {sublabel && (
        <p
          className={[
            "mt-1 text-sm font-semibold",
            variant === "primary" ? "text-white" : "text-text-primary",
          ].join(" ")}
        >
          {sublabel}
        </p>
      )}
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center py-2" aria-hidden="true">
      <div className="flex flex-col items-center">
        <div className="w-px h-5 bg-border-strong" />
        <div
          className="border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-border-strong"
        />
      </div>
    </div>
  );
}

const ENGINE_SIGNALS = [
  "Synthetic Media Detection",
  "Provenance & C2PA",
  "Metadata Integrity",
  "Forensic Signals",
];

export function ArchitectureDiagram() {
  return (
    <section
      className="bg-surface-base border-b border-border-default"
      aria-labelledby="arch-heading"
      id="platform"
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: copy */}
          <div className="flex flex-col gap-5">
            <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
              Architecture
            </span>
            <h2 id="arch-heading" className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
              One API. Multiple verification signals.
            </h2>
            <p className="text-base text-text-secondary leading-relaxed">
              TRINETRA consolidates synthetic media detection, cryptographic provenance
              validation, metadata analysis, and forensic signal extraction behind a
              single REST API endpoint — eliminating the integration overhead of
              maintaining multiple point solutions.
            </p>

            <div className="flex flex-col gap-3 mt-2">
              {[
                {
                  label: "Single endpoint",
                  desc: "One POST request submits media across all configured verification engines.",
                },
                {
                  label: "Parallel analysis",
                  desc: "Verification engines run concurrently to minimize latency.",
                },
                {
                  label: "Structured output",
                  desc: "A unified JSON response with per-signal traces and a fused risk score.",
                },
              ].map(({ label, desc }) => (
                <div key={label} className="flex gap-3">
                  <div className="mt-0.5 size-1.5 rounded-full bg-brand-500 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-sm font-semibold text-text-primary">{label}</span>
                    <span className="text-sm text-text-secondary"> — {desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: diagram */}
          <div className="relative">
            {/* Engineering grid background */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundImage: `
                  linear-gradient(to right, var(--color-border-default) 1px, transparent 1px),
                  linear-gradient(to bottom, var(--color-border-default) 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
                opacity: 0.5,
              }}
              aria-hidden="true"
            />

            <div className="relative p-8">
              {/* Input */}
              <DiagramBox label="Media Input" sublabel="URL / Binary / Multipart" />

              <Arrow />

              {/* Engine */}
              <DiagramBox label="TRINETRA Engine" variant="primary">
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {ENGINE_SIGNALS.map((sig) => (
                    <div
                      key={sig}
                      className="bg-white/10 border border-white/20 rounded px-2 py-1.5 text-[10px] font-mono text-white/90 text-center"
                    >
                      {sig}
                    </div>
                  ))}
                </div>
              </DiagramBox>

              <Arrow />

              {/* Output */}
              <DiagramBox label="Verification Result" variant="output">
                <div className="mt-2 flex justify-center gap-4">
                  {[
                    { label: "Risk Score", val: "82/100" },
                    { label: "Signal Traces", val: "4" },
                    { label: "PDF Report", val: "✓" },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center">
                      <p className="font-mono text-sm font-bold text-text-primary">{val}</p>
                      <p className="font-mono text-[9px] text-text-tertiary uppercase tracking-wider mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </DiagramBox>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
