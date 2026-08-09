"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Solutions", href: "#solutions" },
  { label: "Developers", href: "#developers" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "#pricing" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface-base/95 border-b border-border-default backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-brand-500 rounded">
            <div className="size-7 bg-brand-500 rounded-sm flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white font-mono tracking-tight">TR</span>
            </div>
            <span className="text-sm font-semibold text-text-primary tracking-tight">TRINETRA</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors rounded hover:bg-surface-subtle focus-visible:outline-brand-500"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors rounded hover:bg-surface-subtle focus-visible:outline-brand-500"
            >
              Sign In
            </Link>
            <Link
              href="/sandbox"
              className="px-3 py-1.5 text-sm font-medium text-text-primary border border-border-default rounded hover:bg-surface-subtle transition-colors focus-visible:outline-brand-500"
            >
              Sandbox
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 text-sm font-medium text-white bg-brand-500 border border-brand-500 rounded hover:bg-brand-600 hover:border-brand-600 transition-colors focus-visible:outline-brand-500"
            >
              Get API Access
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors focus-visible:outline-brand-500"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border-default bg-surface-base">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border-default">
              <Link href="/login" className="px-3 py-2 text-sm text-text-secondary hover:bg-surface-subtle rounded transition-colors">
                Sign In
              </Link>
              <Link href="/sandbox" className="px-3 py-2 text-sm font-medium text-text-primary border border-border-default rounded hover:bg-surface-subtle transition-colors text-center">
                Sandbox
              </Link>
              <Link href="/register" className="px-3 py-2 text-sm font-medium text-white bg-brand-500 rounded hover:bg-brand-600 transition-colors text-center">
                Get API Access
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
