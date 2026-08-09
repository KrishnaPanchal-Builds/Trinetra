import React from "react";
import Link from "next/link";

const FOOTER_LINKS = [
  {
    heading: "Product",
    items: [
      { label: "Platform", href: "#platform" },
      { label: "Solutions", href: "#solutions" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Developers",
    items: [
      { label: "Developers", href: "#developers" },
      { label: "API Documentation", href: "/docs" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "Resources", href: "#resources" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-surface-base border-t border-border-default">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 focus-visible:outline-brand-500 rounded w-fit"
            >
              <div className="size-6 bg-brand-500 rounded-sm flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white font-mono">TR</span>
              </div>
              <span className="text-sm font-semibold text-text-primary tracking-tight">
                TRINETRA
              </span>
            </Link>
            <p className="text-xs text-text-tertiary leading-relaxed max-w-[180px]">
              Forensic verification infrastructure for modern platforms.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.heading} className="flex flex-col gap-3">
              <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
                {section.heading}
              </p>
              <ul className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-xs text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-brand-500 rounded"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-text-tertiary">
            © {new Date().getFullYear()} TRINETRA. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-text-tertiary">
            Synthetic media verification infrastructure.
          </p>
        </div>
      </div>
    </footer>
  );
}
