import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "/ month",
    description: "For teams evaluating TRINETRA or running at low volume.",
    features: [
      "5,000 scans per month",
      "Standard verification models",
      "REST API access",
      "JSON result delivery",
      "Community support",
    ],
    cta: "Get Started",
    href: "/register?plan=starter",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$299",
    period: "/ month",
    description: "For production platforms with active content pipelines.",
    features: [
      "50,000 scans per month",
      "Advanced verification signals",
      "Webhook result delivery",
      "PDF audit reports",
      "Priority email support",
      "Spend protection controls",
    ],
    cta: "Get Started",
    href: "/register?plan=growth",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: null,
    description: "For platforms with high-volume or compliance-critical requirements.",
    features: [
      "Custom scan volume",
      "Dedicated infrastructure",
      "SLA guarantees",
      "Custom model tuning",
      "DPDP / legal support",
      "Onboarding assistance",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section
      className="bg-surface-app border-b border-border-default"
      aria-labelledby="pricing-heading"
      id="pricing"
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
            Pricing
          </span>
          <h2
            id="pricing-heading"
            className="mt-3 text-2xl lg:text-3xl font-bold text-text-primary tracking-tight"
          >
            Simple, usage-based verification.
          </h2>
          <p className="mt-3 text-base text-text-secondary max-w-xl leading-relaxed">
            Pay for what you use. No hidden fees. Sandbox usage is never billed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={[
                "rounded-md flex flex-col gap-5 p-6",
                plan.highlighted
                  ? "bg-brand-500 border border-brand-500 shadow-sm"
                  : "bg-surface-base border border-border-default",
              ].join(" ")}
            >
              {/* Header */}
              <div className="flex flex-col gap-1">
                {plan.highlighted && (
                  <span className="self-start font-mono text-[10px] font-bold text-brand-100 uppercase tracking-widest mb-1">
                    Recommended
                  </span>
                )}
                <p
                  className={`text-base font-semibold ${
                    plan.highlighted ? "text-white" : "text-text-primary"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`font-mono text-3xl font-bold ${
                      plan.highlighted ? "text-white" : "text-text-primary"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-blue-200" : "text-text-tertiary"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs leading-relaxed mt-1 ${
                    plan.highlighted ? "text-blue-100" : "text-text-secondary"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      className={`size-3.5 mt-0.5 shrink-0 ${
                        plan.highlighted ? "text-blue-200" : "text-risk-low"
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`text-xs ${
                        plan.highlighted ? "text-blue-50" : "text-text-secondary"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={[
                  "mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                  plan.highlighted
                    ? "bg-white text-brand-600 hover:bg-blue-50 focus-visible:outline-white"
                    : "bg-surface-base text-text-primary border border-border-default hover:bg-surface-subtle focus-visible:outline-brand-500",
                ].join(" ")}
              >
                {plan.cta}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-text-tertiary mt-8">
          All plans include API access, basic webhook delivery, and structured JSON results.
          Sandbox usage is always free and never billed.
        </p>
      </div>
    </section>
  );
}
