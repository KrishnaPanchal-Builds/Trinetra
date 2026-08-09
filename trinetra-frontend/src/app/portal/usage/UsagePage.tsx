"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import {
  SectionHeading,
  Button,
  Divider,
  Badge,
  StatusBadge,
} from "@/components/ui";
import {
  MetricCard,
  InlineBarChart,
  ProportionBar,
} from "@/components/portal";
import type { BarChartDataPoint } from "@/components/portal";
import {
  MOCK_DAILY_USAGE,
  MOCK_CREDIT_BALANCE,
  MOCK_BILLING_SUMMARY,
  MOCK_MODEL_PIPELINE_USAGE,
  MOCK_USAGE_HISTORY,
  MEDIA_TOTALS,
  MEDIA_TOTAL_ALL,
} from "@/lib/mock/usage";
import type { UsageHistoryRow } from "@/lib/mock/usage";
import {
  Download,
  CreditCard,
  BarChart2,
  FileVideo,
  FileAudio,
  FileImage,
  FileText,
  ShieldAlert,
  TrendingUp,
  Cpu,
  CalendarRange,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

// ─── Date range options ───────────────────────────────────────────────────────

type DateRange = "7d" | "14d" | "30d";

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  "7d": "Last 7 days",
  "14d": "Last 14 days",
  "30d": "Last 30 days",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(usd: number): string {
  return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
}

function fullDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });
}

// ─── Section header (used inline, smaller than SectionHeading) ────────────────

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Credit Balance Panel ─────────────────────────────────────────────────────

function CreditBalancePanel() {
  const bal = MOCK_CREDIT_BALANCE;
  const usedPct = Math.round((bal.used_credits / bal.total_credits) * 100);
  const remainingPct = 100 - usedPct;
  const spendPct = bal.spend_cap_usd
    ? Math.round((bal.current_spend_usd / bal.spend_cap_usd) * 100)
    : 0;
  const expiresDate = bal.expires_at
    ? new Date(bal.expires_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-text-tertiary uppercase tracking-wider mb-1">
            Credit Balance
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-bold text-text-primary">
              {bal.remaining_credits.toLocaleString()}
            </span>
            <span className="font-mono text-sm text-text-tertiary">
              / {bal.total_credits.toLocaleString()} credits
            </span>
          </div>
          <p className="text-xs text-text-tertiary mt-1">
            {remainingPct}% remaining · {usedPct}% consumed
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1 text-right">
          <Badge variant="production">Growth Plan</Badge>
          {expiresDate && (
            <span className="font-mono text-[11px] text-text-tertiary">
              Resets {expiresDate}
            </span>
          )}
        </div>
      </div>

      {/* Credit consumption bar */}
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-full bg-surface-raised rounded-sm overflow-hidden flex" aria-label="Credit consumption">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${usedPct}%` }}
            role="progressbar"
            aria-valuenow={usedPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Credits used"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-text-tertiary">
          <span>{bal.used_credits.toLocaleString()} used</span>
          <span>{bal.remaining_credits.toLocaleString()} remaining</span>
        </div>
      </div>

      {/* Spend cap */}
      <div className="border-t border-border-default pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">Spend Cap</span>
          <div className="flex items-center gap-2">
            {bal.spend_cap_enabled && (
              <span className="font-mono text-[11px] text-risk-low bg-risk-low-bg border border-risk-low-border rounded-sm px-1.5 py-0.5">
                ACTIVE
              </span>
            )}
            <span className="font-mono text-sm font-semibold text-text-primary">
              {formatCurrency(bal.spend_cap_usd ?? 0)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] text-text-tertiary mb-1">
            <span>Current spend</span>
            <span className="font-semibold text-text-primary">
              {formatCurrency(bal.current_spend_usd)}
            </span>
          </div>
          <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
            <div
              className={[
                "h-full rounded-full transition-all",
                spendPct > 80 ? "bg-risk-high" : "bg-brand-500",
              ].join(" ")}
              style={{ width: `${Math.min(100, spendPct)}%` }}
              role="progressbar"
              aria-valuenow={spendPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Spend cap utilisation"
            />
          </div>
          <p className="text-[10px] font-mono text-text-tertiary">
            {spendPct}% of spend cap consumed · {formatCurrency((bal.spend_cap_usd ?? 0) - bal.current_spend_usd)} remaining
          </p>
        </div>
      </div>

      <Button variant="secondary" size="sm" trailingIcon={<ArrowRight className="size-3.5" />}>
        Manage Plan & Credits
      </Button>
    </div>
  );
}

// ─── Billing Summary Panel ────────────────────────────────────────────────────

function BillingSummaryPanel() {
  const b = MOCK_BILLING_SUMMARY;
  const overageScans = Math.max(0, b.scans_used - b.scans_included);
  const overageCost = overageScans * b.overage_rate_per_scan_usd;

  const periodStart = new Date(b.billing_period_start).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const periodEnd = new Date(b.billing_period_end).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Current Plan</p>
          <p className="text-base font-semibold text-text-primary">{b.plan_name}</p>
        </div>
        <Button variant="secondary" size="sm">Upgrade Plan</Button>
      </div>

      <Divider />

      <dl className="flex flex-col gap-3">
        {[
          { label: "Billing Period", value: `${periodStart} – ${periodEnd}` },
          { label: "Scans Included", value: b.scans_included.toLocaleString() },
          { label: "Scans Used", value: b.scans_used.toLocaleString() },
          { label: "Overage Scans", value: overageScans > 0 ? overageScans.toLocaleString() : "None" },
          { label: "Overage Rate", value: `${formatCurrency(b.overage_rate_per_scan_usd)} / scan` },
          { label: "Overage Cost", value: formatCurrency(overageCost) },
          { label: "Estimated Bill", value: formatCurrency(b.estimated_bill_usd), highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="flex justify-between items-baseline gap-2">
            <dt className="text-xs text-text-tertiary">{label}</dt>
            <dd className={[
              "font-mono text-sm",
              highlight ? "font-semibold text-text-primary" : "text-text-secondary",
            ].join(" ")}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="pt-1">
        <Link
          href="/portal/billing"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600 hover:underline focus-visible:outline-brand-500"
        >
          View full billing details
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

// ─── Model Pipeline Table ─────────────────────────────────────────────────────

function ModelPipelineTable() {
  const data = MOCK_MODEL_PIPELINE_USAGE;
  const maxCredits = Math.max(...data.map((m) => m.credits_consumed));

  return (
    <div className="bg-surface-base border border-border-default rounded-md overflow-hidden">
      <table className="w-full text-sm" aria-label="Model pipeline usage">
        <thead>
          <tr className="bg-surface-subtle border-b border-border-default">
            {["Model", "Modality", "Scans", "Credits", "Avg Latency", "Share"].map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-2.5 text-left text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const sharePct = maxCredits > 0 ? (row.credits_consumed / maxCredits) * 100 : 0;
            const latencyS = row.avg_latency_ms >= 1000
              ? `${(row.avg_latency_ms / 1000).toFixed(1)}s`
              : `${row.avg_latency_ms}ms`;

            return (
              <tr key={row.model} className="border-b border-border-default last:border-0 hover:bg-surface-subtle transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-text-primary">{row.model}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-text-tertiary">{row.modality}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-text-secondary">
                    {row.scans_processed.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    {row.credits_consumed.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="font-mono text-xs text-text-tertiary">{latencyS}</span>
                </td>
                <td className="px-4 py-3 w-32 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${sharePct}%` }}
                        role="progressbar"
                        aria-valuenow={Math.round(sharePct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-text-tertiary w-8 text-right shrink-0">
                      {Math.round(sharePct)}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Usage History Table ──────────────────────────────────────────────────────

const MEDIA_ICONS: Record<UsageHistoryRow["media_type"], React.ElementType> = {
  video: FileVideo,
  audio: FileAudio,
  image: FileImage,
  document: FileText,
};

function UsageHistoryTable() {
  const [search, setSearch] = useState("");
  const [envFilter, setEnvFilter] = useState<"all" | "live" | "sandbox">("all");

  const filtered = MOCK_USAGE_HISTORY.filter((row) => {
    const matchSearch =
      !search ||
      row.task_id.toLowerCase().includes(search.toLowerCase()) ||
      row.date.includes(search);
    const matchEnv = envFilter === "all" || row.environment === envFilter;
    return matchSearch && matchEnv;
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-44 max-w-xs">
          <input
            type="search"
            placeholder="Search task ID or date…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-3 pr-3 text-sm bg-surface-base border border-border-default rounded focus-visible:outline-2 focus-visible:outline-brand-500 placeholder:text-text-tertiary text-text-primary"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "live", "sandbox"] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEnvFilter(e)}
              className={[
                "px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors",
                envFilter === e
                  ? "bg-brand-500 text-text-inverse"
                  : "bg-surface-base border border-border-default text-text-secondary hover:bg-surface-subtle",
              ].join(" ")}
            >
              {e === "all" ? "All" : e === "live" ? "Live" : "Sandbox"}
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-text-tertiary ml-auto">
          {filtered.length} records
        </span>
      </div>

      {/* Table */}
      <div className="border border-border-default rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]" aria-label="Usage history">
            <thead>
              <tr className="bg-surface-subtle border-b border-border-default">
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">Task ID</th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">Type</th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">AES</th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">Env</th>
                <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">Credits</th>
                <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">Cost</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-sm text-text-tertiary">
                    No records match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const Icon = MEDIA_ICONS[row.media_type];
                  return (
                    <tr key={row.task_id} className="border-b border-border-default last:border-0 hover:bg-surface-subtle transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-text-tertiary">{fullDate(row.date)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/portal/logs/${row.task_id}`}
                          className="font-mono text-xs text-brand-600 hover:underline focus-visible:outline-brand-500"
                        >
                          {row.task_id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Icon className="size-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                          <span className="text-xs text-text-secondary capitalize">{row.media_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.aes_score !== null ? (
                          <span className={[
                            "font-mono text-sm font-semibold",
                            row.aes_score <= 25 ? "text-risk-critical" :
                            row.aes_score <= 49 ? "text-risk-high" :
                            row.aes_score <= 69 ? "text-risk-medium" :
                            "text-risk-low",
                          ].join(" ")}>
                            {row.aes_score}
                          </span>
                        ) : (
                          <span className="text-text-tertiary font-mono text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={row.environment === "live" ? "production" : "sandbox"}>
                          {row.environment}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-text-primary">{row.credits_used}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-xs text-text-secondary">
                          {row.cost_usd > 0 ? formatCurrency(row.cost_usd) : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Footer totals */}
            <tfoot>
              <tr className="border-t border-border-strong bg-surface-subtle">
                <td colSpan={6} className="px-4 py-2.5 text-xs font-medium text-text-secondary">
                  Showing {filtered.length} of {MOCK_USAGE_HISTORY.length} records
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold text-text-primary">
                  {filtered.reduce((a, r) => a + r.credits_used, 0)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-text-primary">
                  {formatCurrency(filtered.reduce((a, r) => a + r.cost_usd, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function UsagePage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const daysToShow = dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : 30;
  const visibleData = MOCK_DAILY_USAGE.slice(-daysToShow);

  // Derived stats for visible range
  const periodTotalScans = visibleData.reduce((a, d) => a + d.total_scans, 0);
  const periodHighRisk = visibleData.reduce((a, d) => a + d.high_risk_detected, 0);
  const periodCost = visibleData.reduce((a, d) => a + d.cost_usd, 0);
  const avgDaily = Math.round(periodTotalScans / visibleData.length);

  // Chart data
  const chartData: BarChartDataPoint[] = visibleData.map((d, i) => ({
    label: shortDate(d.date),
    value: d.total_scans,
    highlight: i === visibleData.length - 1, // today
  }));

  // Media type segments
  const mediaSegments = [
    { label: "Video", value: MEDIA_TOTALS.video, color: "var(--color-brand-500)" },
    { label: "Audio", value: MEDIA_TOTALS.audio, color: "var(--color-brand-400)" },
    { label: "Image", value: MEDIA_TOTALS.image, color: "#60A5FA" },
    { label: "Document", value: MEDIA_TOTALS.document, color: "var(--color-surface-raised)" },
  ];

  const bal = MOCK_CREDIT_BALANCE;
  const usedPct = Math.round((bal.used_credits / bal.total_credits) * 100);

  return (
    <AppShell
      topBarProps={{
        title: "Usage & Credits",
        environment: "sandbox",
        breadcrumbs: [
          { label: "Workspace", href: "/portal" },
          { label: "Usage & Credits" },
        ],
      }}
    >
      {/* ── Page Header ── */}
      <SectionHeading
        eyebrow="OBSERVABILITY"
        title="Usage & Credits"
        description="Track scan consumption, credit balance, model pipeline usage, and cost across all API environments."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<RefreshCw className="size-3.5" />}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Download className="size-3.5" />}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      <Divider />

      {/* ── 1. KPI Overview ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Credits Remaining"
          value={bal.remaining_credits.toLocaleString()}
          icon={BarChart2}
          valueVariant="brand"
          progress={{
            current: bal.remaining_credits,
            max: bal.total_credits,
            label: `${100 - usedPct}% of ${bal.total_credits.toLocaleString()} purchased`,
          }}
        />
        <MetricCard
          label="Credits Used (Period)"
          value={bal.used_credits.toLocaleString()}
          icon={TrendingUp}
          delta={{ value: `${usedPct}%`, direction: "neutral" }}
          subtext={`of ${bal.total_credits.toLocaleString()} total`}
        />
        <MetricCard
          label="Current Spend"
          value={formatCurrency(bal.current_spend_usd)}
          icon={CreditCard}
          valueVariant={bal.current_spend_usd / (bal.spend_cap_usd ?? 1) > 0.8 ? "warning" : "default"}
          delta={{ value: `Cap: ${formatCurrency(bal.spend_cap_usd ?? 0)}`, direction: "neutral" }}
          subtext="Spend cap active"
        />
        <MetricCard
          label="High Risk Detected"
          value={periodHighRisk.toLocaleString()}
          icon={ShieldAlert}
          valueVariant="warning"
          delta={{ value: `${((periodHighRisk / periodTotalScans) * 100).toFixed(1)}% rate`, direction: "neutral" }}
          subtext={`of ${periodTotalScans.toLocaleString()} total scans`}
        />
      </div>

      <Divider />

      {/* ── 2. Daily Consumption Chart ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <SectionHeader title="Daily Scan Consumption" />
          <div className="flex items-center gap-1">
            <CalendarRange className="size-3.5 text-text-tertiary" aria-hidden="true" />
            <div className="flex gap-1 ml-1">
              {(["7d", "14d", "30d"] as DateRange[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDateRange(r)}
                  className={[
                    "px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors",
                    dateRange === r
                      ? "bg-brand-500 text-text-inverse"
                      : "bg-surface-base border border-border-default text-text-secondary hover:bg-surface-subtle",
                  ].join(" ")}
                >
                  {DATE_RANGE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-base border border-border-default rounded-md p-4">
          {/* Mini stats row */}
          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-border-default">
            {[
              { label: "Total Scans", value: periodTotalScans.toLocaleString() },
              { label: "Daily Average", value: avgDaily.toLocaleString() },
              { label: "Total Cost", value: formatCurrency(periodCost) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
                <p className="font-mono text-lg font-semibold text-text-primary">{value}</p>
              </div>
            ))}
          </div>

          <InlineBarChart
            data={chartData}
            height={150}
            xLabelInterval={daysToShow === 7 ? 1 : daysToShow === 14 ? 2 : 5}
            formatY={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
            formatTooltip={(p) => `${p.label}: ${p.value.toLocaleString()} scans`}
            aria-label="Daily scan volume chart"
          />

          <p className="font-mono text-[10px] text-text-tertiary mt-2">
            Highlighted bar = today (2026-08-08) · Scans pending as of last refresh
          </p>
        </div>
      </div>

      {/* ── 3. Media Type Breakdown ── */}
      <div>
        <SectionHeader title="Media Type Breakdown" />
        <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-5">
          <ProportionBar segments={mediaSegments} total={MEDIA_TOTAL_ALL} />

          {/* Per-type detail row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { type: "Video", icon: FileVideo, value: MEDIA_TOTALS.video, color: "text-brand-500" },
              { type: "Audio", icon: FileAudio, value: MEDIA_TOTALS.audio, color: "text-brand-400" },
              { type: "Image", icon: FileImage, value: MEDIA_TOTALS.image, color: "text-text-secondary" },
              { type: "Document", icon: FileText, value: MEDIA_TOTALS.document, color: "text-text-tertiary" },
            ].map(({ type, icon: Icon, value, color }) => (
              <div
                key={type}
                className="flex flex-col gap-1 p-3 bg-surface-subtle rounded border border-border-default"
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={["size-4", color].join(" ")} aria-hidden="true" />
                  <span className="text-xs font-medium text-text-secondary">{type}</span>
                </div>
                <span className="font-mono text-lg font-semibold text-text-primary">
                  {value.toLocaleString()}
                </span>
                <span className="font-mono text-[10px] text-text-tertiary">
                  {((value / MEDIA_TOTAL_ALL) * 100).toFixed(1)}% of total
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Credit Balance + Billing Summary (side by side on desktop) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreditBalancePanel />
        <BillingSummaryPanel />
      </div>

      <Divider />

      {/* ── 5. Model Pipeline Usage ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-text-tertiary" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-text-primary">Model Pipeline Usage</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-risk-low" aria-hidden="true" />
            <span className="font-mono text-[11px] text-risk-low">9/9 Active</span>
          </div>
        </div>
        <ModelPipelineTable />
      </div>

      <Divider />

      {/* ── 6. Usage History ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Usage History</h2>
          <Button
            variant="ghost"
            size="sm"
            trailingIcon={<ArrowRight className="size-3.5" />}
          >
            View all in Logs
          </Button>
        </div>
        <UsageHistoryTable />
      </div>
    </AppShell>
  );
}
