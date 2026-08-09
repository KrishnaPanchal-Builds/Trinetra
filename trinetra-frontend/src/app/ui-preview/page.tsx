"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  StatusBadge,
  Input,
  Select,
  Textarea,
  Divider,
  Tooltip,
  CodeBlock,
  SectionHeading,
} from "@/components/ui";
import {
  Upload,
  Search,
  Info,
  ChevronRight,
  ArrowRight,
  Trash2,
  Plus,
} from "lucide-react";

// ─── Sample code for CodeBlock ─────────────────────────────────────────────────

const scanMediaRequest = `POST https://api.trinetra.ai/v1/scan-media
Authorization: Bearer sk_live_••••••••••••••••

{
  "uploader_declaration": "Original Footage",
  "webhook_url": "https://your-platform.com/api/trinetra-webhook",
  "modalities": ["video", "audio"]
}`;

const webhookResponse = `{
  "task_id": "trk_982347110_x",
  "authenticity_evidence_score": 31,
  "risk_level": "HIGH_RISK",
  "confidence_interval": "HIGH",
  "primary_anomaly": "SYNTHETIC_AUDIO_DUBBING",
  "model_results": {
    "aasist": { "probability": 0.94, "class": "synthetic" },
    "rawnet3": { "probability": 0.88, "class": "synthetic" },
    "ftcn":   { "probability": 0.12, "class": "authentic" }
  },
  "audit_pdf_report_url": "https://api.trinetra.ai/reports/trk_982347110_x.pdf"
}`;

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      {/* Section label */}
      <div className="flex items-center gap-3">
        <p className="text-[10px] font-semibold font-mono uppercase tracking-[0.1em] text-text-tertiary whitespace-nowrap">
          {title}
        </p>
        <div className="flex-1 h-px bg-border-default" />
      </div>
      {children}
    </section>
  );
}

// ─── Row wrapper — horizontal group ──────────────────────────────────────────

function Row({
  label,
  children,
  wrap = false,
}: {
  label?: string;
  children: React.ReactNode;
  wrap?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wide">
          {label}
        </p>
      )}
      <div
        className={`flex items-center gap-3 ${wrap ? "flex-wrap" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UIPreviewPage() {
  // Controlled state for form demo
  const [requestId, setRequestId] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [analysisNotes, setAnalysisNotes] = useState("");

  return (
    <div className="min-h-screen bg-surface-app">
      {/* ── Page header ── */}
      <div className="border-b border-border-default bg-surface-base">
        <div className="max-w-4xl mx-auto px-8 py-10">
          <p className="text-[11px] font-mono font-medium text-text-tertiary uppercase tracking-[0.1em] mb-2">
            TRINETRA
          </p>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            UI Foundation
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Internal visual QA — reusable interface primitives.
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col gap-16">

        {/* ────────────────── 1. TYPOGRAPHY ────────────────── */}
        <Section title="Typography">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wide mb-2">display / page title</p>
              <h1 className="text-3xl font-semibold text-text-primary tracking-tight leading-10">
                Synthetic Media Verification Infrastructure
              </h1>
            </div>

            <Divider />

            <div>
              <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wide mb-2">section heading</p>
              <h2 className="text-xl font-semibold text-text-primary tracking-tight">
                Analysis Logs
              </h2>
            </div>

            <Divider />

            <div>
              <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wide mb-2">body text</p>
              <p className="text-sm text-text-secondary leading-6 max-w-2xl">
                TRINETRA processes video, audio, image and document uploads through a
                four-layer forensic pipeline. Each analysis returns an Authenticity
                Evidence Score paired with per-model attribution and a legally defensible
                PDF audit report.
              </p>
            </div>

            <Divider />

            <div>
              <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wide mb-2">muted / metadata text</p>
              <p className="text-xs text-text-tertiary">
                Last analysis · 2026-08-08 · 17:04:31 UTC · via sk_live_••••3f9a
              </p>
            </div>

            <Divider />

            <div>
              <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wide mb-2">technical / monospace</p>
              <p className="font-mono text-sm text-text-primary">
                trk_982347110_x
              </p>
              <p className="font-mono text-xs text-text-tertiary mt-1">
                aasist@v3.2.1-a9f31c · rawnet3@v2.0.0-77e21b · ftcn@v1.4.0-1c88de
              </p>
            </div>

            <Divider />

            <div>
              <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wide mb-2">column header / label-caps</p>
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.06em]">
                Risk Level · AES Score · Modality · Timestamp
              </p>
            </div>
          </div>
        </Section>

        {/* ────────────────── 2. BUTTONS ────────────────── */}
        <Section title="Buttons">
          {/* Variants */}
          <Row label="Variants — md">
            <Button variant="primary">Run Analysis</Button>
            <Button variant="secondary">View Report</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="danger">Revoke Key</Button>
          </Row>

          <Divider />

          {/* Sizes — primary */}
          <Row label="Sizes — primary">
            <Button variant="primary" size="sm">Submit</Button>
            <Button variant="primary" size="md">Submit for Verification</Button>
            <Button variant="primary" size="lg">Get API Access</Button>
          </Row>

          {/* Sizes — secondary */}
          <Row label="Sizes — secondary">
            <Button variant="secondary" size="sm">Download</Button>
            <Button variant="secondary" size="md">Download Report</Button>
            <Button variant="secondary" size="lg">Download Audit PDF</Button>
          </Row>

          <Divider />

          {/* With icons */}
          <Row label="With icons">
            <Button variant="primary" leadingIcon={<Upload className="size-4" />}>
              Upload Media
            </Button>
            <Button variant="secondary" leadingIcon={<Search className="size-4" />}>
              Search Logs
            </Button>
            <Button
              variant="secondary"
              trailingIcon={<ChevronRight className="size-4" />}
            >
              View Details
            </Button>
            <Button variant="ghost" leadingIcon={<Plus className="size-4" />}>
              Add Key
            </Button>
            <Button variant="danger" leadingIcon={<Trash2 className="size-4" />}>
              Delete Webhook
            </Button>
          </Row>

          <Divider />

          {/* States */}
          <Row label="Loading state">
            <Button variant="primary" loading>
              Analyzing…
            </Button>
            <Button variant="secondary" loading>
              Processing
            </Button>
          </Row>

          <Row label="Disabled state">
            <Button variant="primary" disabled>
              Run Analysis
            </Button>
            <Button variant="secondary" disabled>
              View Report
            </Button>
            <Button variant="ghost" disabled>
              Cancel
            </Button>
            <Button variant="danger" disabled>
              Revoke Key
            </Button>
          </Row>
        </Section>

        {/* ────────────────── 3. BADGES ────────────────── */}
        <Section title="Badges">
          <Row label="Media type" wrap>
            <Badge variant="video">Video</Badge>
            <Badge variant="audio">Audio</Badge>
            <Badge variant="image">Image</Badge>
            <Badge variant="document">Document</Badge>
          </Row>
          <Row label="Context / source" wrap>
            <Badge variant="api">API</Badge>
            <Badge variant="sandbox">Sandbox</Badge>
            <Badge variant="production">Production</Badge>
            <Badge variant="default">v1.scan-media</Badge>
            <Badge variant="subtle">curl</Badge>
          </Row>
        </Section>

        {/* ────────────────── 4. STATUS ────────────────── */}
        <Section title="Status Badges">
          <Row label="All states" wrap>
            <StatusBadge status="verified" />
            <StatusBadge status="completed" />
            <StatusBadge status="processing" />
            <StatusBadge status="queued" />
            <StatusBadge status="flagged" />
            <StatusBadge status="failed" />
          </Row>
          <Row label="Without icon" wrap>
            <StatusBadge status="verified" showIcon={false} />
            <StatusBadge status="flagged" showIcon={false} />
            <StatusBadge status="failed" showIcon={false} />
          </Row>

          {/* Contextual: badge + status together */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Badge variant="video">Video</Badge>
            <StatusBadge status="flagged" />

            <Badge variant="audio">Audio</Badge>
            <StatusBadge status="processing" />

            <Badge variant="image">Image</Badge>
            <StatusBadge status="verified" />
          </div>
        </Section>

        {/* ────────────────── 5. FORM CONTROLS ────────────────── */}
        <Section title="Form Controls">
          {/* Input variants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            <Input
              label="Request ID"
              placeholder="trk_982347110_x"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              helperText="Enter a task ID to look up an analysis."
              leadingIcon={<Search className="size-4" />}
            />
            <Input
              label="Webhook Callback URL"
              placeholder="https://your-platform.com/api/webhook"
              required
              leadingIcon={<Info className="size-4" />}
            />
            <Input
              label="API Key"
              placeholder="sk_live_••••••••••••••••"
              disabled
              helperText="Managed in the API Keys section."
            />
            <Input
              label="Callback URL"
              placeholder="https://example.com"
              errorText="URL must begin with https://"
              defaultValue="http://insecure-example"
            />
          </div>

          <Divider />

          {/* Select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            <Select
              label="Media Type"
              placeholder="Select media type…"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              helperText="Filter analysis logs by modality."
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="image">Image</option>
              <option value="document">Document</option>
            </Select>
            <Select
              label="Risk Level"
              placeholder="All risk levels"
              required
            >
              <option value="critical">Critical — AES 0–25</option>
              <option value="high">High — AES 26–49</option>
              <option value="medium">Medium — AES 50–69</option>
              <option value="low">Low — AES 70–100</option>
            </Select>
            <Select
              label="API Key Source"
              placeholder="Select source…"
              disabled
              helperText="Requires an active API key."
            >
              <option value="live">Live</option>
              <option value="test">Test</option>
            </Select>
            <Select
              label="Fusion Method"
              errorText="This field is required."
            >
              <option value="">Choose…</option>
              <option value="stacking">Stacking (recommended)</option>
              <option value="averaging">Averaging</option>
              <option value="voting">Voting</option>
            </Select>
          </div>

          <Divider />

          {/* Textarea */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            <Textarea
              label="Analysis Notes"
              placeholder="Add contextual notes about this submission…"
              value={analysisNotes}
              onChange={(e) => setAnalysisNotes(e.target.value)}
              helperText="Internal notes are not included in the PDF audit report."
              rows={4}
            />
            <Textarea
              label="Uploader Declaration"
              placeholder="e.g. Original footage recorded on 2026-08-01"
              required
              rows={4}
              helperText="The declaration text the end user provided at upload."
            />
          </div>
        </Section>

        {/* ────────────────── 6. DIVIDERS ────────────────── */}
        <Section title="Dividers">
          <div className="flex flex-col gap-4 max-w-2xl">
            <p className="text-sm text-text-secondary">Standard horizontal divider:</p>
            <Divider />

            <p className="text-sm text-text-secondary">Divider with label:</p>
            <Divider label="or" />

            <p className="text-sm text-text-secondary">Divider with longer label:</p>
            <Divider label="API Key rotation required" />

            <p className="text-sm text-text-secondary">
              Vertical divider (inline):
            </p>
            <div className="flex items-center gap-4 h-8">
              <span className="text-sm text-text-secondary">Video</span>
              <Divider orientation="vertical" />
              <span className="text-sm text-text-secondary">Audio</span>
              <Divider orientation="vertical" />
              <span className="text-sm text-text-secondary">Image</span>
              <Divider orientation="vertical" />
              <span className="text-sm text-text-secondary">Document</span>
            </div>
          </div>
        </Section>

        {/* ────────────────── 7. CODE BLOCK ────────────────── */}
        <Section title="Code Block">
          <div className="flex flex-col gap-4 max-w-3xl">
            {/* HTTP + JSON request */}
            <CodeBlock
              code={scanMediaRequest}
              language="http"
              filename="POST /v1/scan-media"
              scrollable
            />

            {/* JSON response with line numbers */}
            <CodeBlock
              code={webhookResponse}
              language="json"
              filename="webhook-payload.json"
              showLineNumbers
              scrollable
            />

            {/* Bare block — no header, uses the absolute copy button */}
            <CodeBlock
              code={`curl -X POST https://api.trinetra.ai/v1/scan-media \\
  -H "Authorization: Bearer sk_live_••••••••••••••••" \\
  -F "file=@sample-video.mp4" \\
  -F "uploader_declaration=Original Footage"`}
              language="bash"
              scrollable
            />
          </div>
        </Section>

        {/* ────────────────── 8. SECTION HEADING ────────────────── */}
        <Section title="Section Heading">
          <div className="flex flex-col gap-10 max-w-3xl">
            {/* Left-aligned, no eyebrow */}
            <SectionHeading
              as="h2"
              title="Analysis Logs"
              description="A searchable history of all media submitted through the TRINETRA API. High-risk items are highlighted and linked to forensic evidence."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  trailingIcon={<ArrowRight className="size-3.5" />}
                >
                  View all
                </Button>
              }
            />

            <Divider />

            {/* Left-aligned with eyebrow */}
            <SectionHeading
              as="h2"
              eyebrow="Developer Integration"
              title="Start verifying media in minutes"
              description="Send any media file to the scan endpoint and receive a structured webhook payload with an Authenticity Evidence Score within 18 seconds."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  trailingIcon={<ArrowRight className="size-3.5" />}
                >
                  Read the docs
                </Button>
              }
            />

            <Divider />

            {/* Center-aligned */}
            <SectionHeading
              as="h2"
              eyebrow="Pricing"
              title="Simple, usage-based pricing"
              description="Pay only for what you verify. No platform fees. Prepaid scan credits that never expire."
              align="center"
              action={
                <Button variant="primary" size="md">
                  Get started
                </Button>
              }
            />

            <Divider />

            {/* h3 — sub-section */}
            <SectionHeading
              as="h3"
              title="Webhook Configuration"
              description="Register a callback URL to receive real-time analysis results as they are completed."
            />
          </div>
        </Section>

        {/* ────────────────── TOOLTIPS ────────────────── */}
        <Section title="Tooltips">
          <Row label="Icon-only actions with tooltip" wrap>
            <Tooltip content="Upload media file">
              <button
                className="flex items-center justify-center size-9 rounded border border-border-default bg-surface-base text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors"
                aria-label="Upload"
              >
                <Upload className="size-4" aria-hidden="true" />
              </button>
            </Tooltip>

            <Tooltip content="Search analysis logs" side="bottom">
              <button
                className="flex items-center justify-center size-9 rounded border border-border-default bg-surface-base text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors"
                aria-label="Search"
              >
                <Search className="size-4" aria-hidden="true" />
              </button>
            </Tooltip>

            <Tooltip content="sk_live_982347110xf9a3c — click to copy" side="right">
              <button
                className="flex items-center justify-center size-9 rounded border border-border-default bg-surface-base text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors"
                aria-label="API key info"
              >
                <Info className="size-4" aria-hidden="true" />
              </button>
            </Tooltip>

            <Tooltip content="Delete webhook endpoint" side="top">
              <button
                className="flex items-center justify-center size-9 rounded border border-border-default bg-surface-base text-text-secondary hover:bg-surface-subtle hover:text-risk-critical transition-colors"
                aria-label="Delete"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </Tooltip>
          </Row>

          <Row label="Tooltip on text element">
            <Tooltip
              content="Authenticity Evidence Score — 0 (synthetic) to 100 (authentic)"
              side="bottom"
            >
              <span
                className="text-sm font-mono text-text-primary border-b border-dashed border-border-strong cursor-help"
                tabIndex={0}
              >
                AES: 31/100
              </span>
            </Tooltip>
          </Row>
        </Section>

        {/* ── Footer ── */}
        <div className="pt-4 pb-8">
          <Divider />
          <p className="mt-6 text-xs text-text-tertiary font-mono">
            TRINETRA UI Foundation · Phase 1 Primitives · Internal QA ·{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
