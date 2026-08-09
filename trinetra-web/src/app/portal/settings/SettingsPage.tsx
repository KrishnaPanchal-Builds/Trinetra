"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout";
import { SectionHeading, Button, Divider } from "@/components/ui";
import {
  Bell,
  Globe,
  Shield,
  Trash2,
  CheckCircle2,
  Upload,
  Copy,
  Check,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SaveButton({ label = "Save Changes", onSave }: { label?: string; onSave?: () => void }) {
  const [saved, setSaved] = useState(false);
  const handle = () => {
    setSaved(true);
    onSave?.();
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handle}
      leadingIcon={saved ? <CheckCircle2 className="size-3.5" /> : undefined}
    >
      {saved ? "Saved" : label}
    </Button>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-base border border-border-default rounded-md overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border-default bg-surface-subtle">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
      <div className="sm:w-48 shrink-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {hint && <p className="text-xs text-text-tertiary mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function TextInput({
  value: defaultValue,
  type = "text",
  placeholder,
  mono,
}: {
  value?: string;
  type?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  const [val, setVal] = useState(defaultValue ?? "");
  return (
    <input
      type={type}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      placeholder={placeholder}
      className={[
        "w-full h-9 px-3 text-sm bg-surface-base border border-border-default rounded focus-visible:outline-2 focus-visible:outline-brand-500 text-text-primary placeholder:text-text-tertiary",
        mono ? "font-mono" : "",
      ].join(" ")}
    />
  );
}

function Toggle({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer py-1">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={[
          "relative shrink-0 w-10 h-5 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-brand-500",
          on ? "bg-brand-500 border-brand-500" : "bg-surface-raised border-border-strong",
        ].join(" ")}
        aria-label={label}
      >
        <span
          className={[
            "absolute top-0.5 size-4 rounded-full bg-surface-base border border-border-strong transition-transform shadow-sm",
            on ? "translate-x-5" : "translate-x-0.5",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>
    </label>
  );
}

// ─── Account ID copy ──────────────────────────────────────────────────────────

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        readOnly
        value={value}
        className="flex-1 h-9 px-3 font-mono text-sm bg-surface-subtle border border-border-default rounded text-text-secondary"
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={copy}
        leadingIcon={copied ? <Check className="size-3.5 text-risk-low" /> : <Copy className="size-3.5" />}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SettingsPage() {
  return (
    <AppShell
      topBarProps={{
        title: "Settings",
        environment: "sandbox",
        breadcrumbs: [{ label: "Workspace", href: "/portal" }, { label: "Settings" }],
      }}
    >
      <SectionHeading
        eyebrow="ACCOUNT"
        title="Settings"
        description="Manage your organisation profile, notification preferences, security, and account-level configuration."
      />

      <Divider />

      {/* ── Organisation Profile ── */}
      <SettingsSection title="Organisation Profile">
        <FieldRow label="Organisation Name" hint="Displayed in the portal header.">
          <TextInput value="Acme Corp" />
        </FieldRow>
        <FieldRow label="Display Name" hint="Shown alongside your avatar.">
          <TextInput value="Nathaniel Voss" />
        </FieldRow>
        <FieldRow label="Primary Contact Email" hint="Used for billing and alert notifications.">
          <TextInput value="dev@acmecorp.com" type="email" />
        </FieldRow>
        <FieldRow label="Website">
          <TextInput value="https://acmecorp.com" type="url" />
        </FieldRow>
        <FieldRow label="Country / Region">
          <select className="w-full h-9 px-3 text-sm bg-surface-base border border-border-default rounded focus-visible:outline-2 focus-visible:outline-brand-500 text-text-primary">
            <option>India</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Singapore</option>
          </select>
        </FieldRow>
        <FieldRow label="Industry">
          <select className="w-full h-9 px-3 text-sm bg-surface-base border border-border-default rounded focus-visible:outline-2 focus-visible:outline-brand-500 text-text-primary">
            <option>Social Media & UGC</option>
            <option>FinTech & KYC</option>
            <option>Digital Media & News</option>
            <option>Matrimony & Dating</option>
            <option>Legal & Compliance</option>
            <option>Other</option>
          </select>
        </FieldRow>
        <FieldRow label="Organisation Logo">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded border border-border-default bg-surface-subtle flex items-center justify-center">
              <span className="font-mono text-base font-bold text-text-tertiary">A</span>
            </div>
            <Button variant="secondary" size="sm" leadingIcon={<Upload className="size-3.5" />}>
              Upload Logo
            </Button>
            <span className="text-xs text-text-tertiary">PNG or SVG, max 512KB</span>
          </div>
        </FieldRow>
        <div className="flex justify-end pt-1">
          <SaveButton label="Save Profile" />
        </div>
      </SettingsSection>

      {/* ── Account Identifiers ── */}
      <SettingsSection title="Account Identifiers">
        <FieldRow label="Account ID" hint="Use this in support requests.">
          <CopyField value="acct_TRN-00247832-ACP" />
        </FieldRow>
        <FieldRow label="Organisation Slug" hint="Read-only — used in API metadata.">
          <CopyField value="acme-corp" />
        </FieldRow>
        <FieldRow label="Member Since">
          <p className="text-sm text-text-secondary py-1.5">15 Jan 2026</p>
        </FieldRow>
      </SettingsSection>

      {/* ── Notifications ── */}
      <SettingsSection title="Notifications">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="size-4 text-text-tertiary" aria-hidden="true" />
          <p className="text-xs text-text-tertiary">Configure which events trigger webhook or email notifications.</p>
        </div>
        <div className="flex flex-col divide-y divide-border-default">
          <div className="py-2">
            <p className="text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider mb-2">
              Analysis Events
            </p>
            <div className="flex flex-col gap-2">
              <Toggle label="Flagged scan detected" description="Notify when any scan returns AES ≤ 49." defaultChecked={true} />
              <Toggle label="Critical scan detected" description="Notify when AES ≤ 25 (Critical risk)." defaultChecked={true} />
              <Toggle label="Scan completed" description="Notify on every completed scan." defaultChecked={false} />
              <Toggle label="Scan failed" description="Notify if a scan job fails or times out." defaultChecked={true} />
            </div>
          </div>
          <div className="py-2">
            <p className="text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider mb-2 mt-1">
              Billing Events
            </p>
            <div className="flex flex-col gap-2">
              <Toggle label="Spend cap approaching" description="Alert when spend reaches the configured threshold." defaultChecked={true} />
              <Toggle label="Spend cap reached" description="Alert when the hard cap is enforced." defaultChecked={true} />
              <Toggle label="Invoice generated" description="Notify when a new monthly invoice is available." defaultChecked={true} />
              <Toggle label="Payment failed" description="Alert if a payment method charge fails." defaultChecked={true} />
            </div>
          </div>
          <div className="py-2">
            <p className="text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider mb-2 mt-1">
              Infrastructure Events
            </p>
            <div className="flex flex-col gap-2">
              <Toggle label="Model health degradation" description="Alert when a forensic container fails its health check." defaultChecked={false} />
              <Toggle label="Webhook delivery failure" description="Notify when a webhook endpoint returns 4xx/5xx." defaultChecked={true} />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <SaveButton label="Save Notifications" />
        </div>
      </SettingsSection>

      {/* ── Security ── */}
      <SettingsSection title="Security">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="size-4 text-text-tertiary" aria-hidden="true" />
          <p className="text-xs text-text-tertiary">Manage authentication, access control, and session security.</p>
        </div>

        <FieldRow label="Primary Email">
          <div className="flex items-center gap-2">
            <input
              type="email"
              readOnly
              value="dev@acmecorp.com"
              className="flex-1 h-9 px-3 text-sm bg-surface-subtle border border-border-default rounded text-text-secondary"
            />
            <Button variant="secondary" size="sm">Change Email</Button>
          </div>
        </FieldRow>

        <FieldRow label="Password">
          <Button variant="secondary" size="sm">Change Password</Button>
        </FieldRow>

        <FieldRow label="Two-Factor Authentication" hint="Add an extra layer of sign-in security.">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-risk-high">Not enabled</span>
            <Button variant="primary" size="sm">Enable 2FA</Button>
          </div>
        </FieldRow>

        <FieldRow label="Allowed IP Ranges" hint="Restrict portal access to specific IP ranges (CIDR).">
          <div className="flex flex-col gap-2">
            <TextInput placeholder="e.g. 203.0.113.0/24" mono />
            <p className="text-xs text-text-tertiary">Leave blank to allow all IPs. Separate multiple ranges with commas.</p>
          </div>
        </FieldRow>

        <div className="flex flex-col gap-2 pt-1">
          <Toggle label="Require re-authentication for sensitive actions" description="API key generation and webhook changes require password confirmation." defaultChecked={true} />
          <Toggle label="Session timeout after inactivity" description="Automatically sign out after 30 minutes of inactivity." defaultChecked={false} />
        </div>

        <div className="flex justify-end pt-1">
          <SaveButton label="Save Security Settings" />
        </div>
      </SettingsSection>

      {/* ── API Defaults ── */}
      <SettingsSection title="API Defaults">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="size-4 text-text-tertiary" aria-hidden="true" />
          <p className="text-xs text-text-tertiary">Default behaviour applied to all API scan requests unless overridden per-request.</p>
        </div>
        <div className="flex flex-col gap-3">
          <Toggle label="Include per-model results in webhook payload" description="Returns model_results breakdown in every webhook callback." defaultChecked={true} />
          <Toggle label="Include model weight version hashes" description="Returns model_weight_versions for legal auditability." defaultChecked={true} />
          <Toggle label="Generate PDF audit report by default" description="Automatically generates an audit PDF for every scan. Can be disabled per-request." defaultChecked={true} />
          <Toggle label="Strict uploader declaration validation" description="Flag scans where the uploader declaration mismatches detected anomalies." defaultChecked={true} />
        </div>
        <FieldRow label="Default Webhook Retry Policy" hint="How many times TRINETRA retries a failed webhook delivery.">
          <select className="w-full h-9 px-3 text-sm bg-surface-base border border-border-default rounded focus-visible:outline-2 focus-visible:outline-brand-500 text-text-primary">
            <option>3 retries (default)</option>
            <option>5 retries</option>
            <option>No retries</option>
          </select>
        </FieldRow>
        <div className="flex justify-end pt-1">
          <SaveButton label="Save API Defaults" />
        </div>
      </SettingsSection>

      {/* ── Danger Zone ── */}
      <div className="bg-surface-base border border-risk-critical-border rounded-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-risk-critical-border bg-risk-critical-bg">
          <div className="flex items-center gap-2">
            <Trash2 className="size-4 text-risk-critical" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-risk-critical">Danger Zone</h2>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {[
            {
              label: "Revoke All API Keys",
              desc: "Immediately invalidates every live and sandbox key. All active integrations will stop working until new keys are generated.",
              btnLabel: "Revoke All Keys",
            },
            {
              label: "Clear Analysis History",
              desc: "Permanently deletes all analysis log entries from the portal. This does not affect the audit PDFs stored in the TRINETRA archive.",
              btnLabel: "Clear History",
            },
            {
              label: "Delete Organisation Account",
              desc: "Permanently deletes this organisation, all API keys, webhook registrations, and billing data. This action cannot be undone.",
              btnLabel: "Delete Account",
            },
          ].map(({ label, desc, btnLabel }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-3 border-b border-border-default last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
              </div>
              <Button variant="secondary" size="sm" className="shrink-0 border-risk-critical-border text-risk-critical hover:bg-risk-critical-bg">
                {btnLabel}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
