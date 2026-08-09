"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { Button, StatusBadge, Badge, CodeBlock } from "@/components/ui";
import { AESScoreDisplay, EvidencePanel } from "@/components/portal";
import type { AnalysisLogEntry } from "@/types/analysis";
import {
  Download,
  ChevronLeft,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  FileVideo,
  FileAudio,
  FileImage,
  FileText,
  Hash,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import type { MediaType } from "@/types/common";

// ─── Media icon map ───────────────────────────────────────────────────────────

const mediaIconMap: Record<MediaType, React.ElementType> = {
  video: FileVideo,
  audio: FileAudio,
  image: FileImage,
  document: FileText,
};

// ─── Action recommendation display ───────────────────────────────────────────

const actionConfig: Record<
  string,
  { label: string; icon: React.ElementType; class: string }
> = {
  AUTO_BLOCK: {
    label: "Auto Block — Content has been automatically blocked.",
    icon: XCircle,
    class: "bg-risk-critical-bg text-risk-critical border-risk-critical-border",
  },
  AUTO_HOLD_FOR_HUMAN_TRIAGE: {
    label: "Held for Human Triage — Review required before action.",
    icon: AlertTriangle,
    class: "bg-risk-high-bg text-risk-high border-risk-high-border",
  },
  MANUAL_REVIEW_RECOMMENDED: {
    label: "Manual Review Recommended — Ambiguous signal.",
    icon: AlertTriangle,
    class: "bg-risk-medium-bg text-risk-medium border-risk-medium-border",
  },
  CLEAR_FOR_PUBLICATION: {
    label: "Clear for Publication — Content appears authentic.",
    icon: CheckCircle2,
    class: "bg-risk-low-bg text-risk-low border-risk-low-border",
  },
  INSUFFICIENT_DATA: {
    label: "Insufficient Data — Analysis could not complete.",
    icon: XCircle,
    class: "bg-surface-subtle text-text-secondary border-border-default",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFull(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }) + " UTC";
}

function CopyableHash({ hash }: { hash: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="font-mono text-xs text-text-secondary truncate">{hash}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy hash"}
        className="shrink-0 p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        {copied ? <Check className="size-3.5 text-risk-low" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}

// ─── Detail Row (metadata table) ─────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-border-default last:border-0">
      <dt className="text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider shrink-0 sm:w-44 pt-0.5">
        {label}
      </dt>
      <dd className="flex-1 min-w-0">{children}</dd>
    </div>
  );
}

// ─── Not available state ─────────────────────────────────────────────────────

function UnavailableState({ taskId }: { taskId: string }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-center">
      <Clock className="size-10 text-text-tertiary" aria-hidden="true" />
      <h3 className="text-base font-semibold text-text-primary">Analysis In Progress</h3>
      <p className="text-sm text-text-secondary max-w-sm">
        Task <span className="font-mono">{taskId}</span> is still being processed.
        Results will be delivered via webhook once the analysis completes (typically within 18 seconds).
      </p>
      <Button variant="secondary" size="sm" leadingIcon={<RefreshCw className="size-3.5" />}>
        Check Status
      </Button>
    </div>
  );
}

import { RefreshCw } from "lucide-react";

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalysisDetailPage({ entry }: { entry: AnalysisLogEntry }) {
  const MediaIcon = mediaIconMap[entry.media_type];
  const result = entry.result;
  const isComplete = !!result;
  const actionCfg = result
    ? (actionConfig[result.action_recommendation] ?? actionConfig["INSUFFICIENT_DATA"])
    : null;

  // Build the webhook payload display
  const webhookJson = result
    ? JSON.stringify(
        {
          task_id: result.task_id,
          authenticity_evidence_score: result.authenticity_evidence_score,
          risk_level: result.risk_level?.toUpperCase(),
          confidence_interval: result.confidence_interval,
          primary_anomaly: result.primary_anomaly,
          anomaly_timestamps: result.anomaly_timestamps,
          modalities_scanned: result.modalities_scanned,
          fusion_method_used: result.fusion_method_used,
          c2pa_manifest_present: result.c2pa_manifest_present,
          uploader_declaration_mismatch: result.uploader_declaration_mismatch,
          action_recommendation: result.action_recommendation,
          audit_pdf_report_url: result.audit_pdf_report_url,
        },
        null,
        2
      )
    : null;

  return (
    <AppShell
      topBarProps={{
        title: entry.task_id,
        environment: entry.api_key_source === "live" ? "production" : "sandbox",
        breadcrumbs: [
          { label: "Workspace", href: "/portal" },
          { label: "Logs", href: "/portal/logs" },
          { label: entry.task_id },
        ],
      }}
    >
      {/* ── Back nav ── */}
      <div className="flex items-center gap-2">
        <Link
          href="/portal/logs"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-brand-500"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Analysis Logs
        </Link>
      </div>

      {/* ── Header card ── */}
      <div className="bg-surface-base border border-border-default rounded-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* AES Score — shown only if complete */}
          {result && (
            <div className="shrink-0">
              <AESScoreDisplay score={result.authenticity_evidence_score} size="lg" />
            </div>
          )}

          {/* Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <MediaIcon className="size-4 text-text-tertiary" aria-hidden="true" />
              <Badge variant={entry.media_type}>{entry.media_type}</Badge>
              <StatusBadge status={entry.status} />
              <Badge variant={entry.api_key_source === "live" ? "production" : "sandbox"}>
                {entry.api_key_source === "live" ? "LIVE API" : "SANDBOX"}
              </Badge>
            </div>

            <h1 className="font-mono text-lg font-semibold text-text-primary mb-1 break-all">
              {entry.task_id}
            </h1>

            {entry.uploader_declaration && (
              <p className="text-sm text-text-secondary italic">
                &ldquo;{entry.uploader_declaration}&rdquo;
              </p>
            )}

            {/* Confidence + primary anomaly */}
            {result && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-xs text-text-tertiary font-mono">
                  Confidence:{" "}
                  <span className="text-text-primary font-semibold">{result.confidence_interval}</span>
                </span>
                <span className="text-xs text-text-tertiary font-mono">
                  Fusion:{" "}
                  <span className="text-text-primary font-semibold uppercase">{result.fusion_method_used}</span>
                </span>
                {result.primary_anomaly && (
                  <span className="font-mono text-xs text-risk-high bg-risk-high-bg border border-risk-high-border rounded-sm px-1.5 py-0.5">
                    {result.primary_anomaly.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            {result?.audit_pdf_report_url && (
              <Button
                variant="primary"
                size="sm"
                leadingIcon={<Download className="size-3.5" />}
              >
                Download PDF Report
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<ExternalLink className="size-3.5" />}
            >
              View Raw Webhook
            </Button>
          </div>
        </div>
      </div>

      {/* ── Action Recommendation Banner ── */}
      {actionCfg && result && (
        <div className={["flex items-center gap-3 px-4 py-3 border rounded-md", actionCfg.class].join(" ")}
          role="alert"
        >
          <actionCfg.icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">{actionCfg.label}</span>
          {result.uploader_declaration_mismatch && (
            <span className="ml-2 font-mono text-[11px] bg-risk-high-bg text-risk-high border border-risk-high-border rounded-sm px-1.5 py-0.5 shrink-0">
              DECLARATION MISMATCH
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column: metadata + anomalies ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Metadata table */}
          <div className="bg-surface-base border border-border-default rounded-md overflow-hidden">
            <div className="px-4 py-3 border-b border-border-default">
              <h2 className="text-sm font-semibold text-text-primary">Scan Metadata</h2>
            </div>
            <dl className="px-4">
              <DetailRow label="Task ID">
                <span className="font-mono text-sm text-text-primary">{entry.task_id}</span>
              </DetailRow>
              <DetailRow label="File Hash">
                <CopyableHash hash={entry.file_hash} />
              </DetailRow>
              <DetailRow label="Submitted">
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                  <span className="font-mono text-xs text-text-secondary">{formatFull(entry.submitted_at)}</span>
                </div>
              </DetailRow>
              {entry.completed_at && (
                <DetailRow label="Completed">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                    <span className="font-mono text-xs text-text-secondary">{formatFull(entry.completed_at)}</span>
                  </div>
                </DetailRow>
              )}
              <DetailRow label="Modalities">
                <div className="flex flex-wrap gap-1.5">
                  {result?.modalities_scanned.map((m) => (
                    <Badge key={m} variant={m}>{m}</Badge>
                  )) ?? <span className="text-text-tertiary text-sm">—</span>}
                </div>
              </DetailRow>
              <DetailRow label="C2PA Manifest">
                {result ? (
                  <div className="flex items-center gap-2">
                    {result.c2pa_manifest_present ? (
                      <ShieldCheck className="size-4 text-risk-low" aria-hidden="true" />
                    ) : (
                      <ShieldAlert className="size-4 text-text-tertiary" aria-hidden="true" />
                    )}
                    <span className="text-sm text-text-secondary">
                      {result.c2pa_manifest_present ? "Present — AI watermark detected" : "Not present"}
                    </span>
                  </div>
                ) : <span className="text-text-tertiary text-sm">—</span>}
              </DetailRow>
              <DetailRow label="API Source">
                <Badge variant={entry.api_key_source === "live" ? "production" : "sandbox"}>
                  {entry.api_key_source}
                </Badge>
              </DetailRow>
            </dl>
          </div>

          {/* Anomaly timestamps */}
          {result && result.anomaly_timestamps.length > 0 && (
            <div className="bg-surface-base border border-border-default rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
                <AlertTriangle className="size-4 text-risk-high" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-text-primary">Anomaly Timestamps</h2>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {result.anomaly_timestamps.map((ts, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-risk-high bg-risk-high-bg border border-risk-high-border rounded-sm px-2 py-1"
                  >
                    <Clock className="size-3" aria-hidden="true" />
                    {ts.start} – {ts.end}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Webhook payload */}
          {webhookJson && (
            <div>
              <h2 className="text-sm font-semibold text-text-primary mb-2">Webhook Payload</h2>
              <CodeBlock
                code={webhookJson}
                language="json"
                filename={`${entry.task_id}-webhook.json`}
                showLineNumbers
                scrollable
              />
            </div>
          )}

          {/* Not complete state */}
          {!isComplete && <UnavailableState taskId={entry.task_id} />}
        </div>

        {/* ── Right column: evidence panel ── */}
        <div className="flex flex-col gap-6">
          {result && (
            <EvidencePanel
              modelResults={result.model_results}
              fusionMethod={result.fusion_method_used}
            />
          )}

          {/* Model weight versions */}
          {result && Object.keys(result.model_weight_versions).length > 0 && (
            <div className="bg-surface-base border border-border-default rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
                <Hash className="size-4 text-text-tertiary" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-text-primary">Model Weight Versions</h2>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {Object.entries(result.model_weight_versions).map(([model, ver]) => (
                  <div key={model} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-text-secondary">{model}</span>
                    <span className="font-mono text-[11px] text-text-tertiary">{ver}</span>
                  </div>
                ))}
                <p className="mt-2 text-[10px] text-text-tertiary leading-relaxed">
                  Weight version hashes are retained for legal reproducibility. Every AES score is reproducible using the exact weight set listed above.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
