import React from "react";
import { AlertTriangle } from "lucide-react";

const SIGNAL_TRACES = [
  {
    id: "SIG_01",
    title: "Synthetic Audio Detected",
    detail:
      "Model trace indicates a synthetic audio signature consistent with voice synthesis. Confidence: 94%.",
    level: "high",
  },
  {
    id: "SIG_02",
    title: "Missing C2PA Manifest",
    detail:
      "No cryptographic provenance manifest attached to the media file. Origin cannot be cryptographically verified.",
    level: "medium",
  },
  {
    id: "SIG_03",
    title: "Metadata Inconsistencies",
    detail:
      "Detected inconsistencies in file metadata. Reported capture conditions are inconsistent with embedded sensor data.",
    level: "medium",
  },
];

const MODEL_SCORES = [
  { label: "AASIST", score: 0.94, class_: "synthetic" },
  { label: "RawNet3", score: 0.88, class_: "synthetic" },
  { label: "FTCN", score: 0.12, class_: "authentic" },
  { label: "SBI", score: 0.09, class_: "authentic" },
];

function RiskLabel({ level }: { level: string }) {
  const styles: Record<string, string> = {
    high: "text-risk-high bg-risk-high-bg border-risk-high-border",
    medium: "text-risk-medium bg-risk-medium-bg border-risk-medium-border",
    low: "text-risk-low bg-risk-low-bg border-risk-low-border",
  };
  return (
    <span
      className={`font-mono text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${styles[level]}`}
    >
      {level}
    </span>
  );
}

export function ActionableData() {
  return (
    <section
      className="bg-surface-base border-b border-border-default"
      aria-labelledby="data-heading"
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: copy */}
          <div className="flex flex-col gap-5">
            <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
              Verification Output
            </span>
            <h2
              id="data-heading"
              className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight"
            >
              Actionable verification data.
            </h2>
            <p className="text-base text-text-secondary leading-relaxed">
              Detailed forensic traces backing every decision. Each verification result
              includes a unified risk score, per-model attribution, and a structured
              signal log — enabling auditable, explainable moderation decisions.
            </p>

            <div className="flex flex-col gap-3 mt-2">
              {[
                {
                  label: "Unified risk score",
                  desc: "A single 0–100 score derived from all active verification engines.",
                },
                {
                  label: "Per-model attribution",
                  desc: "Individual model probabilities included for transparency and reproducibility.",
                },
                {
                  label: "PDF audit report",
                  desc: "A downloadable, tamper-evident report suitable for legal and compliance review.",
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

          {/* Right: result card */}
          <div className="bg-surface-base border border-border-default rounded-md overflow-hidden shadow-sm">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-surface-subtle border-b border-border-default">
              <div>
                <p className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
                  Verification Result
                </p>
                <p className="font-mono text-[10px] text-text-tertiary mt-0.5">
                  task_id: trk_982347110_x
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-risk-high" aria-hidden="true" />
                <span className="font-mono text-xs font-bold text-risk-high uppercase">
                  High Risk
                </span>
              </div>
            </div>

            {/* Score */}
            <div className="px-5 py-4 border-b border-border-default">
              <div className="flex items-end justify-between mb-2">
                <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                  Authenticity Evidence Score
                </span>
                <span className="font-mono text-3xl font-bold text-text-primary">82</span>
              </div>
              <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
                <div
                  className="h-full bg-risk-high rounded-full"
                  style={{ width: "82%" }}
                  role="progressbar"
                  aria-valuenow={82}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-mono text-[10px] text-text-tertiary">0 — Authentic</span>
                <span className="font-mono text-[10px] text-text-tertiary">100 — Synthetic</span>
              </div>
            </div>

            {/* Model scores */}
            <div className="px-5 py-3.5 border-b border-border-default">
              <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">
                Per-Model Results
              </p>
              <div className="flex flex-col gap-2">
                {MODEL_SCORES.map((m) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-text-tertiary w-16 shrink-0">{m.label}</span>
                    <div className="flex-1 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${m.class_ === "synthetic" ? "bg-risk-high" : "bg-risk-low"}`}
                        style={{ width: `${m.score * 100}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="font-mono text-xs text-text-secondary w-8 text-right shrink-0">
                      {Math.round(m.score * 100)}%
                    </span>
                    <span
                      className={`font-mono text-[10px] font-semibold uppercase w-16 shrink-0 ${
                        m.class_ === "synthetic" ? "text-risk-high" : "text-risk-low"
                      }`}
                    >
                      {m.class_}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signal traces */}
            <div className="px-5 py-3.5">
              <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">
                Signal Traces
              </p>
              <div className="flex flex-col gap-3">
                {SIGNAL_TRACES.map((sig) => (
                  <div key={sig.id} className="flex gap-3">
                    <div className="flex flex-col items-center mt-0.5">
                      <div
                        className={`size-2 rounded-full shrink-0 ${
                          sig.level === "high" ? "bg-risk-high" : "bg-risk-medium"
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-primary">
                          {sig.title}
                        </span>
                        <RiskLabel level={sig.level} />
                      </div>
                      <p className="text-[11px] text-text-tertiary leading-relaxed">
                        {sig.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
