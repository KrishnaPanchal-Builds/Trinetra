"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import {
  SectionHeading,
  Button,
  Divider,
  Input,
  Tooltip,
} from "@/components/ui";
import { MOCK_WEBHOOKS, MOCK_WEBHOOK_DELIVERIES } from "@/lib/mock/integration";
import type { WebhookEndpoint, WebhookDelivery } from "@/types/api";
import {
  Plus,
  Webhook,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Globe,
  Zap,
  Copy,
  Check,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatTs(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "UTC",
  }) + " UTC";
}

// ─── Status indicator ─────────────────────────────────────────────────────────

const statusConfig = {
  active: {
    icon: CheckCircle2,
    label: "Active",
    class: "text-risk-low",
    bg: "bg-risk-low-bg border-risk-low-border",
    dot: "bg-risk-low",
  },
  failing: {
    icon: AlertTriangle,
    label: "Failing",
    class: "text-risk-high",
    bg: "bg-risk-high-bg border-risk-high-border",
    dot: "bg-risk-high",
  },
  disabled: {
    icon: XCircle,
    label: "Disabled",
    class: "text-text-tertiary",
    bg: "bg-surface-subtle border-border-default",
    dot: "bg-text-tertiary",
  },
} satisfies Record<
  WebhookEndpoint["status"],
  { icon: React.ElementType; label: string; class: string; bg: string; dot: string }
>;

const EVENT_LABELS: Record<string, string> = {
  "analysis.completed": "analysis.completed",
  "analysis.failed": "analysis.failed",
  "analysis.flagged": "analysis.flagged",
};

// ─── DeliveryRow ─────────────────────────────────────────────────────────────

function DeliveryRow({ delivery }: { delivery: WebhookDelivery }) {
  const isSuccess = delivery.success;
  return (
    <tr className="border-b border-border-default last:border-0">
      <td className="px-4 py-2.5">
        <div className={["size-2 rounded-full", isSuccess ? "bg-risk-low" : "bg-risk-critical"].join(" ")} aria-hidden="true" />
      </td>
      <td className="px-4 py-2.5">
        <Link
          href={`/portal/logs/${delivery.task_id}`}
          className="font-mono text-xs text-brand-600 hover:underline"
        >
          {delivery.task_id}
        </Link>
      </td>
      <td className="px-4 py-2.5">
        <code className="font-mono text-[11px] text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded border border-border-default">
          {delivery.event}
        </code>
      </td>
      <td className="px-4 py-2.5">
        <span className={[
          "font-mono text-xs font-semibold",
          delivery.http_status === 200 ? "text-risk-low" : "text-risk-critical",
        ].join(" ")}>
          {delivery.http_status}
        </span>
      </td>
      <td className="px-4 py-2.5 hidden sm:table-cell">
        <span className="font-mono text-xs text-text-tertiary">
          {delivery.duration_ms >= 1000
            ? `${(delivery.duration_ms / 1000).toFixed(1)}s`
            : `${delivery.duration_ms}ms`}
        </span>
      </td>
      <td className="px-4 py-2.5 hidden md:table-cell">
        <span className="font-mono text-xs text-text-tertiary"
          title={formatTs(delivery.delivered_at)}>
          {relativeTime(delivery.delivered_at)}
        </span>
      </td>
    </tr>
  );
}

// ─── WebhookCard ─────────────────────────────────────────────────────────────

function WebhookCard({
  webhook,
  deliveries,
  onDelete,
}: {
  webhook: WebhookEndpoint;
  deliveries: WebhookDelivery[];
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const cfg = statusConfig[webhook.status];
  const failRate = webhook.total_deliveries > 0
    ? ((webhook.failed_deliveries / webhook.total_deliveries) * 100).toFixed(1)
    : "0.0";

  const copyUrl = async () => {
    await navigator.clipboard.writeText(webhook.url);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  return (
    <div className={[
      "bg-surface-base border rounded-md overflow-hidden",
      webhook.status === "failing" ? "border-risk-high-border" : "border-border-default",
    ].join(" ")}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
        {/* Status indicator */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={[
            "shrink-0 flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-wide px-2 py-1 rounded-sm border",
            cfg.bg, cfg.class,
          ].join(" ")}>
            <span className={["size-1.5 rounded-full", cfg.dot].join(" ")} aria-hidden="true" />
            {cfg.label}
          </div>

          {/* URL */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Globe className="size-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
            <span className="font-mono text-xs text-text-primary truncate">{webhook.url}</span>
            <Tooltip content={urlCopied ? "Copied!" : "Copy URL"} side="top">
              <button
                type="button"
                onClick={copyUrl}
                aria-label="Copy webhook URL"
                className="shrink-0 p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors"
              >
                {urlCopied
                  ? <Check className="size-3.5 text-risk-low" />
                  : <Copy className="size-3.5" />
                }
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right">
            <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">Deliveries</p>
            <p className="font-mono text-sm font-semibold text-text-primary">
              {webhook.total_deliveries.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">Fail Rate</p>
            <p className={[
              "font-mono text-sm font-semibold",
              parseFloat(failRate) > 5 ? "text-risk-high" : "text-risk-low",
            ].join(" ")}>
              {failRate}%
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">Last sent</p>
            <p className="font-mono text-xs text-text-secondary">
              {webhook.last_triggered_at ? relativeTime(webhook.last_triggered_at) : "Never"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Tooltip content="Send test event" side="top">
              <button
                type="button"
                aria-label="Send test event"
                className="p-1.5 rounded text-text-tertiary hover:text-brand-600 hover:bg-brand-50 transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <Zap className="size-4" aria-hidden="true" />
              </button>
            </Tooltip>
            <Tooltip content="Retry failed deliveries" side="top">
              <button
                type="button"
                aria-label="Retry failed deliveries"
                className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </button>
            </Tooltip>
            <Tooltip content="Delete endpoint" side="top">
              <button
                type="button"
                onClick={() => onDelete(webhook.id)}
                aria-label="Delete webhook endpoint"
                className="p-1.5 rounded text-text-tertiary hover:text-risk-critical hover:bg-risk-critical-bg transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </Tooltip>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              aria-label={expanded ? "Collapse delivery log" : "Expand delivery log"}
              aria-expanded={expanded}
              className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors ml-1 focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              {expanded
                ? <ChevronUp className="size-4" aria-hidden="true" />
                : <ChevronDown className="size-4" aria-hidden="true" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Event subscriptions */}
      <div className="px-5 pb-3 flex flex-wrap gap-2 border-t border-border-default pt-3">
        <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mr-1 self-center">Events:</span>
        {webhook.events.map((ev) => (
          <code key={ev} className="font-mono text-[11px] text-text-secondary bg-surface-subtle px-2 py-0.5 rounded border border-border-default">
            {EVENT_LABELS[ev] ?? ev}
          </code>
        ))}
        {webhook.last_http_status && (
          <span className="ml-auto font-mono text-[11px] text-text-tertiary self-center">
            Last status:{" "}
            <span className={webhook.last_http_status === 200 ? "text-risk-low" : "text-risk-critical"}>
              HTTP {webhook.last_http_status}
            </span>
          </span>
        )}
      </div>

      {/* Delivery log (expandable) */}
      {expanded && (
        <div className="border-t border-border-default">
          <div className="px-5 py-2.5 bg-surface-subtle flex items-center gap-2">
            <Activity className="size-3.5 text-text-tertiary" aria-hidden="true" />
            <span className="text-xs font-semibold text-text-secondary">
              Recent Deliveries
            </span>
            <span className="font-mono text-[10px] text-text-tertiary ml-1">
              {deliveries.length} shown
            </span>
          </div>
          {deliveries.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-6">No deliveries recorded for this endpoint.</p>
          ) : (
            <table className="w-full text-sm" aria-label="Webhook delivery log">
              <thead>
                <tr className="border-b border-border-default">
                  <th scope="col" className="px-4 py-2 text-left text-[10px] font-mono font-semibold text-text-tertiary uppercase tracking-wider w-6" aria-label="Status" />
                  <th scope="col" className="px-4 py-2 text-left text-[10px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">Task ID</th>
                  <th scope="col" className="px-4 py-2 text-left text-[10px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">Event</th>
                  <th scope="col" className="px-4 py-2 text-left text-[10px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">HTTP</th>
                  <th scope="col" className="px-4 py-2 text-left text-[10px] font-mono font-semibold text-text-tertiary uppercase tracking-wider hidden sm:table-cell">Duration</th>
                  <th scope="col" className="px-4 py-2 text-left text-[10px] font-mono font-semibold text-text-tertiary uppercase tracking-wider hidden md:table-cell">Delivered</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => <DeliveryRow key={d.id} delivery={d} />)}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Webhook Panel (inline) ───────────────────────────────────────────────

function AddWebhookPanel({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["analysis.flagged"]);

  const toggleEvent = (ev: string) => {
    setEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  };

  const ALL_EVENTS = ["analysis.completed", "analysis.failed", "analysis.flagged"];

  return (
    <div className="bg-surface-base border border-border-strong rounded-md p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Register Webhook Endpoint</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-text-tertiary hover:text-text-primary font-mono uppercase tracking-wide hover:bg-surface-subtle px-2 py-1 rounded transition-colors"
        >
          Cancel
        </button>
      </div>

      <Input
        label="Callback URL"
        placeholder="https://your-platform.com/api/trinetra-webhook"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        leadingIcon={<ExternalLink className="size-4" />}
        helperText="TRINETRA will POST analysis results to this URL within 18 seconds of scan completion."
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-text-secondary">Subscribe to Events</label>
        <div className="flex flex-col gap-2">
          {ALL_EVENTS.map((ev) => (
            <label key={ev} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={events.includes(ev)}
                onChange={() => toggleEvent(ev)}
                className="size-4 rounded border-border-strong accent-brand-500 cursor-pointer"
              />
              <code className="font-mono text-xs text-text-secondary group-hover:text-text-primary transition-colors">{ev}</code>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!url.startsWith("https://") || events.length === 0}
          leadingIcon={<Webhook className="size-3.5" />}
        >
          Register Endpoint
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(MOCK_WEBHOOKS);
  const [showAdd, setShowAdd] = useState(false);

  const handleDelete = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const getDeliveries = (id: string): WebhookDelivery[] =>
    MOCK_WEBHOOK_DELIVERIES.filter((d) => d.webhook_id === id);

  return (
    <AppShell
      topBarProps={{
        title: "Webhooks",
        environment: "sandbox",
        breadcrumbs: [
          { label: "Workspace", href: "/portal" },
          { label: "Webhooks" },
        ],
      }}
    >
      <SectionHeading
        eyebrow="INTEGRATION"
        title="Webhooks"
        description="Register callback URLs to receive analysis results automatically. TRINETRA POSTs a structured JSON payload to your endpoint within 18 seconds of scan completion."
        action={
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Plus className="size-3.5" />}
            onClick={() => setShowAdd((s) => !s)}
          >
            Add Endpoint
          </Button>
        }
      />

      {showAdd && <AddWebhookPanel onClose={() => setShowAdd(false)} />}

      <Divider />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Endpoints", value: webhooks.filter(w => w.status === "active").length, icon: CheckCircle2, color: "text-risk-low" },
          { label: "Failing", value: webhooks.filter(w => w.status === "failing").length, icon: AlertTriangle, color: "text-risk-high" },
          { label: "Total Deliveries", value: webhooks.reduce((a, w) => a + w.total_deliveries, 0).toLocaleString(), icon: Activity, color: "text-brand-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface-base border border-border-default rounded-md px-4 py-3 flex items-center gap-3">
            <Icon className={["size-4 shrink-0", color].join(" ")} aria-hidden="true" />
            <div>
              <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
              <p className="font-mono text-xl font-semibold text-text-primary">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook cards */}
      <div className="flex flex-col gap-4">
        {webhooks.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center bg-surface-base border border-border-default rounded-md">
            <Webhook className="size-10 text-text-tertiary" aria-hidden="true" />
            <h3 className="text-base font-semibold text-text-primary">No Endpoints Registered</h3>
            <p className="text-sm text-text-secondary max-w-sm">
              Register a callback URL to receive real-time analysis results without polling the API.
            </p>
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<Plus className="size-3.5" />}
              onClick={() => setShowAdd(true)}
            >
              Add First Endpoint
            </Button>
          </div>
        ) : (
          webhooks.map((wh) => (
            <WebhookCard
              key={wh.id}
              webhook={wh}
              deliveries={getDeliveries(wh.id)}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <Divider />

      {/* Payload reference */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Webhook Payload Reference</h2>
        <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-3">
          <p className="text-sm text-text-secondary">
            TRINETRA will POST the following JSON structure to your registered URL.
            Verify the signature header{" "}
            <code className="font-mono text-xs bg-surface-subtle px-1.5 py-0.5 rounded border border-border-default">
              X-Trinetra-Signature
            </code>{" "}
            to confirm authenticity.
          </p>
          <div className="font-mono text-xs bg-[#0f172a] text-[#94a3b8] rounded-md px-4 py-3 border border-[#1e293b] overflow-x-auto whitespace-pre">
{`POST https://your-platform.com/api/trinetra-webhook
X-Trinetra-Signature: sha256=<hmac_hex>
Content-Type: application/json

{
  "task_id":                    "trk_982347110_x",
  "authenticity_evidence_score": 31,
  "risk_level":                 "HIGH_RISK",
  "confidence_interval":        "HIGH",
  "primary_anomaly":            "SYNTHETIC_AUDIO_DUBBING",
  "action_recommendation":      "AUTO_HOLD_FOR_HUMAN_TRIAGE",
  "audit_pdf_report_url":       "https://api.trinetra.ai/reports/..."
}`}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
