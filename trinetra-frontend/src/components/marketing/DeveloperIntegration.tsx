import React from "react";

const INTEGRATION_STEPS = [
  {
    n: "01",
    title: "Get API Key",
    desc: "Generate a live or sandbox key from the developer portal.",
  },
  {
    n: "02",
    title: "Send Media Payload",
    desc: "POST the file with your selected verification modules.",
  },
  {
    n: "03",
    title: "Receive Webhook",
    desc: "TRINETRA pushes the result to your registered callback URL.",
  },
  {
    n: "04",
    title: "Parse Risk Score",
    desc: "Read the unified score and per-signal trace from the response.",
  },
  {
    n: "05",
    title: "Automate Action",
    desc: "Block, hold, or approve content based on your platform policy.",
  },
];

const CODE_LINES = [
  { type: "comment", text: "# 1. Submit media for verification" },
  { type: "blank", text: "" },
  { type: "code", text: "import requests" },
  { type: "blank", text: "" },
  { type: "code", text: 'response = requests.post(' },
  { type: "string", text: '    "https://api.trinetra.ai/v1/scan-media",' },
  { type: "code", text: '    headers={' },
  { type: "string", text: '        "Authorization": "Bearer sk_live_••••••••",' },
  { type: "code", text: "    }," },
  { type: "code", text: '    files={"file": open("video.mp4", "rb")},' },
  { type: "code", text: '    data={' },
  { type: "string", text: '        "modules": ["detection", "provenance", "metadata"],' },
  { type: "string", text: '        "webhook_url": "https://yourplatform.com/webhook"' },
  { type: "code", text: "    }" },
  { type: "code", text: ")" },
  { type: "blank", text: "" },
  { type: "comment", text: "# → 202 Accepted — task queued" },
  { type: "code", text: 'task = response.json()' },
  { type: "comment", text: '# {"task_id": "trk_982347110_x", "status": "queued"}' },
  { type: "blank", text: "" },
  { type: "comment", text: "# 2. Webhook delivers result ~15s later" },
  { type: "blank", text: "" },
  { type: "code", text: "def handle_webhook(payload):" },
  { type: "code", text: '    score = payload["authenticity_evidence_score"]' },
  { type: "code", text: '    risk  = payload["risk_level"]' },
  { type: "blank", text: "" },
  { type: "code", text: '    if risk == "HIGH_RISK":' },
  { type: "string", text: '        platform.hold_content(payload["media_id"])' },
  { type: "code", text: '    elif risk == "MEDIUM_RISK":' },
  { type: "string", text: '        queue_for_human_review(payload["media_id"])' },
  { type: "code", text: "    else:" },
  { type: "string", text: '        platform.approve(payload["media_id"])' },
];

function CodeLine({ type, text }: { type: string; text: string }) {
  if (type === "blank") return <div className="h-3" />;
  const colorClass =
    type === "comment"
      ? "text-[#6B7A8D]"
      : type === "string"
      ? "text-[#87CEAB]"
      : "text-[#CDD6F4]";
  return (
    <div className={`font-mono text-[12px] leading-5 whitespace-pre ${colorClass}`}>
      {text}
    </div>
  );
}

export function DeveloperIntegration() {
  return (
    <section
      className="bg-surface-app border-b border-border-default"
      aria-labelledby="dev-heading"
      id="developers"
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
            Developer Integration
          </span>
          <h2
            id="dev-heading"
            className="mt-3 text-2xl lg:text-3xl font-bold text-text-primary tracking-tight"
          >
            Built for developers.
            <br />
            Designed for integration.
          </h2>
          <p className="mt-3 text-base text-text-secondary max-w-xl leading-relaxed">
            TRINETRA exposes a simple REST API that fits into any existing upload
            pipeline. Authentication, submission, webhook delivery, and response
            parsing take fewer than 30 lines of code.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: step list */}
          <div className="flex flex-col gap-0">
            {INTEGRATION_STEPS.map((step, idx) => (
              <div key={step.n} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="size-8 rounded-full border border-border-strong bg-surface-base flex items-center justify-center shrink-0 z-10">
                    <span className="font-mono text-[10px] font-bold text-text-primary">
                      {step.n}
                    </span>
                  </div>
                  {idx < INTEGRATION_STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-border-default my-1" aria-hidden="true" />
                  )}
                </div>
                <div className="pb-7">
                  <p className="text-sm font-semibold text-text-primary leading-8">{step.title}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: code panel */}
          <div className="rounded-md overflow-hidden border border-[#1E2A3B] shadow-sm">
            {/* Code window header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#141D2B] border-b border-[#1E2A3B]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5" aria-hidden="true">
                  <div className="size-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="size-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="size-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <span className="font-mono text-[11px] text-[#6B7A8D] ml-1">
                  integration.py
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#3D5166] uppercase tracking-wider">
                Python
              </span>
            </div>
            {/* Code body */}
            <div className="bg-[#0D1117] px-5 py-5 overflow-x-auto">
              {CODE_LINES.map((line, i) => (
                <CodeLine key={i} type={line.type} text={line.text} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
