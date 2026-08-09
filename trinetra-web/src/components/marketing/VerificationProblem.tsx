import React from "react";

const PROBLEM_CARDS = [
  {
    id: "01",
    title: "Synthetic Media",
    body: "AI-generated video, audio, and images increasingly evade conventional content moderation systems. Deepfakes and voice clones can be crafted at scale, creating trust and safety risks that keyword filters and hash-matching cannot address.",
  },
  {
    id: "02",
    title: "Fragmented Signals",
    body: "Platforms that attempt to verify media independently must integrate and maintain separate point solutions across image analysis, audio detection, video forensics, and provenance checks — creating engineering overhead and inconsistent verification decisions across modalities.",
  },
  {
    id: "03",
    title: "No Verification Layer",
    body: "Without a unified verification layer, engineering teams are left stitching together metadata rules, incomplete detection systems, and manual moderation workflows — none of which scale to the volume or velocity of modern content pipelines.",
  },
];

export function VerificationProblem() {
  return (
    <section className="bg-surface-app border-b border-border-default" aria-labelledby="problem-heading">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
            The Problem
          </span>
          <h2 id="problem-heading" className="mt-3 text-2xl lg:text-3xl font-bold text-text-primary tracking-tight max-w-2xl">
            Verify what your platform can&apos;t afford to get wrong.
          </h2>
          <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">
            Traditional moderation infrastructure was built for spam and explicit content.
            It was not designed for the complexity of synthetic media at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROBLEM_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-surface-base border border-border-default rounded-md p-6 flex flex-col gap-4"
            >
              <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
                {card.id}
              </span>
              <h3 className="text-base font-semibold text-text-primary">{card.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
