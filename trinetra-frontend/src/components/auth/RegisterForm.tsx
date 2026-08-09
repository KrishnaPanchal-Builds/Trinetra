"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Info } from "lucide-react";

// ─── Shared input class (matches /login exactly) ──────────────────────────────
const inputCls = [
  "w-full h-11 rounded-md border border-border-default bg-surface-base",
  "px-3.5 text-sm text-text-primary placeholder:text-text-tertiary",
  "transition-colors duration-75",
  "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
].join(" ");

const selectCls = [
  "w-full h-11 rounded-md border border-border-default bg-surface-base",
  "px-3 text-sm text-text-primary",
  "transition-colors duration-75 cursor-pointer appearance-none",
  "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
].join(" ");

const labelCls = "text-[13px] font-medium text-text-primary";

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  htmlFor,
  optional,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className={labelCls}>
          {label}
        </label>
        {optional && (
          <span className="text-[11px] text-text-tertiary">Optional</span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-[11px] text-risk-critical leading-none" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Select wrapper (custom chevron) ─────────────────────────────────────────
function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          selectCls,
          value === "" ? "text-text-tertiary" : "text-text-primary",
        ].join(" ")}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {/* Custom chevron */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

// ─── Password input with show/hide ────────────────────────────────────────────
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete = "new-password",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative flex items-center">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className={[
          "w-full h-11 rounded-md border border-border-default bg-surface-base",
          "px-3.5 pr-11 text-sm text-text-primary placeholder:text-text-tertiary",
          "transition-colors duration-75",
          "focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
        ].join(" ")}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 text-text-tertiary hover:text-text-secondary transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 rounded"
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

// ─── Section divider ──────────────────────────────────────────────────────────
function SectionLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <span className="font-mono text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
        {number}
      </span>
      <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
        {title}
      </span>
      <div className="flex-1 h-px bg-border-default" aria-hidden="true" />
    </div>
  );
}

// ─── Validation helpers ───────────────────────────────────────────────────────
const passwordRegex = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

function validatePassword(p: string) {
  if (p.length === 0) return "";
  if (!passwordRegex.test(p))
    return "Must be 8+ characters with at least one number and one special character.";
  return "";
}

// ─── Registration Form ────────────────────────────────────────────────────────
export function RegisterForm() {
  const router = useRouter();
  // Section 01 — Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Section 02 — Organization
  const [orgName, setOrgName] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [useCase, setUseCase] = useState("");

  // Section 03 — Security
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Legal
  const [agreed, setAgreed] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch = (field: string) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const passwordError = touched.password ? validatePassword(password) : "";
  const confirmError =
    touched.confirm && confirmPassword && password !== confirmPassword
      ? "Passwords do not match."
      : "";

  const canSubmit =
    name.trim() &&
    email.trim() &&
    orgName.trim() &&
    companySize &&
    useCase &&
    passwordRegex.test(password) &&
    password === confirmPassword &&
    agreed &&
    !loading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/portal");
    }, 800);
  };

  return (
    <div
      className={[
        "w-full max-w-[520px] bg-surface-base border border-border-default",
        "rounded-xl shadow-sm px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8",
      ].join(" ")}
    >
      {/* ── Header ── */}
      <div className="mb-8">
        <span className="block font-mono text-[11px] font-semibold text-brand-500 uppercase tracking-[0.12em] mb-2.5">
          Organization Registration
        </span>
        <h1 className="text-[1.625rem] font-bold text-text-primary tracking-tight leading-snug">
          Create your TRINETRA organization
        </h1>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          Set up your organization workspace and verification environment.
          You&apos;ll become the organization owner and can invite your team
          after registration.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {/* ── Section 01: Account ── */}
        <div className="flex flex-col gap-4">
          <SectionLabel number="01" title="Your Account" />

          <Field label="Full name" htmlFor="reg-name">
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Mehta"
              autoComplete="name"
              required
              className={inputCls}
            />
          </Field>

          <Field label="Work email" htmlFor="reg-email">
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              required
              className={inputCls}
            />
          </Field>
        </div>

        {/* ── Section 02: Organization ── */}
        <div className="flex flex-col gap-4">
          <SectionLabel number="02" title="Organization" />

          <Field label="Organization name" htmlFor="reg-org-name">
            <input
              id="reg-org-name"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Acme Technologies"
              autoComplete="organization"
              required
              className={inputCls}
            />
          </Field>

          <Field label="Organization website" htmlFor="reg-org-website" optional>
            <input
              id="reg-org-website"
              type="url"
              value={orgWebsite}
              onChange={(e) => setOrgWebsite(e.target.value)}
              placeholder="https://company.com"
              autoComplete="url"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company size" htmlFor="reg-company-size">
              <SelectField
                id="reg-company-size"
                value={companySize}
                onChange={setCompanySize}
                placeholder="Select size"
                options={[
                  "1–10",
                  "11–50",
                  "51–200",
                  "201–500",
                  "501–1,000",
                  "1,001+",
                ]}
              />
            </Field>

            <Field label="Primary use case" htmlFor="reg-use-case">
              <SelectField
                id="reg-use-case"
                value={useCase}
                onChange={setUseCase}
                placeholder="Select use case"
                options={[
                  "Content moderation",
                  "Media verification",
                  "Platform safety",
                  "Trust & safety",
                  "Compliance / risk",
                  "Research & evaluation",
                  "Other",
                ]}
              />
            </Field>
          </div>

          {/* Owner info notice */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 bg-brand-50 border border-brand-100 rounded-md">
            <Info
              className="size-3.5 text-brand-500 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-[12px] text-brand-600 leading-relaxed">
              You&apos;ll be assigned{" "}
              <span className="font-semibold">Owner access</span> for this
              organization. You can invite team members and configure their
              permissions after setup.
            </p>
          </div>
        </div>

        {/* ── Section 03: Security ── */}
        <div className="flex flex-col gap-4">
          <SectionLabel number="03" title="Secure Your Account" />

          <Field
            label="Password"
            htmlFor="reg-password"
            error={passwordError}
          >
            <PasswordInput
              id="reg-password"
              value={password}
              onChange={setPassword}
              placeholder="Create a password"
              autoComplete="new-password"
            />
            <p className="text-[11px] text-text-tertiary -mt-0.5">
              8+ characters with at least one number and one special character.
            </p>
          </Field>

          <Field
            label="Confirm password"
            htmlFor="reg-confirm"
            error={confirmError}
          >
            <PasswordInput
              id="reg-confirm"
              value={confirmPassword}
              onChange={(v) => {
                setConfirmPassword(v);
                touch("confirm");
              }}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </Field>
        </div>

        {/* ── Legal ── */}
        <label className="flex items-start gap-2.5 cursor-pointer group select-none">
          <input
            type="checkbox"
            id="reg-terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="size-3.5 rounded-sm border border-border-strong accent-brand-500 cursor-pointer mt-0.5 shrink-0"
          />
          <span className="text-xs text-text-secondary leading-relaxed">
            I agree to the TRINETRA{" "}
            <Link
              href="/terms"
              className="text-brand-500 hover:underline focus-visible:outline-brand-500 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-brand-500 hover:underline focus-visible:outline-brand-500 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {/* ── Primary CTA ── */}
        <button
          type="submit"
          disabled={!canSubmit}
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
            <span>Creating organization…</span>
          ) : (
            <>
              Create organization
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {/* ── Sign-in prompt ── */}
      <div className="mt-6 text-center">
        <p className="text-xs text-text-tertiary">
          Already have a TRINETRA account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-500 hover:text-brand-600 hover:underline transition-colors focus-visible:outline-brand-500 rounded"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
