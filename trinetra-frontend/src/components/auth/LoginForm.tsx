"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

// ─── Password field with accessible show/hide toggle ─────────────────────────

function PasswordInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative flex items-center">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your password"
        autoComplete="current-password"
        required
        className={[
          "w-full rounded-md border border-border-default bg-surface-base",
          "px-3.5 pr-11 text-sm text-text-primary placeholder:text-text-tertiary",
          "h-11 transition-colors duration-75",
          "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
        ].join(" ")}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={0}
        className={[
          "absolute right-3 flex items-center justify-center",
          "text-text-tertiary hover:text-text-secondary transition-colors",
          "focus-visible:outline-2 focus-visible:outline-brand-500 rounded",
        ].join(" ")}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    // Authentication backend not yet connected — UI-ready state only
    setTimeout(() => setLoading(false), 1800);
  };

  return (
    <div
      className={[
        "w-full max-w-[440px] bg-surface-base border border-border-default",
        "rounded-xl shadow-sm px-10 pt-10 pb-8",
      ].join(" ")}
    >
      {/* ── Eyebrow + Heading ── */}
      <div className="mb-8">
        <span className="block font-mono text-[11px] font-semibold text-brand-500 uppercase tracking-[0.12em] mb-2.5">
          Secure Platform Access
        </span>
        <h1 className="text-[1.75rem] font-bold text-text-primary tracking-tight leading-snug">
          Sign in to TRINETRA
        </h1>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          Access your organization&apos;s verification workspace.
        </p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Work email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-email"
            className="text-[13px] font-medium text-text-primary"
          >
            Work email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            autoComplete="email"
            required
            className={[
              "w-full h-11 rounded-md border border-border-default bg-surface-base",
              "px-3.5 text-sm text-text-primary placeholder:text-text-tertiary",
              "transition-colors duration-75",
              "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
            ].join(" ")}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-password"
            className="text-[13px] font-medium text-text-primary"
          >
            Password
          </label>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={setPassword}
          />
        </div>

        {/* Remember + Forgot row */}
        <div className="flex items-center justify-between -mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="remember-device"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-3.5 rounded-sm border border-border-strong accent-brand-500 cursor-pointer"
            />
            <span className="text-xs text-text-secondary">
              Remember this device
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-text-secondary hover:text-brand-500 transition-colors focus-visible:outline-brand-500 rounded"
          >
            Forgot password?
          </Link>
        </div>

        {/* Primary CTA */}
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className={[
            "w-full h-11 flex items-center justify-center gap-2",
            "text-sm font-semibold text-white rounded-md",
            "bg-brand-500 border border-brand-500",
            "hover:bg-brand-600 hover:border-brand-600",
            "transition-colors duration-75",
            "focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          {loading ? (
            <span>Signing in…</span>
          ) : (
            <>
              Sign in to TRINETRA
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {/* ── Registration prompt ── */}
      <div className="mt-7 text-center">
        <p className="text-xs text-text-tertiary">
          Don&apos;t have a TRINETRA organization?
        </p>
        <Link
          href="/register"
          className="mt-1 inline-block text-xs font-medium text-brand-500 hover:text-brand-600 hover:underline transition-colors focus-visible:outline-brand-500 rounded"
        >
          Create an organization
        </Link>
      </div>

      {/* ── Security strip ── */}
      <div className="mt-7 pt-5 border-t border-border-default flex items-start gap-2">
        <ShieldCheck
          className="size-3.5 text-text-tertiary shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div>
          <p className="font-mono text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
            TRINETRA SECURE ACCESS
          </p>
          <p className="font-mono text-[10px] text-text-tertiary mt-0.5">
            Organization-scoped workspace access
          </p>
        </div>
      </div>
    </div>
  );
}
