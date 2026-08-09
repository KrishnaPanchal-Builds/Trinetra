import React from "react";

const STEPS = [
  {
    number: "01",
    title: "Send Media",
    description:
      "Submit image, video, or audio through the REST API. Specify which verification modules to run and provide an optional webhook URL for async result delivery.",
  },
  {
    number: "02",
    title: "Analyze",
    description:
      "Multi-modal forensic analysis runs across the configured verification engines in parallel. Most submissions complete within 15–18 seconds.",
  },
  {
    number: "03",
    title: "Receive Results",
    description:
      "Receive a unified risk score, per-signal traces, and a downloadable PDF audit report — delivered to your webhook endpoint or available via task polling.",
  },
  {
    number: "04",
    title: "Take Action",
    description:
      "Block, flag for review, or approve automatically based on your platform's moderation policy. The structured response is designed for direct integration into automation pipelines.",
  },
];

export function VerificationWorkflow() {
  return (
    <section
      className="bg-surface-base border-b border-border-default"
      aria-labelledby="workflow-heading"
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
            Workflow
          </span>
          <h2
            id="workflow-heading"
            className="mt-3 text-2xl lg:text-3xl font-bold text-text-primary tracking-tight"
          >
            From media upload to verification decision.
          </h2>
        </div>

        {/* Desktop: horizontal connector layout */}
        <div className="hidden lg:grid grid-cols-4 gap-0">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="relative flex flex-col">
              {/* Connector line between steps */}
              {idx < STEPS.length - 1 && (
                <div
                  className="absolute top-5 left-[calc(50%+20px)] right-0 h-px bg-border-default"
                  aria-hidden="true"
                />
              )}
              <div className="flex flex-col gap-4 px-5 pt-0 pb-2">
                {/* Step circle */}
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full border-2 border-border-default bg-surface-base flex items-center justify-center shrink-0 z-10">
                    <span className="font-mono text-[11px] font-bold text-text-primary">
                      {step.number}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-text-primary">{step.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: vertical stack */}
        <div className="lg:hidden flex flex-col gap-0">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex gap-5">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="size-10 rounded-full border-2 border-border-default bg-surface-base flex items-center justify-center shrink-0">
                  <span className="font-mono text-[11px] font-bold text-text-primary">
                    {step.number}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-border-default mt-2 mb-2" aria-hidden="true" />
                )}
              </div>
              {/* Content */}
              <div className="flex flex-col gap-2 pb-8">
                <h3 className="text-sm font-semibold text-text-primary leading-[2.5rem]">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
