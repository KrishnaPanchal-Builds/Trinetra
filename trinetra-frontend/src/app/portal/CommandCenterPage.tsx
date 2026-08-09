"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { SectionHeading, Button, Divider } from "@/components/ui";
import { MetricCard, InlineBarChart, ProportionBar } from "@/components/portal";
import {
  Activity,
  ShieldCheck,
  Timer,
  Zap,
  ArrowRight,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Replace with backend API response in production

const MOCK_USER = {
  name: "Aarav Mehta",
  role: "Owner" as const,
  organization: "Acme Technologies",
  plan: "Growth",
};

const MOCK_METRICS = {
  verifications_total: 12842,
  verifications_delta: "+18.4%",
  pass_rate: 91.7,
  pass_rate_delta: "+2.1%",
  api_requests: 48219,
  api_requests_limit: 100000,
  avg_response_ms: 842,
  p95_response_ms: 1340,
};

const MOCK_API_HEALTH = {
  status: "operational" as const,
  availability_pct: 99.98,
  median_latency_ms: 418,
  p95_latency_ms: 1340,
  last_incident: null as string | null,
};

// 30-day verification volume — realistic variation ~300–600/day
const MOCK_ACTIVITY: { label: string; value: number; highlight?: boolean }[] =
  (() => {
    const days: { label: string; value: number; highlight?: boolean }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const base = 420;
      const noise = Math.sin(i * 1.3) * 90 + Math.cos(i * 0.7) * 60;
      const value = Math.max(280, Math.round(base + noise));
      days.push({ label, value, highlight: i === 0 });
    }
    return days;
  })();

const MOCK_OUTCOMES = [
  { label: "Authentic", value: 9297, color: "var(--color-risk-low)" },
  { label: "Synthetic media", value: 1901, color: "var(--color-risk-high)" },
  { label: "Requires review", value: 1233, color: "var(--color-risk-medium)" },
  { label: "Insufficient evidence", value: 411, color: "var(--color-border-strong)" },
];

const MOCK_RECENT_VERIFICATIONS = [
  {
    task_id: "trn_8F2A91",
    filename: "product_demo.mp4",
    media_type: "Video",
    result: "Authentic",
    result_status: "authentic" as const,
    score: 94,
    created_at: "8 min ago",
    status: "Completed",
  },
  {
    task_id: "trn_7C104E",
    filename: "campaign_asset.mov",
    media_type: "Video",
    result: "Synthetic media",
    result_status: "synthetic" as const,
    score: 18,
    created_at: "22 min ago",
    status: "Completed",
  },
  {
    task_id: "trn_62B81D",
    filename: "creator_upload.jpg",
    media_type: "Image",
    result: "Requires review",
    result_status: "review" as const,
    score: 61,
    created_at: "41 min ago",
    status: "Completed",
  },
  {
    task_id: "trn_51A92C",
    filename: "voice_sample.wav",
    media_type: "Audio",
    result: "Authentic",
    result_status: "authentic" as const,
    score: 89,
    created_at: "1 hr ago",
    status: "Completed",
  },
  {
    task_id: "trn_3D0B17",
    filename: "interview_clip.mp4",
    media_type: "Video",
    result: "Synthetic media",
    result_status: "synthetic" as const,
    score: 12,
    created_at: "2 hr ago",
    status: "Completed",
  },
];

const MOCK_SIGNALS = [
  { label: "Synthetic Media", sub: "Detection status", status: "Operational" },
  { label: "Provenance / C2PA", sub: "Verification status", status: "Operational" },
  { label: "Metadata", sub: "Analysis status", status: "Operational" },
  { label: "Forensic Signals", sub: "Analysis status", status: "Operational" },
];

// ─── Result badge ──────────────────────────────────────────────────────────────

type ResultStatus = "authentic" | "synthetic" | "review" | "insufficient";

function ResultBadge({ status, label }: { status: ResultStatus; label: string }) {
  const styles: Record<ResultStatus, string> = {
    authentic:
      "text-risk-low bg-risk-low-bg border-risk-low-border",
    synthetic:
      "text-risk-high bg-risk-high-bg border-risk-high-border",
    review:
      "text-risk-medium bg-risk-medium-bg border-risk-medium-border",
    insufficient: "text-text-tertiary bg-surface-app border-border-default",
  };
  return (
    <span
      className={`font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${styles[status]}`}
    >
      {label}
    </span>
  );
}

// ─── Score cell ────────────────────────────────────────────────────────────────

function ScoreCell({ score, status }: { score: number; status: ResultStatus }) {
  const color =
    status === "authentic"
      ? "text-risk-low"
      : status === "synthetic"
      ? "text-risk-high"
      : "text-risk-medium";
  return (
    <span className={`font-mono text-sm font-bold ${color}`}>{score}</span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function PortalOverviewPage() {
  const m = MOCK_METRICS;
  const h = MOCK_API_HEALTH;
  const planUsedPct = Math.round((m.api_requests / m.api_requests_limit) * 100);

  return (
    <AppShell
      topBarProps={{
        title: "Overview",
        environment: "sandbox",
        breadcrumbs: [
          { label: "Workspace", href: "/portal" },
          { label: "Overview" },
        ],
      }}
    >
      {/* ── Page Header ── */}
      <SectionHeading
        eyebrow="OVERVIEW"
        title="Verification infrastructure at a glance."
        description="Monitor verification activity, API usage, and the health of your organization's TRINETRA workspace."
        action={
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Zap className="size-3.5" aria-hidden="true" />}
            onClick={() => {}}
          >
            Run verification
          </Button>
        }
      />

      <Divider />

      {/* ── KPI Metrics Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Verifications"
          value={m.verifications_total.toLocaleString()}
          icon={Activity}
          delta={{ value: m.verifications_delta, direction: "up", positiveDirection: "up" }}
          subtext="Last 30 days"
        />
        <MetricCard
          label="Verification Pass Rate"
          value={`${m.pass_rate}%`}
          icon={ShieldCheck}
          valueVariant="success"
          delta={{ value: m.pass_rate_delta, direction: "up", positiveDirection: "up" }}
          subtext="Authentic + low-risk outcomes"
        />
        <MetricCard
          label="API Requests"
          value={m.api_requests.toLocaleString()}
          icon={Zap}
          delta={{ value: "This billing period", direction: "neutral" }}
          subtext={`${planUsedPct}% of plan limit`}
          progress={{
            current: m.api_requests,
            max: m.api_requests_limit,
            label: `${m.api_requests.toLocaleString()} / ${m.api_requests_limit.toLocaleString()}`,
          }}
        />
        <MetricCard
          label="Avg. Response Time"
          value={`${m.avg_response_ms}`}
          unit="ms"
          icon={Timer}
          valueVariant="brand"
          delta={{ value: `p95 · ${(m.p95_response_ms / 1000).toFixed(2)} s`, direction: "neutral" }}
          subtext="Webhook delivery latency"
        />
      </div>

      <Divider />

      {/* ── Main 2-column: Activity Chart + Outcome Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left: Verification Activity */}
        <div className="bg-surface-base border border-border-default rounded-md p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-text-primary">
              Verification activity
            </h2>
            <span className="font-mono text-[10px] text-text-tertiary">
              Last 30 days
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-mono text-2xl font-bold text-text-primary">
              {m.verifications_total.toLocaleString()}
            </span>
            <span className="font-mono text-xs text-risk-low font-semibold">
              {m.verifications_delta} from previous period
            </span>
          </div>
          <InlineBarChart
            data={MOCK_ACTIVITY}
            height={160}
            xLabelInterval={5}
            formatY={(v) => `${Math.round(v / 100) * 100}`}
            formatTooltip={(p) => `${p.label}: ${p.value.toLocaleString()} verifications`}
            aria-label="Daily verification volume over the last 30 days"
          />
        </div>

        {/* Right: Outcome breakdown */}
        <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-text-primary">
            Verification outcomes
          </h2>
          <ProportionBar segments={MOCK_OUTCOMES} />
          <div className="flex flex-col gap-2.5 pt-1">
            {MOCK_OUTCOMES.map((o) => {
              const total = MOCK_OUTCOMES.reduce((a, x) => a + x.value, 0);
              const pct = ((o.value / total) * 100).toFixed(1);
              return (
                <div key={o.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-2 rounded-sm shrink-0"
                      style={{ backgroundColor: o.color }}
                      aria-hidden="true"
                    />
                    <span className="text-xs text-text-secondary truncate">
                      {o.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 shrink-0">
                    <span className="font-mono text-xs font-bold text-text-primary">
                      {pct}%
                    </span>
                    <span className="font-mono text-[10px] text-text-tertiary">
                      {o.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Verifications table ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">
            Recent verifications
          </h2>
          <Link
            href="/portal/logs"
            className="flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600 hover:underline transition-colors focus-visible:outline-brand-500 rounded"
          >
            View all
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="bg-surface-base border border-border-default rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm min-w-[640px]"
              role="table"
              aria-label="Recent verifications"
            >
              <thead>
                <tr className="bg-surface-subtle border-b border-border-default">
                  {[
                    "Task",
                    "File",
                    "Type",
                    "Result",
                    "Score",
                    "Created",
                    "Status",
                  ].map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="text-left px-4 py-2.5 font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_RECENT_VERIFICATIONS.map((row) => (
                  <tr
                    key={row.task_id}
                    className="border-b border-border-default last:border-0 hover:bg-surface-subtle transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/portal/logs/${row.task_id}`}
                        className="font-mono text-xs text-brand-600 hover:underline focus-visible:outline-brand-500 rounded"
                      >
                        {row.task_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-primary truncate max-w-[160px] block">
                        {row.filename}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-text-tertiary">
                        {row.media_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ResultBadge
                        status={row.result_status}
                        label={row.result}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreCell
                        score={row.score}
                        status={row.result_status}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-text-tertiary flex items-center gap-1">
                        <Clock className="size-3 shrink-0" aria-hidden="true" />
                        {row.created_at}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 font-mono text-[10px] text-risk-low font-semibold uppercase">
                        <CheckCircle2 className="size-3 shrink-0" aria-hidden="true" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Verification Signals ── */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">
          Verification signals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOCK_SIGNALS.map((sig) => (
            <div
              key={sig.label}
              className="bg-surface-base border border-border-default rounded-md px-4 py-3 flex items-start gap-3"
            >
              <div className="size-2 rounded-full bg-risk-low shrink-0 mt-1.5" aria-hidden="true" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-text-primary leading-tight">
                  {sig.label}
                </span>
                <span className="font-mono text-[10px] text-text-tertiary">
                  {sig.sub}
                </span>
                <span className="font-mono text-[10px] font-semibold text-risk-low mt-0.5 uppercase tracking-wider">
                  {sig.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── Bottom 2-column: API Health + Current Plan ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Health */}
        <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-risk-low" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-text-primary">
              API health
            </h2>
            <span className="ml-auto font-mono text-[10px] font-bold text-risk-low uppercase tracking-wider px-2 py-0.5 border border-risk-low-border bg-risk-low-bg rounded">
              Operational
            </span>
          </div>
          <div className="flex flex-col divide-y divide-border-default">
            {[
              { label: "API availability", value: `${h.availability_pct}%` },
              { label: "Median latency", value: `${h.median_latency_ms} ms` },
              { label: "p95 latency", value: `${(h.p95_latency_ms / 1000).toFixed(2)} s` },
              {
                label: "Last incident",
                value: h.last_incident ?? "No active incidents",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5"
              >
                <span className="text-xs text-text-secondary">{label}</span>
                <span className="font-mono text-xs font-semibold text-text-primary">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current plan + Sandbox CTA */}
        <div className="flex flex-col gap-4">
          {/* Plan usage */}
          <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">
                Current plan
              </h2>
              <span className="font-mono text-[10px] font-bold text-brand-500 uppercase tracking-wider px-2 py-0.5 border border-brand-100 bg-brand-50 rounded">
                {MOCK_USER.plan}
              </span>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs text-text-secondary">
                  API requests this period
                </span>
                <span className="font-mono text-xs font-bold text-text-primary">
                  {planUsedPct}% used
                </span>
              </div>
              <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${planUsedPct}%` }}
                  role="progressbar"
                  aria-valuenow={planUsedPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="API request usage"
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="font-mono text-[10px] text-text-tertiary">
                  {m.api_requests.toLocaleString()} used
                </span>
                <span className="font-mono text-[10px] text-text-tertiary">
                  {m.api_requests_limit.toLocaleString()} limit
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-text-secondary">
                {(m.api_requests_limit - m.api_requests).toLocaleString()} requests remaining
              </span>
              <Link
                href="/portal/billing"
                className="text-xs font-medium text-brand-500 hover:text-brand-600 hover:underline transition-colors flex items-center gap-1 focus-visible:outline-brand-500 rounded"
              >
                Manage plan
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Sandbox CTA */}
          <div className="bg-surface-base border border-border-default rounded-md px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <FlaskConical
                className="size-4 text-text-tertiary shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-text-primary leading-tight">
                  Need to test a file?
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Run a verification in the TRINETRA Sandbox.
                </p>
              </div>
            </div>
            <Link
              href="/sandbox"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-500 border border-brand-500 rounded hover:bg-brand-600 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
            >
              Open Sandbox
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Model Worker Health (existing architecture retained) ── */}
      <Divider />
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="size-4 text-risk-low" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-text-primary">
            Model worker health
          </h2>
          <span className="font-mono text-[11px] text-risk-low bg-risk-low-bg border border-risk-low-border rounded-sm px-1.5 py-0.5 ml-1">
            9/9 Active
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { name: "AASIST", modality: "Audio", version: "v3.2.1-a9f31c" },
            { name: "RawNet3", modality: "Audio", version: "v2.0.0-77e21b" },
            { name: "FTCN", modality: "Video", version: "v1.4.0-1c88de" },
            { name: "SBI", modality: "Video", version: "v1.1.2-30af5e" },
            { name: "NPR", modality: "Image", version: "v1.3.0-5f9a2d" },
            { name: "UniversalFakeDetect", modality: "Image", version: "v2.1.0-8b4e1c" },
            { name: "c2pa-rs", modality: "Provenance", version: "v0.9.3-fc1a44" },
            { name: "Fusion Stacking", modality: "Meta-Learner", version: "v1.2.0-9d3b21" },
            { name: "ReportLab PDF", modality: "Report", version: "v4.0.1-2a7f9e" },
          ].map((model) => (
            <div
              key={model.name}
              className="flex items-center gap-3 px-3 py-2.5 bg-surface-base border border-border-default rounded"
            >
              <div
                className="size-2 rounded-full bg-risk-low shrink-0"
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {model.name}
                  </span>
                  <span className="font-mono text-[10px] text-text-tertiary shrink-0">
                    {model.modality}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-text-tertiary">
                  {model.version}
                </span>
              </div>
              <CheckCircle2
                className="size-4 text-risk-low shrink-0"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Role / org context notice (visible to Owner only in this mock) ── */}
      <div className="flex items-start gap-3 px-4 py-3 bg-surface-app border border-border-default rounded-md">
        <AlertCircle
          className="size-4 text-text-tertiary shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-medium text-text-primary">
            {MOCK_USER.organization} — {MOCK_USER.name}
          </p>
          <p className="font-mono text-[10px] text-text-tertiary">
            Organization {MOCK_USER.role} · Full workspace access ·{" "}
            <Link
              href="/portal/team"
              className="text-brand-500 hover:underline"
            >
              Manage team
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
