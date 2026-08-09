import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Organization — TRINETRA",
  description:
    "Create your TRINETRA organization workspace and get access to the verification API.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-app relative">
      {/* ── Subtle background dot-grid (matches /login) ── */}
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

      {/* ── Auth header (matches /login exactly) ── */}
      <header className="relative shrink-0 bg-surface-base/90 border-b border-border-default backdrop-blur-[2px] z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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

          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors rounded focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to platform
          </Link>
        </div>
      </header>

      {/* ── Main area — centered card with scroll room ── */}
      <main className="relative flex-1 flex items-start justify-center px-5 py-12 z-10">
        <RegisterForm />
      </main>
    </div>
  );
}
