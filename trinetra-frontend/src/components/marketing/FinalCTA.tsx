import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section
      className="bg-surface-base border-b border-border-default"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-[#0A1628] rounded-md px-8 py-16 text-center flex flex-col items-center gap-6">
          <div>
            <span className="font-mono text-[11px] font-semibold text-blue-400 uppercase tracking-widest">
              Get Started
            </span>
            <h2
              id="cta-heading"
              className="mt-3 text-2xl lg:text-3xl font-bold text-white tracking-tight max-w-xl mx-auto"
            >
              Ready to verify what enters your platform?
            </h2>
            <p className="mt-3 text-base text-[#94A3B8] max-w-md mx-auto">
              Add synthetic-media verification to your stack.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sandbox"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white border border-white/20 rounded hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              Try the Sandbox
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0A1628] bg-white rounded hover:bg-blue-50 transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              Get API Access
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
