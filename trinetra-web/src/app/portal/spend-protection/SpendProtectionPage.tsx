"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout";
import { SectionHeading, Button, Divider } from "@/components/ui";
import { MOCK_CREDIT_BALANCE, MOCK_BILLING_SUMMARY } from "@/lib/mock/usage";
import {
  ShieldAlert,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Ban,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(usd: number) {
  return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Cap presets ──────────────────────────────────────────────────────────────

const CAP_PRESETS = [500, 1_000, 2_500, 5_000, 10_000];

// ─── Alert threshold presets ──────────────────────────────────────────────────

const ALERT_THRESHOLDS = [50, 60, 75, 80, 90];

// ─── Behavior when cap is hit ─────────────────────────────────────────────────

type CapBehavior = "reject" | "queue";

// ─── FAQ item ────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-default last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-3 text-left focus-visible:outline-brand-500"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-text-primary">{q}</span>
        {open
          ? <ChevronUp className="size-4 text-text-tertiary shrink-0" aria-hidden="true" />
          : <ChevronDown className="size-4 text-text-tertiary shrink-0" aria-hidden="true" />
        }
      </button>
      {open && (
        <p className="pb-3 text-sm text-text-secondary">{a}</p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function SpendProtectionPage() {
  const bal = MOCK_CREDIT_BALANCE;
  const summary = MOCK_BILLING_SUMMARY;

  const [capEnabled, setCapEnabled] = useState(bal.spend_cap_enabled);
  const [capAmount, setCapAmount] = useState(bal.spend_cap_usd ?? 5_000);
  const [customCap, setCustomCap] = useState("");
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [behavior, setBehavior] = useState<CapBehavior>("reject");
  const [saved, setSaved] = useState(false);

  const spendPct = Math.round((bal.current_spend_usd / capAmount) * 100);
  const remainingUntilCap = Math.max(0, capAmount - bal.current_spend_usd);
  const isNearCap = spendPct >= alertThreshold;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell
      topBarProps={{
        title: "Spend Protection",
        environment: "sandbox",
        breadcrumbs: [{ label: "Portal", href: "/portal" }, { label: "Spend Protection" }],
      }}
    >
      <SectionHeading
        eyebrow="Billing"
        title="Spend Protection"
        description="Configure a hard spending cap to prevent unexpected overage charges. When the cap is reached, TRINETRA automatically stops processing new scan requests until the cap is raised or the billing period resets."
      />

      <Divider />

      {/* ── Status summary card ── */}
      <div className={[
        "flex flex-wrap items-center gap-4 px-5 py-4 rounded-md border",
        isNearCap && capEnabled
          ? "bg-risk-high-bg border-risk-high-border"
          : capEnabled
          ? "bg-risk-low-bg border-risk-low-border"
          : "bg-surface-subtle border-border-default",
      ].join(" ")}>
        <div className="flex items-center gap-2">
          {capEnabled
            ? isNearCap
              ? <AlertTriangle className="size-5 text-risk-high shrink-0" aria-hidden="true" />
              : <ShieldCheck className="size-5 text-risk-low shrink-0" aria-hidden="true" />
            : <ShieldAlert className="size-5 text-text-tertiary shrink-0" aria-hidden="true" />
          }
          <span className={[
            "text-sm font-semibold",
            capEnabled && isNearCap ? "text-risk-high" : capEnabled ? "text-risk-low" : "text-text-tertiary",
          ].join(" ")}>
            {capEnabled
              ? isNearCap
                ? `Warning: ${spendPct}% of spend cap consumed`
                : "Spend Protection Active"
              : "Spend Protection Disabled"
            }
          </span>
        </div>

        <div className="flex flex-wrap gap-6 ml-0 sm:ml-4">
          {[
            { label: "Spend Cap", value: fmt(capAmount) },
            { label: "Current Spend", value: fmt(bal.current_spend_usd) },
            { label: "Remaining", value: fmt(remainingUntilCap) },
            { label: "Cap Used", value: `${Math.min(100, spendPct)}%` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
              <p className="font-mono text-sm font-semibold text-text-primary">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Spend progress bar ── */}
      {capEnabled && (
        <div className="flex flex-col gap-1.5 bg-surface-base border border-border-default rounded-md p-4">
          <div className="flex justify-between text-[11px] font-mono text-text-tertiary mb-1">
            <span>$0</span>
            <span>Alert at {alertThreshold}%</span>
            <span>{fmt(capAmount)}</span>
          </div>
          <div className="h-4 bg-surface-raised rounded-sm overflow-hidden relative">
            {/* Alert threshold marker */}
            <div
              className="absolute top-0 bottom-0 w-px bg-risk-high opacity-60 z-10"
              style={{ left: `${alertThreshold}%` }}
              aria-hidden="true"
            />
            {/* Spend bar */}
            <div
              className={[
                "h-full rounded-sm transition-all",
                spendPct >= alertThreshold ? "bg-risk-high" : "bg-brand-500",
              ].join(" ")}
              style={{ width: `${Math.min(100, spendPct)}%` }}
              role="progressbar"
              aria-valuenow={Math.min(100, spendPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Spend cap utilisation"
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-text-tertiary">
            <span className={spendPct >= alertThreshold ? "text-risk-high font-semibold" : ""}>
              {fmt(bal.current_spend_usd)} used ({spendPct}%)
            </span>
            <span>{fmt(remainingUntilCap)} remaining</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Cap settings ── */}
        <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-5">
          {/* Enable toggle */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">Enable Spend Protection</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Reject new API requests when your monthly bill reaches the cap.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCapEnabled((e) => !e)}
              aria-label={capEnabled ? "Disable spend protection" : "Enable spend protection"}
              aria-pressed={capEnabled}
              className="focus-visible:outline-brand-500 rounded"
            >
              {capEnabled
                ? <ToggleRight className="size-8 text-brand-500" aria-hidden="true" />
                : <ToggleLeft className="size-8 text-text-tertiary" aria-hidden="true" />
              }
            </button>
          </div>

          <Divider />

          {/* Cap amount */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-secondary">Monthly Spending Cap</label>
            <div className="flex flex-wrap gap-2">
              {CAP_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setCapAmount(preset); setCustomCap(""); }}
                  disabled={!capEnabled}
                  className={[
                    "px-3 py-1.5 rounded border text-sm font-mono font-medium transition-colors",
                    !capEnabled ? "opacity-40 cursor-not-allowed" :
                      capAmount === preset && !customCap
                        ? "border-brand-500 bg-brand-50 text-brand-600"
                        : "border-border-default bg-surface-base text-text-secondary hover:bg-surface-subtle",
                  ].join(" ")}
                >
                  {fmt(preset)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-tertiary">Custom:</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-text-tertiary font-mono">$</span>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 7500"
                  value={customCap}
                  disabled={!capEnabled}
                  onChange={(e) => {
                    setCustomCap(e.target.value);
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) setCapAmount(v);
                  }}
                  className="h-8 w-28 pl-6 pr-2 text-sm font-mono bg-surface-base border border-border-default rounded focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-40"
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* Alert threshold */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-secondary">
              Alert Threshold
              <span className="ml-1.5 text-text-tertiary font-normal">
                — notify when spend reaches this % of the cap
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ALERT_THRESHOLDS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAlertThreshold(t)}
                  disabled={!capEnabled}
                  className={[
                    "px-3 py-1.5 rounded border text-sm font-mono font-medium transition-colors",
                    !capEnabled ? "opacity-40 cursor-not-allowed" :
                      alertThreshold === t
                        ? "border-brand-500 bg-brand-50 text-brand-600"
                        : "border-border-default bg-surface-base text-text-secondary hover:bg-surface-subtle",
                  ].join(" ")}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>

          <Divider />

          {/* Behavior */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-secondary">When Cap Is Hit</label>
            <div className="flex flex-col gap-2">
              {([
                { value: "reject" as CapBehavior, label: "Reject new scan requests", desc: "Return 402 Payment Required. Clients must handle this error.", icon: Ban },
                { value: "queue" as CapBehavior, label: "Queue requests until reset", desc: "Hold jobs in Redis until the billing period resets.", icon: AlertTriangle },
              ]).map(({ value, label, desc, icon: Icon }) => (
                <label key={value} className={[
                  "flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors",
                  !capEnabled ? "opacity-40 cursor-not-allowed" :
                    behavior === value
                      ? "border-brand-500 bg-brand-50"
                      : "border-border-default bg-surface-base hover:bg-surface-subtle",
                ].join(" ")}>
                  <input
                    type="radio"
                    name="cap-behavior"
                    value={value}
                    checked={behavior === value}
                    disabled={!capEnabled}
                    onChange={() => setBehavior(value)}
                    className="mt-0.5 accent-brand-500"
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="size-3.5 text-text-tertiary" aria-hidden="true" />
                      <span className="text-sm font-medium text-text-primary">{label}</span>
                    </div>
                    <span className="text-xs text-text-secondary">{desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              leadingIcon={saved ? <CheckCircle2 className="size-3.5" /> : undefined}
            >
              {saved ? "Saved" : "Save Protection Settings"}
            </Button>
            {saved && (
              <span className="text-xs text-risk-low font-medium">Changes applied.</span>
            )}
          </div>
        </div>

        {/* ── Right: Info panels ── */}
        <div className="flex flex-col gap-4">
          {/* What happens when cap is hit */}
          <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-brand-500" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-text-primary">How Spend Protection Works</h3>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                { step: "1", text: "Your API usage is metered in real time against the monthly cap." },
                { step: "2", text: `When spend reaches ${alertThreshold}% of the cap, all registered webhook URLs receive an alert notification.` },
                { step: "3", text: behavior === "reject"
                  ? "Once the cap is reached, new scan requests return 402 Payment Required immediately — in-flight scans complete normally."
                  : "Once the cap is reached, new jobs are held in the Redis queue until the billing period resets." },
                { step: "4", text: "Sandbox API usage is never counted toward the cap." },
                { step: "5", text: "Raising the cap takes effect within 60 seconds." },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3 text-xs text-text-secondary">
                  <span className="shrink-0 size-5 rounded-full border border-border-strong flex items-center justify-center font-mono text-[10px] font-semibold text-text-tertiary">
                    {step}
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Current period summary */}
          <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-text-primary">Current Period Summary</h3>
            <dl className="flex flex-col gap-2.5">
              {[
                { label: "Plan", value: summary.plan_name },
                { label: "Scans Included", value: summary.scans_included.toLocaleString() },
                { label: "Scans Used", value: summary.scans_used.toLocaleString() },
                { label: "Overage Rate", value: `${fmt(summary.overage_rate_per_scan_usd)} / scan` },
                { label: "Estimated Bill", value: fmt(summary.estimated_bill_usd) },
                { label: "Spend Cap", value: capEnabled ? fmt(capAmount) : "Not set" },
                { label: "Remaining Capacity", value: capEnabled ? fmt(remainingUntilCap) : "Unlimited" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-baseline gap-2">
                  <dt className="text-xs text-text-tertiary">{label}</dt>
                  <dd className="font-mono text-sm font-medium text-text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <Divider />

      {/* FAQ */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Frequently Asked Questions</h2>
        <div className="bg-surface-base border border-border-default rounded-md px-5 divide-y divide-border-default">
          {[
            {
              q: "Does the spend cap affect in-flight scans?",
              a: "No. When the cap is reached, new scan requests are affected. Scans already queued or processing will complete normally and will appear in your invoice."
            },
            {
              q: "Do sandbox API calls count toward the cap?",
              a: "No. Sandbox environment usage is never billed and never counts toward any spend cap."
            },
            {
              q: "How quickly does a cap change take effect?",
              a: "Cap changes take effect within 60 seconds of saving. The change is propagated to all active Celery workers on the next heartbeat cycle."
            },
            {
              q: "Can I set a cap lower than my current spend?",
              a: "Yes, but the new lower cap will immediately halt new scan requests if your current spend already exceeds it."
            },
            {
              q: "Will I be notified before hitting the cap?",
              a: "Yes. When your spend reaches the configured alert threshold (default 80%), TRINETRA will send an alert to all registered webhook URLs with the event type billing.cap_approaching."
            },
          ].map(({ q, a }) => (
            <FAQItem key={q} q={q} a={a} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
