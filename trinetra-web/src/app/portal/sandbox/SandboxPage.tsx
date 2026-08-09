"use client";

import React, { useState, useRef } from "react";
import { AppShell } from "@/components/layout";
import { SectionHeading, Button, Divider, Badge, CodeBlock } from "@/components/ui";
import { AESScoreDisplay, RiskBadge, EvidencePanel } from "@/components/portal";
import { MOCK_ANALYSES } from "@/lib/mock/analyses";
import type { AnalysisLogEntry } from "@/types/analysis";
import type { MediaType } from "@/types/common";
import {
  Upload,
  FileVideo,
  FileAudio,
  FileImage,
  FileText,
  X,
  Loader2,
  FlaskConical,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// ─── Accepted types ───────────────────────────────────────────────────────────

const ACCEPTED_TYPES: Record<MediaType, { mime: string[]; label: string; icon: React.ElementType }> = {
  video: { mime: ["video/mp4", "video/webm", "video/mov", "video/quicktime"], label: "MP4, WebM, MOV", icon: FileVideo },
  audio: { mime: ["audio/wav", "audio/mp3", "audio/mpeg", "audio/ogg"], label: "WAV, MP3, OGG", icon: FileAudio },
  image: { mime: ["image/jpeg", "image/png", "image/webp"], label: "JPEG, PNG, WebP", icon: FileImage },
  document: { mime: ["application/pdf"], label: "PDF", icon: FileText },
};

const ALL_MIME = Object.values(ACCEPTED_TYPES).flatMap((t) => t.mime).join(",");

// ─── Detect media type from MIME ─────────────────────────────────────────────

function detectMediaType(file: File): MediaType {
  for (const [type, config] of Object.entries(ACCEPTED_TYPES)) {
    if (config.mime.includes(file.type)) return type as MediaType;
  }
  return "document";
}

// ─── Pick a realistic mock result for the media type ─────────────────────────

function getMockResult(mediaType: MediaType): AnalysisLogEntry {
  const matches = MOCK_ANALYSES.filter(
    (a) => a.media_type === mediaType && a.result !== undefined
  );
  if (matches.length > 0) {
    return matches[Math.floor(Math.random() * matches.length)];
  }
  return MOCK_ANALYSES[0];
}

// ─── Simulated scan progress stages ──────────────────────────────────────────

const STAGES = [
  { label: "Ingestion & fast-return", duration: 400 },
  { label: "C2PA cryptographic check", duration: 800 },
  { label: "Modality demuxing & health gate", duration: 600 },
  { label: "Parallel AI inference", duration: 2200 },
  { label: "Cross-modal synchronization", duration: 700 },
  { label: "Fusion & scoring", duration: 500 },
  { label: "Webhook payload generation", duration: 300 },
];

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function DropZone({
  onFile,
  disabled,
}: {
  onFile: (file: File) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload media file for analysis"
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      className={[
        "border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-4 py-14 px-8 transition-colors",
        disabled ? "cursor-not-allowed opacity-50 border-border-default" :
          dragOver ? "border-brand-500 bg-brand-50 cursor-copy" :
          "border-border-strong bg-surface-base hover:border-brand-400 hover:bg-brand-50/40 cursor-pointer",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ALL_MIME}
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className={[
        "size-14 rounded-full border-2 flex items-center justify-center transition-colors",
        dragOver ? "border-brand-500 text-brand-500" : "border-border-strong text-text-tertiary",
      ].join(" ")}>
        <Upload className="size-7" aria-hidden="true" />
      </div>

      <div className="text-center">
        <p className="text-base font-semibold text-text-primary">
          {dragOver ? "Drop to analyse" : "Drop media file here"}
        </p>
        <p className="text-sm text-text-secondary mt-1">
          or <span className="text-brand-500 font-medium">click to browse</span>
        </p>
        <p className="text-xs text-text-tertiary mt-2">
          Video · Audio · Image · PDF &mdash; up to 500 MB
        </p>
      </div>

      {/* Type chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {(Object.entries(ACCEPTED_TYPES) as [MediaType, typeof ACCEPTED_TYPES[MediaType]][]).map(
          ([type, { label, icon: Icon }]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-text-tertiary bg-surface-subtle border border-border-default rounded px-2.5 py-1">
              <Icon className="size-3.5" aria-hidden="true" />
              <span>{label}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─── Progress Stages Panel ────────────────────────────────────────────────────

function ScanProgress({
  currentStage,
  totalStages,
}: {
  currentStage: number;
  totalStages: number;
}) {
  return (
    <div className="bg-surface-base border border-border-default rounded-md p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 text-brand-500 animate-spin" aria-hidden="true" />
        <h3 className="text-base font-semibold text-text-primary">Analysing…</h3>
        <span className="font-mono text-xs text-text-tertiary ml-auto">
          {currentStage}/{totalStages} stages
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {STAGES.map((stage, i) => {
          const done = i < currentStage;
          const active = i === currentStage;
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <div className={[
                "size-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                done ? "bg-risk-low text-text-inverse" :
                  active ? "border-2 border-brand-500" :
                  "border-2 border-border-default",
              ].join(" ")}>
                {done && <CheckCircle2 className="size-4 text-white" aria-hidden="true" />}
                {active && <Loader2 className="size-3 text-brand-500 animate-spin" aria-hidden="true" />}
              </div>
              <span className={[
                "text-sm",
                done ? "text-text-tertiary line-through" :
                  active ? "text-text-primary font-medium" :
                  "text-text-tertiary",
              ].join(" ")}>
                {stage.label}
              </span>
              {done && (
                <span className="font-mono text-[11px] text-risk-low ml-auto">✓</span>
              )}
              {active && (
                <span className="font-mono text-[11px] text-brand-500 ml-auto animate-pulse">
                  running
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.round((currentStage / totalStages) * 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round((currentStage / totalStages) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// ─── Result Panel ─────────────────────────────────────────────────────────────

function ResultPanel({
  result,
  file,
  onReset,
}: {
  result: AnalysisLogEntry;
  file: File;
  onReset: () => void;
}) {
  const webhookJson = result.result
    ? JSON.stringify(
        {
          task_id: result.result.task_id,
          authenticity_evidence_score: result.result.authenticity_evidence_score,
          risk_level: result.result.risk_level?.toUpperCase(),
          confidence_interval: result.result.confidence_interval,
          primary_anomaly: result.result.primary_anomaly,
          modalities_scanned: result.result.modalities_scanned,
          action_recommendation: result.result.action_recommendation,
          audit_pdf_report_url: result.result.audit_pdf_report_url,
        },
        null,
        2
      )
    : "{}";

  return (
    <div className="flex flex-col gap-6">
      {/* File info banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-base border border-border-default rounded-md">
        <Badge variant={result.media_type}>{result.media_type}</Badge>
        <span className="text-sm text-text-primary font-medium truncate flex-1">{file.name}</span>
        <span className="font-mono text-xs text-text-tertiary shrink-0">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </span>
        <Button variant="ghost" size="sm" onClick={onReset}
          leadingIcon={<X className="size-3.5" />}>
          New scan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: AES + result summary */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              {result.result && (
                <AESScoreDisplay score={result.result.authenticity_evidence_score} size="lg" />
              )}
              {result.risk_level && <RiskBadge riskLevel={result.risk_level} />}
            </div>

            <Divider />

            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-text-tertiary font-mono text-[11px] uppercase tracking-wider">Confidence</dt>
                <dd className="font-mono text-sm font-semibold text-text-primary">{result.result?.confidence_interval ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-tertiary font-mono text-[11px] uppercase tracking-wider">Fusion</dt>
                <dd className="font-mono text-sm text-text-secondary uppercase">{result.result?.fusion_method_used ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-tertiary font-mono text-[11px] uppercase tracking-wider">C2PA</dt>
                <dd className="font-mono text-xs text-text-secondary">{result.result?.c2pa_manifest_present ? "Present" : "Not present"}</dd>
              </div>
              {result.result?.primary_anomaly && (
                <div className="flex flex-col gap-1">
                  <dt className="text-text-tertiary font-mono text-[11px] uppercase tracking-wider">Primary Anomaly</dt>
                  <dd className="font-mono text-xs text-risk-high bg-risk-high-bg border border-risk-high-border rounded-sm px-2 py-1">
                    {result.result.primary_anomaly.replace(/_/g, " ")}
                  </dd>
                </div>
              )}
            </dl>

            {result.result?.action_recommendation && (
              <>
                <Divider />
                <div className={[
                  "flex items-start gap-2 p-3 rounded border text-xs font-medium",
                  result.risk_level === "critical" || result.risk_level === "high"
                    ? "bg-risk-high-bg border-risk-high-border text-risk-high"
                    : result.risk_level === "medium"
                    ? "bg-risk-medium-bg border-risk-medium-border text-risk-medium"
                    : "bg-risk-low-bg border-risk-low-border text-risk-low",
                ].join(" ")}>
                  {result.risk_level === "low"
                    ? <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                    : <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  }
                  {result.result.action_recommendation.replace(/_/g, " ")}
                </div>
              </>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            trailingIcon={<ChevronRight className="size-3.5" />}
            className="self-start"
          >
            View full analysis in logs
          </Button>
        </div>

        {/* Right: Evidence + JSON */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {result.result && (
            <EvidencePanel
              modelResults={result.result.model_results}
              fusionMethod={result.result.fusion_method_used}
            />
          )}
          <CodeBlock
            code={webhookJson}
            language="json"
            filename="webhook-response.json"
            showLineNumbers
            scrollable
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SandboxPage() {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<AnalysisLogEntry | null>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setResult(null);
    setScanning(true);
    setStage(0);

    const mediaType = detectMediaType(f);

    // Simulate staged progress
    for (let i = 0; i < STAGES.length; i++) {
      setStage(i);
      await new Promise((res) => setTimeout(res, STAGES[i].duration));
    }

    const mockResult = getMockResult(mediaType);
    setScanning(false);
    setResult(mockResult);
  };

  const handleReset = () => {
    setFile(null);
    setScanning(false);
    setStage(0);
    setResult(null);
  };

  return (
    <AppShell
      topBarProps={{
        title: "Sandbox",
        environment: "sandbox",
        breadcrumbs: [
          { label: "Workspace", href: "/portal" },
          { label: "Sandbox" },
        ],
      }}
    >
      <SectionHeading
        eyebrow="VERIFICATION"
        title="Sandbox"
        description="Test the TRINETRA verification pipeline with any media file without writing code. Results use the same forensic models as the production API."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="sandbox">Sandbox</Badge>
            <span className="text-xs text-text-tertiary font-mono">No credits consumed</span>
          </div>
        }
      />

      <Divider />

      {/* Warning strip */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-subtle border border-border-default rounded-md text-xs text-text-secondary">
        <FlaskConical className="size-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
        Sandbox results use mock data for demonstration. Connect a Live API key to run real forensic inference.
      </div>

      {/* States */}
      {!file && !scanning && !result && (
        <DropZone onFile={handleFile} />
      )}

      {scanning && file && (
        <ScanProgress
          currentStage={stage}
          totalStages={STAGES.length}
        />
      )}

      {result && file && (
        <ResultPanel
          result={result}
          file={file}
          onReset={handleReset}
        />
      )}
    </AppShell>
  );
}
