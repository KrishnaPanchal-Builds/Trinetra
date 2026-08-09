"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout";
import { SectionHeading, Button, Divider, Badge } from "@/components/ui";
import {
  MOCK_CREDIT_BALANCE,
  MOCK_BILLING_SUMMARY,
} from "@/lib/mock/usage";
import {
  CreditCard,
  Download,
  CheckCircle2,
  ChevronRight,
  Receipt,
  Zap,
  Shield,
  Building2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(usd: number) {
  return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Mock invoice history ─────────────────────────────────────────────────────

const MOCK_INVOICES = [
  { id: "INV-2026-008", period: "Aug 2026", amount: 1_847.92, status: "open",    due: "2026-09-05", pdf: "#" },
  { id: "INV-2026-007", period: "Jul 2026", amount: 2_312.45, status: "paid",    due: "2026-08-05", pdf: "#" },
  { id: "INV-2026-006", period: "Jun 2026", amount: 1_980.00, status: "paid",    due: "2026-07-05", pdf: "#" },
  { id: "INV-2026-005", period: "May 2026", amount: 1_500.00, status: "paid",    due: "2026-06-05", pdf: "#" },
  { id: "INV-2026-004", period: "Apr 2026", amount: 876.34,  status: "paid",    due: "2026-05-05", pdf: "#" },
];

// ─── Plan cards data ──────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Starter",
    price: 49,
    scans: "10,000",
    features: ["10k scans / month", "Audio + Video", "Webhook delivery", "Standard SLA", "Email support"],
    cta: "Downgrade",
    current: false,
  },
  {
    name: "Growth",
    price: 299,
    scans: "50,000",
    features: ["50k scans / month", "All media types", "Priority webhooks", "99.9% SLA", "Dedicated support", "PDF audit reports"],
    cta: "Current Plan",
    current: true,
  },
  {
    name: "Enterprise",
    price: null,
    scans: "Custom",
    features: ["Unlimited scans", "All media types", "SLA guarantee", "DPDP / legal support", "Dedicated infra", "Custom integrations", "99.99% SLA"],
    cta: "Contact Sales",
    current: false,
  },
];

// ─── Plan Cards ───────────────────────────────────────────────────────────────

function PlanCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          className={[
            "rounded-md border p-5 flex flex-col gap-4",
            plan.current
              ? "border-brand-500 bg-brand-50"
              : "border-border-default bg-surface-base",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-base font-semibold text-text-primary">{plan.name}</p>
              <div className="flex items-baseline gap-1 mt-1">
                {plan.price ? (
                  <>
                    <span className="font-mono text-2xl font-bold text-text-primary">{fmt(plan.price)}</span>
                    <span className="text-xs text-text-tertiary">/ month</span>
                  </>
                ) : (
                  <span className="font-mono text-lg font-semibold text-text-secondary">Custom pricing</span>
                )}
              </div>
            </div>
            {plan.current && <Badge variant="production">Active</Badge>}
          </div>

          <p className="font-mono text-sm text-text-secondary">
            {plan.scans} scans included
          </p>

          <ul className="flex flex-col gap-1.5">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                <CheckCircle2 className="size-3.5 text-risk-low shrink-0" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>

          <Button
            variant={plan.current ? "secondary" : plan.name === "Enterprise" ? "primary" : "secondary"}
            size="sm"
            className="mt-auto"
            trailingIcon={plan.name === "Enterprise" ? <ExternalLink className="size-3.5" /> : undefined}
            disabled={plan.current}
          >
            {plan.cta}
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── Credit top-up panel ──────────────────────────────────────────────────────

const TOPUP_OPTIONS = [
  { credits: 10_000,  price: 50 },
  { credits: 25_000,  price: 110 },
  { credits: 50_000,  price: 200 },
  { credits: 100_000, price: 370 },
];

function CreditTopUp() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Zap className="size-4 text-brand-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-text-primary">Purchase Additional Scan Credits</h3>
      </div>
      <p className="text-xs text-text-secondary">
        Credits are added instantly and never expire within the current subscription period.
        Sandbox environment usage does not consume credits.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TOPUP_OPTIONS.map((opt) => (
          <button
            key={opt.credits}
            type="button"
            onClick={() => setSelected(opt.credits)}
            className={[
              "flex flex-col items-center gap-1 p-3 rounded border text-sm transition-colors",
              selected === opt.credits
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-border-default bg-surface-base text-text-secondary hover:bg-surface-subtle",
            ].join(" ")}
          >
            <span className="font-mono font-semibold">{opt.credits.toLocaleString()}</span>
            <span className="text-[11px] font-mono text-text-tertiary">credits</span>
            <span className="text-xs font-semibold mt-0.5">{fmt(opt.price)}</span>
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        size="sm"
        disabled={selected === null}
        leadingIcon={<CreditCard className="size-3.5" />}
        className="self-start"
      >
        {selected ? `Purchase ${selected.toLocaleString()} Credits` : "Select a Credit Pack"}
      </Button>
    </div>
  );
}

// ─── Invoice History ──────────────────────────────────────────────────────────

function InvoiceTable() {
  return (
    <div className="border border-border-default rounded-md overflow-hidden">
      <table className="w-full text-sm" aria-label="Invoice history">
        <thead>
          <tr className="bg-surface-subtle border-b border-border-default">
            {["Invoice", "Period", "Amount", "Status", "Due Date", ""].map((h) => (
              <th key={h} scope="col" className="px-4 py-2.5 text-left text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_INVOICES.map((inv) => (
            <tr key={inv.id} className="border-b border-border-default last:border-0 hover:bg-surface-subtle transition-colors">
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-text-primary">{inv.id}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-text-secondary">{inv.period}</span>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-sm font-semibold text-text-primary">{fmt(inv.amount)}</span>
              </td>
              <td className="px-4 py-3">
                <span className={[
                  "font-mono text-[11px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-sm border",
                  inv.status === "paid"
                    ? "text-risk-low bg-risk-low-bg border-risk-low-border"
                    : "text-brand-500 bg-brand-50 border-brand-100",
                ].join(" ")}>
                  {inv.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-text-tertiary">{fmtDate(inv.due)}</span>
              </td>
              <td className="px-4 py-3 text-right">
                <a
                  href={inv.pdf}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600 hover:underline"
                  aria-label={`Download ${inv.id}`}
                >
                  <Download className="size-3.5" aria-hidden="true" />
                  PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Payment Method ───────────────────────────────────────────────────────────

function PaymentMethod() {
  return (
    <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-text-tertiary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-text-primary">Payment Method</h3>
        </div>
        <Button variant="secondary" size="sm">Update</Button>
      </div>

      <div className="flex items-center gap-4 p-3 bg-surface-subtle border border-border-default rounded">
        <div className="size-10 rounded border border-border-default bg-surface-base flex items-center justify-center">
          <span className="font-mono text-[10px] font-bold text-text-secondary">VISA</span>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Visa ending ••••&nbsp;4242</p>
          <p className="text-xs text-text-tertiary">Expires 08 / 2028</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <CheckCircle2 className="size-4 text-risk-low" aria-hidden="true" />
          <span className="text-xs text-risk-low font-medium">Default</span>
        </div>
      </div>

      <p className="text-xs text-text-tertiary">
        Payments are processed securely via Stripe. TRINETRA does not store card numbers.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function BillingPage() {
  const bal = MOCK_CREDIT_BALANCE;
  const summary = MOCK_BILLING_SUMMARY;
  const overageScans = Math.max(0, summary.scans_used - summary.scans_included);
  const periodEnd = fmtDate(summary.billing_period_end);

  return (
    <AppShell
      topBarProps={{
        title: "Billing",
        environment: "sandbox",
        breadcrumbs: [{ label: "Portal", href: "/portal" }, { label: "Billing" }],
      }}
    >
      <SectionHeading
        eyebrow="Billing"
        title="Billing"
        description="Manage your subscription plan, purchase credits, review invoices, and update payment details."
        action={
          <Button variant="secondary" size="sm" leadingIcon={<Receipt className="size-3.5" />}>
            Download Latest Invoice
          </Button>
        }
      />

      <Divider />

      {/* Current plan summary bar */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-4 bg-surface-base border border-border-default rounded-md">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-text-tertiary shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-text-primary">{summary.plan_name} Plan</span>
          <Badge variant="production">Active</Badge>
        </div>
        <Divider orientation="vertical" className="h-5 hidden sm:block" />
        <div className="flex flex-wrap gap-6">
          {[
            { label: "Billing Period", value: `Resets ${periodEnd}` },
            { label: "Scans Used", value: `${summary.scans_used.toLocaleString()} / ${summary.scans_included.toLocaleString()}` },
            { label: "Estimated Bill", value: `$${summary.estimated_bill_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
            { label: "Credits Remaining", value: bal.remaining_credits.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
              <p className="font-mono text-sm font-semibold text-text-primary">{value}</p>
            </div>
          ))}
        </div>
        {overageScans > 0 && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded border border-risk-high-border bg-risk-high-bg">
            <span className="text-xs font-medium text-risk-high">
              {overageScans.toLocaleString()} overage scans — ${(overageScans * summary.overage_rate_per_scan_usd).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Subscription plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Subscription Plan</h2>
          <Button variant="ghost" size="sm" trailingIcon={<ArrowRight className="size-3.5" />}>
            Compare all plans
          </Button>
        </div>
        <PlanCards />
      </div>

      <Divider />

      {/* Credit top-up */}
      <CreditTopUp />

      <Divider />

      {/* Payment method + invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentMethod />
        <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-text-tertiary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-text-primary">Billing Guarantees</h3>
          </div>
          <ul className="flex flex-col gap-2">
            {[
              "Zero-retention pipeline — media is purged immediately after analysis.",
              "Sandbox API usage is never billed.",
              "Failed scans are not charged.",
              "Spend protection cap prevents unexpected overage charges.",
              "All charges are itemised per-scan in your invoice.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-text-secondary">
                <CheckCircle2 className="size-3.5 text-risk-low shrink-0 mt-0.5" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:underline mt-1"
          >
            Read full billing terms <ChevronRight className="size-3.5" />
          </a>
        </div>
      </div>

      <Divider />

      {/* Invoice history */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Invoice History</h2>
        <InvoiceTable />
      </div>
    </AppShell>
  );
}
