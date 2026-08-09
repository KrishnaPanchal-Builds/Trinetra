import * as React from "react";
import type { ModelResult } from "@/types/analysis";
import { Cpu, CheckCircle2, AlertCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EvidencePanelProps {
  modelResults: Record<string, ModelResult | number>;
  fusionMethod: string;
  className?: string;
}

interface EvidenceRowProps {
  modelName: string;
  result: ModelResult | number;
}

// ─── Model display name map ───────────────────────────────────────────────────

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  aasist: "AASIST",
  rawnet3: "RawNet3",
  ftcn: "FTCN",
  sbi: "SBI",
  npr: "NPR",
  universalfakedetect: "UniversalFakeDetect",
  phoneme_viseme_alignment_delta: "Phoneme–Viseme Alignment",
};

const MODEL_DESCRIPTIONS: Record<string, string> = {
  aasist: "Audio Anti-Spoofing — Spectro-Temporal Graph",
  rawnet3: "Audio Anti-Spoofing — Raw Waveform",
  ftcn: "Video — Frequency-Temporal Convolutional",
  sbi: "Video — Self-Blended Face Boundary",
  npr: "Image — Neural Pattern Recognition",
  universalfakedetect: "Image — CLIP-based Universal Detector",
  phoneme_viseme_alignment_delta: "Cross-Modal Synchronization Delta",
};

// ─── Evidence Row ─────────────────────────────────────────────────────────────

function EvidenceRow({ modelName, result }: EvidenceRowProps) {
  const displayName = MODEL_DISPLAY_NAMES[modelName] ?? modelName;
  const description = MODEL_DESCRIPTIONS[modelName] ?? "";

  // Alignment delta is a number scalar, not a ModelResult object
  if (typeof result === "number") {
    const delta = result;
    const isHighDelta = delta > 0.5;

    return (
      <div className="flex items-center gap-4 py-3 border-b border-border-default last:border-0">
        <div className="size-6 flex items-center justify-center shrink-0">
          <Cpu className="size-4 text-text-tertiary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-text-primary">{displayName}</span>
          </div>
          {description && (
            <p className="text-xs text-text-tertiary truncate">{description}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className={["font-mono text-sm font-semibold", isHighDelta ? "text-risk-high" : "text-risk-low"].join(" ")}>
            {delta.toFixed(2)}
          </span>
          <p className="text-[10px] font-mono text-text-tertiary">
            {isHighDelta ? "MISALIGNED" : "ALIGNED"}
          </p>
        </div>
      </div>
    );
  }

  // Normal ModelResult
  const { probability, class: cls, weight_version } = result;
  const isSynthetic = cls === "synthetic";
  const probabilityPct = Math.round(probability * 100);

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border-default last:border-0">
      {/* Icon */}
      <div className="size-6 flex items-center justify-center shrink-0">
        {isSynthetic ? (
          <AlertCircle className="size-4 text-risk-high" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-4 text-risk-low" aria-hidden="true" />
        )}
      </div>

      {/* Model name + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-text-primary">{displayName}</span>
          {weight_version && (
            <span className="font-mono text-[10px] text-text-tertiary">{weight_version}</span>
          )}
        </div>
        {description && (
          <p className="text-xs text-text-tertiary truncate">{description}</p>
        )}
      </div>

      {/* Probability bar + class */}
      <div className="shrink-0 flex flex-col items-end gap-1 min-w-[80px]">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-surface-raised rounded-full overflow-hidden">
            <div
              className={["h-full rounded-full transition-all", isSynthetic ? "bg-risk-high" : "bg-risk-low"].join(" ")}
              style={{ width: `${probabilityPct}%` }}
              aria-label={`${probabilityPct}% probability`}
              role="progressbar"
              aria-valuenow={probabilityPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className={["font-mono text-sm font-semibold w-8 text-right", isSynthetic ? "text-risk-high" : "text-risk-low"].join(" ")}>
            {probabilityPct}%
          </span>
        </div>
        <span className={["font-mono text-[10px] uppercase tracking-wide", isSynthetic ? "text-risk-high" : "text-risk-low"].join(" ")}>
          {cls}
        </span>
      </div>
    </div>
  );
}

// ─── Evidence Panel ───────────────────────────────────────────────────────────

export function EvidencePanel({
  modelResults,
  fusionMethod,
  className = "",
}: EvidencePanelProps) {
  const entries = Object.entries(modelResults);

  return (
    <div className={["bg-surface-base border border-border-default rounded-md overflow-hidden", className].join(" ")}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-text-tertiary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-text-primary">Forensic Evidence</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Fusion:</span>
          <span className="font-mono text-[11px] font-medium text-text-secondary uppercase">{fusionMethod}</span>
        </div>
      </div>

      {/* Model result rows */}
      <div className="px-4">
        {entries.length === 0 ? (
          <p className="py-6 text-sm text-text-tertiary text-center">No model results available.</p>
        ) : (
          entries.map(([modelName, result]) => (
            <EvidenceRow key={modelName} modelName={modelName} result={result} />
          ))
        )}
      </div>
    </div>
  );
}
