import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — TRINETRA",
  description:
    "Sign in to your TRINETRA organization's verification workspace.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-app relative">
      {/* ── Subtle background dot-grid ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, #D8DCE3 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.55,
        }}
      />

      {/* ── Auth header ── */}
      <header className="relative shrink-0 bg-surface-base/90 border-b border-border-default backdrop-blur-[2px] z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo / wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
          >
            <div className="size-7 bg-brand-500 rounded-sm flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white font-mono tracking-tight">
                TR
              </span>
            </div>
            <span className="text-sm font-semibold text-text-primary tracking-tight">
              TRINETRA
            </span>
          </Link>

          {/* Back link */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors rounded focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to platform
          </Link>
        </div>
      </header>

      {/* ── Main area — centered card ── */}
      <main className="relative flex-1 flex items-center justify-center px-5 py-12 z-10">
        <LoginForm />
      </main>
    </div>
  );
}
