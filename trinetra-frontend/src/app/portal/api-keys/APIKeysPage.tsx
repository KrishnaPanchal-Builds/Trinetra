"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout";
import {
  SectionHeading,
  Button,
  Divider,
  Badge,
  Tooltip,
  Input,
} from "@/components/ui";
import { MOCK_API_KEYS } from "@/lib/mock/integration";
import type { APIKey } from "@/types/api";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  RotateCcw,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Activity,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Tooltip content={copied ? "Copied!" : `Copy ${label}`} side="top">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : `Copy ${label}`}
        className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        {copied
          ? <Check className="size-3.5 text-risk-low" aria-hidden="true" />
          : <Copy className="size-3.5" aria-hidden="true" />
        }
      </button>
    </Tooltip>
  );
}

// ─── APIKeyRow ────────────────────────────────────────────────────────────────

function APIKeyRow({
  apiKey,
  onRevoke,
}: {
  apiKey: APIKey;
  onRevoke: (id: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className={[
        "flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 border-b border-border-default last:border-0",
        !apiKey.is_active ? "opacity-60" : "",
      ].join(" ")}
    >
      {/* Key identity */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={[
          "size-8 rounded flex items-center justify-center shrink-0 mt-0.5",
          apiKey.environment === "live"
            ? "bg-brand-50 text-brand-600"
            : "bg-surface-raised text-text-tertiary",
        ].join(" ")}>
          <KeyRound className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-text-primary">{apiKey.name}</span>
            <Badge variant={apiKey.environment === "live" ? "production" : "sandbox"}>
              {apiKey.environment === "live" ? "Live" : "Sandbox"}
            </Badge>
            {!apiKey.is_active && (
              <span className="font-mono text-[11px] text-risk-critical bg-risk-critical-bg border border-risk-critical-border rounded-sm px-1.5 py-0.5">
                REVOKED
              </span>
            )}
          </div>

          {/* Masked key display */}
          <div className="flex items-center gap-1.5">
            <code className="font-mono text-xs text-text-secondary bg-surface-subtle px-2 py-1 rounded border border-border-default select-all">
              {revealed ? apiKey.masked_key.replace(/•/g, "x") : apiKey.masked_key}
            </code>
            <Tooltip content={revealed ? "Hide key" : "Show key"} side="top">
              <button
                type="button"
                onClick={() => setRevealed((r) => !r)}
                aria-label={revealed ? "Hide key" : "Reveal key"}
                className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                {revealed
                  ? <EyeOff className="size-3.5" aria-hidden="true" />
                  : <Eye className="size-3.5" aria-hidden="true" />
                }
              </button>
            </Tooltip>
            {apiKey.is_active && (
              <CopyButton value={apiKey.masked_key} label="API key" />
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 shrink-0 pl-0 sm:pl-0">
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5 text-text-tertiary">
            <Activity className="size-3.5" aria-hidden="true" />
            <span className="font-mono text-[11px] uppercase tracking-wide">Usage</span>
          </div>
          <span className="font-mono text-sm font-semibold text-text-primary">
            {apiKey.scans_this_month.toLocaleString()}
          </span>
          <span className="font-mono text-[10px] text-text-tertiary">scans / month</span>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5 text-text-tertiary">
            <Clock className="size-3.5" aria-hidden="true" />
            <span className="font-mono text-[11px] uppercase tracking-wide">Last used</span>
          </div>
          <span className="font-mono text-xs text-text-secondary">
            {apiKey.last_used_at ? relativeTime(apiKey.last_used_at) : "Never"}
          </span>
          <span className="font-mono text-[10px] text-text-tertiary">
            Created {formatDate(apiKey.created_at)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-2">
          {apiKey.is_active && (
            <>
              <Tooltip content="Rotate key" side="top">
                <button
                  type="button"
                  aria-label="Rotate API key"
                  className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                </button>
              </Tooltip>
              <Tooltip content="Revoke key" side="top">
                <button
                  type="button"
                  onClick={() => onRevoke(apiKey.id)}
                  aria-label="Revoke API key"
                  className="p-1.5 rounded text-text-tertiary hover:text-risk-critical hover:bg-risk-critical-bg transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Generate Key Dialog (inline) ─────────────────────────────────────────────

function GenerateKeyPanel({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [env, setEnv] = useState<"live" | "sandbox">("sandbox");

  return (
    <div className="bg-surface-base border border-border-strong rounded-md p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Generate New API Key</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel"
          className="text-xs text-text-tertiary hover:text-text-primary font-mono uppercase tracking-wide hover:bg-surface-subtle px-2 py-1 rounded transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Key Name"
          placeholder="e.g. Production Integration"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          helperText="A descriptive name to identify this key."
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary">Environment</label>
          <div className="flex items-center gap-2 mt-1">
            {(["sandbox", "live"] as const).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEnv(e)}
                className={[
                  "flex-1 py-2 px-3 rounded border text-sm font-medium capitalize transition-colors",
                  env === e
                    ? "border-brand-500 bg-brand-50 text-brand-600"
                    : "border-border-default bg-surface-base text-text-secondary hover:bg-surface-subtle",
                ].join(" ")}
              >
                {e === "live" ? "Live API" : "Sandbox"}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-tertiary">
            {env === "sandbox" ? "Rate-limited. No charges applied." : "Full quota. Billed usage."}
          </p>
        </div>
      </div>

      {env === "live" && (
        <div className="flex items-start gap-2 p-3 rounded border border-risk-high-border bg-risk-high-bg">
          <AlertTriangle className="size-4 text-risk-high shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-risk-high">
            Live API keys are billed against your active plan. Store this key securely — it will only be shown once.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!name.trim()}
          leadingIcon={<KeyRound className="size-3.5" />}
        >
          Generate Key
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function APIKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>(MOCK_API_KEYS);
  const [showGenerate, setShowGenerate] = useState(false);

  const handleRevoke = (id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, is_active: false } : k))
    );
  };

  const liveKeys = keys.filter((k) => k.environment === "live");
  const sandboxKeys = keys.filter((k) => k.environment === "sandbox");

  return (
    <AppShell
      topBarProps={{
        title: "API Keys",
        environment: "sandbox",
        breadcrumbs: [
          { label: "Portal", href: "/portal" },
          { label: "API Keys" },
        ],
      }}
    >
      <SectionHeading
        eyebrow="Integration"
        title="API Keys"
        description="Manage your live and sandbox API keys. Keys are included as Bearer tokens in every request to the TRINETRA scan endpoint."
        action={
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Plus className="size-3.5" />}
            onClick={() => setShowGenerate((s) => !s)}
          >
            Generate New Key
          </Button>
        }
      />

      {/* Generate key panel */}
      {showGenerate && (
        <GenerateKeyPanel onClose={() => setShowGenerate(false)} />
      )}

      <Divider />

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 rounded-md border border-border-default bg-surface-subtle">
        <ShieldCheck className="size-4 text-brand-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-text-primary">Key Security</p>
          <p className="text-xs text-text-secondary">
            API keys grant full access to your TRINETRA account. Do not expose them in client-side code, public repositories, or browser environments.
            Rotate any key you suspect has been compromised immediately.
          </p>
        </div>
      </div>

      {/* Usage summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Keys", value: keys.length, icon: KeyRound },
          { label: "Active Live", value: liveKeys.filter(k => k.is_active).length, icon: ShieldCheck },
          { label: "Active Sandbox", value: sandboxKeys.filter(k => k.is_active).length, icon: ShieldAlert },
          { label: "Revoked", value: keys.filter(k => !k.is_active).length, icon: Trash2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-surface-base border border-border-default rounded-md px-4 py-3 flex items-center gap-3">
            <Icon className="size-4 text-text-tertiary shrink-0" aria-hidden="true" />
            <div>
              <p className="font-mono text-[11px] text-text-tertiary uppercase tracking-wider">{label}</p>
              <p className="font-mono text-xl font-semibold text-text-primary">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Live keys */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Live Keys</h2>
          <Badge variant="production">Live API</Badge>
        </div>
        <div className="bg-surface-base border border-border-default rounded-md overflow-hidden">
          {liveKeys.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-8">No live keys yet.</p>
          ) : (
            liveKeys.map((k) => (
              <APIKeyRow key={k.id} apiKey={k} onRevoke={handleRevoke} />
            ))
          )}
        </div>
      </div>

      {/* Sandbox keys */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Sandbox Keys</h2>
          <Badge variant="sandbox">Sandbox</Badge>
        </div>
        <div className="bg-surface-base border border-border-default rounded-md overflow-hidden">
          {sandboxKeys.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-8">No sandbox keys yet.</p>
          ) : (
            sandboxKeys.map((k) => (
              <APIKeyRow key={k.id} apiKey={k} onRevoke={handleRevoke} />
            ))
          )}
        </div>
      </div>

      <Divider />

      {/* Usage in requests */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Using Your API Key</h2>
        <div className="bg-surface-base border border-border-default rounded-md p-5 flex flex-col gap-3">
          <p className="text-sm text-text-secondary">
            Pass your key as a <code className="font-mono text-xs bg-surface-subtle px-1.5 py-0.5 rounded border border-border-default">Bearer</code> token
            in the <code className="font-mono text-xs bg-surface-subtle px-1.5 py-0.5 rounded border border-border-default">Authorization</code> header
            of every request to the scan endpoint.
          </p>
          <div className="font-mono text-xs bg-[#0f172a] text-[#94a3b8] rounded-md px-4 py-3 border border-[#1e293b]">
            <span className="text-[#64748b]">POST </span>
            <span className="text-[#e2e8f0]">https://api.trinetra.ai/v1/scan-media</span>
            <br />
            <span className="text-[#64748b]">Authorization: </span>
            <span className="text-[#4ade80]">Bearer sk_live_••••••••••••••••3f9a</span>
          </div>
          <p className="text-xs text-text-tertiary font-mono">
            The API returns <code className="bg-surface-subtle px-1 rounded">202 Accepted</code> with a{" "}
            <code className="bg-surface-subtle px-1 rounded">task_id</code> in under 100ms.
            Results are delivered via webhook once analysis completes (~18s).
          </p>
        </div>
      </div>
    </AppShell>
  );
}
