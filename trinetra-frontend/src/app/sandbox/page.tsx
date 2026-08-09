import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { SandboxWorkspace } from "@/components/sandbox/SandboxWorkspace";

export const metadata: Metadata = {
  title: "Sandbox — TRINETRA",
  description:
    "Test TRINETRA's synthetic-media verification before API integration. Upload a media sample and inspect verification signals.",
};

// ─── API response JSON snippet (matches DeveloperIntegration code style) ──────

const JSON_LINES = [
  { t: "brace", v: "{" },
  { t: "key", v: '  "task_id"', sep: ": ", val: '"trn_982347110_x"', vt: "str" },
  { t: "key", v: '  "status"', sep: ": ", val: '"completed"', vt: "str" },
  { t: "key", v: '  "risk_level"', sep: ": ", val: '"HIGH_RISK"', vt: "str" },
  { t: "key", v: '  "authenticity_evidence_score"', sep: ": ", val: "0.82", vt: "num" },
  { t: "key", v: '  "signals"', sep: ": ", val: "{", vt: "brace" },
  { t: "key", v: '    "synthetic_media"', sep: ": ", val: "true", vt: "bool" },
  { t: "key", v: '    "synthetic_probability"', sep: ": ", val: "0.94", vt: "num" },
  { t: "key", v: '    "provenance_verified"', sep: ": ", val: "false", vt: "bool" },
  { t: "key", v: '    "metadata_integrity"', sep: ": ", val: '"inconsistent"', vt: "str" },
  { t: "key", v: '    "forensic_flags"', sep: ": ", val: '["audio_deepfake", "metadata_tamper"]', vt: "arr" },
  { t: "brace", v: "  }," },
  { t: "key", v: '  "action_recommendation"', sep: ": ", val: '"HOLD_FOR_REVIEW"', vt: "str" },
  { t: "key", v: '  "fusion_method"', sep: ": ", val: '"stacking"', vt: "str" },
  { t: "key", v: '  "processing_time_ms"', sep: ": ", val: "14821", vt: "num" },
  { t: "brace", v: "}" },
];

function colorForType(vt: string) {
  if (vt === "str") return "text-[#87CEAB]";
  if (vt === "num") return "text-[#E2C08D]";
  if (vt === "bool") return "text-[#C792EA]";
  if (vt === "arr") return "text-[#87CEAB]";
  return "text-[#CDD6F4]";
}

function JsonBlock() {
  return (
    <div className="rounded-md overflow-hidden border border-[#1E2A3B]">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#141D2B] border-b border-[#1E2A3B]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="size-2.5 rounded-full bg-[#FF5F56]" />
            <div className="size-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="size-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <span className="font-mono text-[11px] text-[#6B7A8D] ml-1">
            verification_result.json
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#3D5166] uppercase tracking-wider">
          JSON
        </span>
      </div>
      {/* Code body */}
      <div className="bg-[#0D1117] px-5 py-5 overflow-x-auto">
        {JSON_LINES.map((line, i) => {
          if (line.t === "brace") {
            return (
              <div key={i} className="font-mono text-[12px] leading-5 text-[#CDD6F4]">
                {line.v}
              </div>
            );
          }
          return (
            <div key={i} className="font-mono text-[12px] leading-5">
              <span className="text-[#79A6D2]">{line.v}</span>
              <span className="text-[#CDD6F4]">{line.sep}</span>
              <span className={colorForType(line.vt ?? "")}>{line.val}</span>
              {i < JSON_LINES.length - 2 && (
                <span className="text-[#CDD6F4]">,</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SandboxPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-app">
      {/* Existing marketing header — with Sandbox highlighted */}
      <Header />

      <main className="flex-1">
        {/* ── A. Sandbox Intro ── */}
        <section className="bg-surface-base border-b border-border-default">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="block font-mono text-[11px] font-semibold text-brand-500 uppercase tracking-[0.12em] mb-3">
                  TRINETRA Sandbox
                </span>
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight leading-snug">
                  Test synthetic-media verification before integrating the API.
                </h1>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-xl">
                  Upload a media sample and inspect the verification signals
                  TRINETRA exposes through its API. The sandbox is designed for
                  evaluation and testing before production integration.
                </p>
              </div>
              {/* Engine status indicator */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 border border-border-default bg-surface-app rounded-md shrink-0 self-start">
                <div
                  className="size-2 rounded-full bg-risk-low"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
                    Verification Engine
                  </p>
                  <p className="font-mono text-[11px] font-bold text-risk-low">
                    Online
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── B. Workspace + Limits sidebar ── */}
        <section className="border-b border-border-default">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 items-start">
              {/* Main workspace */}
              <div className="bg-surface-base border border-border-default rounded-md p-6">
                <SandboxWorkspace />
              </div>

              {/* Sidebar */}
              <div className="flex flex-col gap-5">
                {/* Sandbox limits */}
                <div className="bg-surface-base border border-border-default rounded-md p-5">
                  <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-4">
                    Sandbox Limits
                  </p>
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-xl font-bold font-mono text-text-primary">
                        100 MB
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Maximum upload size
                      </p>
                    </div>
                    <div className="h-px bg-border-default" />
                    <div>
                      <p className="text-xl font-bold font-mono text-text-primary">
                        1 min
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Maximum video duration
                      </p>
                    </div>
                    <div className="h-px bg-border-default" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        Evaluation report
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        Sandbox results expose the most relevant verification
                        findings. Additional forensic detail is reserved for API
                        access.
                      </p>
                    </div>
                    <div className="h-px bg-border-default" />
                    <div>
                      <p className="text-xs text-text-tertiary leading-relaxed">
                        Supported media formats
                      </p>
                      <p className="text-xs font-medium text-text-primary mt-1">
                        Video · Image · Audio
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/register"
                    className="mt-5 flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600 hover:underline transition-colors focus-visible:outline-brand-500 rounded"
                  >
                    View API access
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </Link>
                </div>

                {/* Supported media card */}
                <div className="bg-surface-base border border-border-default rounded-md p-5">
                  <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-3">
                    Supported Media
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "Video", fmt: "MP4, MOV, AVI, WebM" },
                      { label: "Image", fmt: "JPEG, PNG, WebP, TIFF" },
                      { label: "Audio", fmt: "MP3, WAV, AAC, FLAC" },
                    ].map(({ label, fmt }) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-text-primary">
                          {label}
                        </span>
                        <span className="font-mono text-[10px] text-text-tertiary">
                          {fmt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── C. From Sandbox to Production ── */}
        <section className="bg-surface-base border-b border-border-default">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left: copy + flow */}
              <div>
                <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
                  From Sandbox to Production
                </span>
                <h2 className="mt-3 text-xl lg:text-2xl font-bold text-text-primary tracking-tight">
                  The same verification workflow, exposed through the TRINETRA API.
                </h2>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  The sandbox demonstrates the same signal extraction, provenance
                  analysis, and forensic evaluation TRINETRA runs in production.
                  Switching from sandbox to API access requires only an API key.
                </p>

                {/* Flow diagram */}
                <div className="mt-8 flex flex-col gap-0">
                  {[
                    { label: "Media payload", sub: "URL, binary, or multipart" },
                    { label: "TRINETRA API", sub: "POST /v1/scan-media", accent: true },
                    { label: "Verification Engine", sub: "Signal extraction + forensic evaluation" },
                    { label: "Structured Result", sub: "JSON response + webhook delivery" },
                  ].map((step, i, arr) => (
                    <div key={step.label} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={[
                            "size-8 rounded border flex items-center justify-center shrink-0",
                            step.accent
                              ? "bg-brand-500 border-brand-500"
                              : "bg-surface-base border-border-default",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "font-mono text-[10px] font-bold",
                              step.accent ? "text-white" : "text-text-primary",
                            ].join(" ")}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        {i < arr.length - 1 && (
                          <div className="w-px flex-1 bg-border-default my-1" aria-hidden="true" />
                        )}
                      </div>
                      <div className="pb-5">
                        <p
                          className={[
                            "text-sm font-semibold",
                            step.accent ? "text-brand-500" : "text-text-primary",
                          ].join(" ")}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-text-tertiary mt-0.5 font-mono">
                          {step.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-500 border border-brand-500 rounded hover:bg-brand-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
                  >
                    Get API Access
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary border border-border-default rounded hover:bg-surface-subtle transition-colors"
                  >
                    Explore Documentation
                  </Link>
                </div>
              </div>

              {/* Right: JSON block */}
              <div>
                <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-3">
                  API Response
                </p>
                <JsonBlock />
                <p className="mt-3 text-[11px] text-text-tertiary font-mono">
                  Production API returns this structured result via webhook
                  delivery within approximately 15 seconds.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
