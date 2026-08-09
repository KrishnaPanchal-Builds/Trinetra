"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Upload,
  X,
  FileVideo,
  FileImage,
  FileAudio,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type VerificationState = "idle" | "selected" | "processing" | "result";

interface SelectedFile {
  file: File;
  name: string;
  type: "video" | "image" | "audio";
  size: string;
  sizeBytes: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function detectMediaType(file: File): "video" | "image" | "audio" | null {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return null;
}

function FileTypeIcon({ type }: { type: "video" | "image" | "audio" }) {
  const cls = "size-5 text-text-tertiary shrink-0";
  if (type === "video") return <FileVideo className={cls} aria-hidden="true" />;
  if (type === "image") return <FileImage className={cls} aria-hidden="true" />;
  return <FileAudio className={cls} aria-hidden="true" />;
}

// ─── Processing stages ────────────────────────────────────────────────────────

const STAGES = [
  "Media received",
  "Signal extraction",
  "Provenance analysis",
  "Forensic evaluation",
  "Result generation",
];

function ProcessingView({ stage }: { stage: number }) {
  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div>
        <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-widest text-center mb-5">
          TRINETRA VERIFICATION ENGINE
        </p>
        <div className="flex flex-col gap-2.5 min-w-[280px]">
          {STAGES.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <div key={s} className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-text-tertiary w-5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={[
                    "text-sm flex-1 transition-colors",
                    done
                      ? "text-text-secondary"
                      : active
                      ? "text-text-primary font-medium"
                      : "text-text-tertiary",
                  ].join(" ")}
                >
                  {s}
                </span>
                <span className="font-mono text-[11px] w-5 text-right">
                  {done ? (
                    <CheckCircle2
                      className="size-3.5 text-risk-low inline"
                      aria-hidden="true"
                    />
                  ) : active ? (
                    <span className="text-brand-500 animate-pulse">…</span>
                  ) : (
                    <span className="text-text-tertiary opacity-30">—</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Signal row ───────────────────────────────────────────────────────────────

type SignalStatus = "detected" | "not-found" | "inconsistent" | "review";

function SignalRow({
  label,
  status,
  detail,
}: {
  label: string;
  status: SignalStatus;
  detail: string;
}) {
  const cfg: Record<SignalStatus, { dot: string; badge: string; text: string }> =
    {
      detected: {
        dot: "bg-risk-high",
        badge: "text-risk-high bg-risk-high-bg border-risk-high-border",
        text: "Detected",
      },
      "not-found": {
        dot: "bg-risk-medium",
        badge: "text-risk-medium bg-risk-medium-bg border-risk-medium-border",
        text: "Not verified",
      },
      inconsistent: {
        dot: "bg-risk-medium",
        badge: "text-risk-medium bg-risk-medium-bg border-risk-medium-border",
        text: "Inconsistent",
      },
      review: {
        dot: "bg-risk-high",
        badge: "text-risk-high bg-risk-high-bg border-risk-high-border",
        text: "Review required",
      },
    };
  const { dot, badge, text } = cfg[status];
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border-default last:border-0">
      <div className="flex items-start gap-2.5 min-w-0">
        <div
          className={`size-2 rounded-full shrink-0 mt-1.5 ${dot}`}
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <p className="text-xs text-text-secondary mt-0.5">{detail}</p>
        </div>
      </div>
      <span
        className={`shrink-0 font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded border ${badge}`}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Redacted row ─────────────────────────────────────────────────────────────

function RedactedRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border-default last:border-0 opacity-60">
      <div className="flex items-center gap-2.5">
        <Lock
          className="size-3.5 text-text-tertiary shrink-0"
          aria-hidden="true"
        />
        <span className="text-sm text-text-tertiary">{label}</span>
      </div>
      <span className="font-mono text-[10px] text-text-tertiary border border-border-default px-2 py-1 rounded">
        API access required
      </span>
    </div>
  );
}

// ─── Full sample report ───────────────────────────────────────────────────────

function SampleReportPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="mt-4 border border-brand-100 bg-brand-50 rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-brand-500/5 border-b border-brand-100">
        <div>
          <p className="font-mono text-[10px] font-semibold text-brand-500 uppercase tracking-widest">
            Sample Full Report
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            Complete forensic output — curated TRINETRA example
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-text-tertiary hover:text-text-primary transition-colors focus-visible:outline-brand-500 rounded"
          aria-label="Close sample report"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Score */}
        <div className="bg-surface-base border border-border-default rounded p-4">
          <div className="flex items-end justify-between mb-2">
            <span className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
              Authenticity Evidence Score
            </span>
            <span className="font-mono text-2xl font-bold text-text-primary">82</span>
          </div>
          <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
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
            <span className="font-mono text-[9px] text-text-tertiary">Authentic</span>
            <span className="font-mono text-[9px] text-text-tertiary">Synthetic</span>
          </div>
        </div>

        {/* All signals */}
        <div className="bg-surface-base border border-border-default rounded divide-y divide-border-default">
          {[
            { label: "Synthetic Media", val: "94%", color: "text-risk-high" },
            { label: "Provenance / C2PA", val: "Not Found", color: "text-risk-medium" },
            { label: "Metadata Integrity", val: "Inconsistent", color: "text-risk-medium" },
            { label: "Visual Frames", val: "12%", color: "text-risk-low" },
            { label: "Audio Deepfake", val: "89%", color: "text-risk-high" },
            { label: "Model Attribution", val: "AudioLDM-2", color: "text-text-secondary" },
            { label: "Compression artifacts", val: "Anomalous", color: "text-risk-medium" },
            { label: "File hash", val: "Verified", color: "text-risk-low" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-text-secondary">{label}</span>
              <span className={`font-mono text-xs font-semibold ${color}`}>{val}</span>
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="bg-surface-base border border-border-default rounded p-4 flex flex-col gap-1.5">
          {[
            { k: "task_id", v: "trn_98234711_sample" },
            { k: "status", v: "completed" },
            { k: "risk_level", v: "HOLD_FOR_REVIEW" },
            { k: "fusion_method", v: "stacking" },
            { k: "processing_time", v: "14.8s" },
            { k: "api_version", v: "v1" },
          ].map(({ k, v }) => (
            <div key={k} className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-text-tertiary shrink-0">{k}:</span>
              <span className="font-mono text-[10px] text-brand-500">{v}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-text-tertiary text-center">
          This is a curated TRINETRA sample. Production API returns this full structured response for every verification.
        </p>
      </div>
    </div>
  );
}

// ─── Verification Result ──────────────────────────────────────────────────────

function VerificationResult({ fileName }: { fileName: string }) {
  const [showSample, setShowSample] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Result header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono text-[10px] font-semibold text-risk-low uppercase tracking-widest mb-1">
            Verification Complete
          </p>
          <h3 className="text-lg font-bold text-text-primary tracking-tight">
            Analysis complete
          </h3>
          <p className="text-xs text-text-tertiary mt-0.5 font-mono truncate max-w-sm">
            {fileName}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 border border-risk-critical-border bg-risk-critical-bg rounded">
          <div className="size-2 rounded-full bg-risk-critical" aria-hidden="true" />
          <span className="font-mono text-[11px] font-bold text-risk-critical uppercase tracking-wider">
            High Risk
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="p-5 bg-surface-app border border-border-default rounded-md">
        <div className="flex items-end justify-between mb-2">
          <span className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
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
        <div className="flex justify-between mt-1.5">
          <span className="font-mono text-[10px] text-text-tertiary">Authentic</span>
          <span className="font-mono text-[10px] text-text-tertiary">Synthetic</span>
        </div>
      </div>

      {/* Verification signals */}
      <div>
        <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-2">
          Verification Signals
        </p>
        <div className="bg-surface-base border border-border-default rounded-md overflow-hidden">
          <SignalRow
            label="Synthetic Media"
            status="detected"
            detail="High-confidence synthetic audio characteristics identified."
          />
          <SignalRow
            label="Provenance / C2PA"
            status="not-found"
            detail="No valid content provenance record was detected."
          />
          <SignalRow
            label="Metadata"
            status="inconsistent"
            detail="File metadata contains anomalous inconsistencies."
          />
          <SignalRow
            label="Forensic Signals"
            status="review"
            detail="Composite signal patterns require human review."
          />
        </div>
      </div>

      {/* Key findings */}
      <div>
        <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-2">
          Key Findings
        </p>
        <div className="bg-surface-base border border-border-default rounded-md divide-y divide-border-default">
          {[
            {
              n: "01",
              text: "Synthetic audio characteristics detected with 94% model confidence.",
            },
            {
              n: "02",
              text: "No valid content provenance (C2PA) record was available in the file.",
            },
            {
              n: "03",
              text: "Metadata inconsistencies indicate post-capture file modification.",
            },
          ].map(({ n, text }) => (
            <div key={n} className="flex gap-3 px-4 py-3">
              <span className="font-mono text-[10px] font-bold text-text-tertiary shrink-0 mt-0.5">
                {n}
              </span>
              <p className="text-sm text-text-secondary">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Redacted additional findings */}
      <div>
        <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-2">
          Additional Forensic Findings
        </p>
        <div className="bg-surface-base border border-border-default rounded-md overflow-hidden">
          <RedactedRow label="Audio deepfake model attribution" />
          <RedactedRow label="Compression artifact analysis" />
          <RedactedRow label="Frame-level forensic trace" />
          <RedactedRow label="Detailed risk classification chain" />
        </div>
        <p className="text-[11px] text-text-tertiary mt-2">
          Additional forensic findings are available through production API access.
        </p>
      </div>

      {/* Sample full report CTA */}
      <div className="border border-border-default rounded-md p-4 bg-surface-app">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Explore a full verification report
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              See the complete forensic output TRINETRA exposes through its API.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSample((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-500 border border-brand-100 bg-brand-50 rounded hover:bg-brand-100 transition-colors shrink-0"
          >
            {showSample ? (
              <>
                Hide sample <ChevronUp className="size-3.5" aria-hidden="true" />
              </>
            ) : (
              <>
                Explore sample full report <ChevronDown className="size-3.5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
        {showSample && <SampleReportPanel onClose={() => setShowSample(false)} />}
      </div>

      {/* Conversion CTA */}
      <div className="border border-border-default rounded-md p-5 bg-surface-base text-center flex flex-col items-center gap-4">
        <div>
          <p className="text-base font-bold text-text-primary tracking-tight">
            Need the complete verification output?
          </p>
          <p className="text-sm text-text-secondary mt-1.5 max-w-sm mx-auto">
            Integrate TRINETRA into your product and access the full verification
            response, forensic signals, structured results, and production API capabilities.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-500 border border-brand-500 rounded hover:bg-brand-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
          >
            Get API Access
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary border border-border-default rounded hover:bg-surface-subtle transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
          >
            Explore Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Upload area ──────────────────────────────────────────────────────────────

const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
const ACCEPTED = "video/*,image/*,audio/*";

// ─── Main workspace ───────────────────────────────────────────────────────────

export function SandboxWorkspace() {
  const [state, setState] = useState<VerificationState>("idle");
  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processStage, setProcessStage] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    const mediaType = detectMediaType(file);
    if (!mediaType) {
      setError("Unsupported media type. Please upload a video, image, or audio file.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File exceeds 100 MB. Upload a smaller file for sandbox evaluation.`);
      return;
    }
    setSelected({
      file,
      name: file.name,
      type: mediaType,
      size: formatBytes(file.size),
      sizeBytes: file.size,
    });
    setState("selected");
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);

  const removeFile = () => {
    setSelected(null);
    setState("idle");
    setError(null);
  };

  const runVerification = () => {
    setState("processing");
    setProcessStage(0);
    // Simulate processing stages
    let stage = 0;
    const interval = setInterval(() => {
      stage += 1;
      setProcessStage(stage);
      if (stage >= STAGES.length - 1) {
        clearInterval(interval);
        setTimeout(() => setState("result"), 600);
      }
    }, 800);
  };

  const resetWorkspace = () => {
    setState("idle");
    setSelected(null);
    setError(null);
    setProcessStage(0);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Upload / file selection / processing / result ── */}
      {state === "result" ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
              Sandbox Verification
            </span>
            <button
              type="button"
              onClick={resetWorkspace}
              className="text-xs text-brand-500 hover:text-brand-600 hover:underline transition-colors focus-visible:outline-brand-500 rounded"
            >
              Verify another file
            </button>
          </div>
          <VerificationResult fileName={selected?.name ?? "sample.mp4"} />
        </div>
      ) : state === "processing" ? (
        <div>
          <p className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest mb-4">
            Sandbox Verification
          </p>
          <div className="border border-border-default bg-surface-base rounded-md">
            <ProcessingView stage={processStage} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
            Sandbox Verification
          </p>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => state === "idle" && inputRef.current?.click()}
            role={state === "idle" ? "button" : undefined}
            tabIndex={state === "idle" ? 0 : undefined}
            onKeyDown={(e) => {
              if (state === "idle" && (e.key === "Enter" || e.key === " "))
                inputRef.current?.click();
            }}
            aria-label="Upload media file"
            className={[
              "relative border-2 border-dashed rounded-md transition-colors",
              dragging
                ? "border-brand-500 bg-brand-50"
                : state === "idle"
                ? "border-border-strong bg-surface-app hover:border-brand-400 hover:bg-surface-subtle cursor-pointer"
                : "border-border-default bg-surface-base cursor-default",
            ].join(" ")}
          >
            {/* Subtle dot grid */}
            <div
              className="absolute inset-0 rounded-md pointer-events-none opacity-40"
              aria-hidden="true"
              style={{
                backgroundImage: "radial-gradient(circle, #D0D5DD 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Idle state */}
            {state === "idle" && (
              <div className="relative flex flex-col items-center gap-4 py-12 px-6 text-center">
                <div className="size-12 rounded-md bg-surface-raised border border-border-default flex items-center justify-center">
                  <Upload className="size-5 text-text-tertiary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Drag and drop your media here
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    or click to choose a file
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="px-4 py-2 text-sm font-medium text-text-primary border border-border-default bg-surface-base rounded hover:bg-surface-subtle transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
                >
                  Choose file
                </button>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                  <span className="text-xs text-text-tertiary">Video · Image · Audio</span>
                </div>
              </div>
            )}

            {/* Selected state */}
            {state === "selected" && selected && (
              <div className="relative flex items-center gap-4 px-5 py-4">
                <FileTypeIcon type={selected.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {selected.name}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5 font-mono">
                    {selected.type.toUpperCase()} · {selected.size}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors focus-visible:outline-brand-500"
                  aria-label={`Remove ${selected.name}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            onChange={handleInputChange}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* Error */}
          {error && (
            <p
              className="text-[12px] text-risk-critical flex items-center gap-1.5"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* Run verification */}
          <button
            type="button"
            onClick={runVerification}
            disabled={state !== "selected"}
            className={[
              "w-full h-11 flex items-center justify-center gap-2",
              "text-sm font-semibold text-white rounded-md",
              "bg-brand-500 border border-brand-500",
              "hover:bg-brand-600 hover:border-brand-600",
              "transition-colors duration-75",
              "focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            Run verification
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
