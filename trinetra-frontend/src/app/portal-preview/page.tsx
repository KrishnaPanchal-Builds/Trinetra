"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout";
import {
  SectionHeading,
  Button,
  Badge,
  StatusBadge,
  Divider,
} from "@/components/ui";
import {
  Upload,
  RefreshCw,
  Shield,
  Activity,
  FileCheck,
} from "lucide-react";

export default function PortalPreviewPage() {
  const [activeTab, setActiveTab] = useState("/portal");

  return (
    <AppShell
      activePath={activeTab}
      topBarProps={{
        title: "Command Center",
        environment: "sandbox",
        breadcrumbs: [
          { label: "Portal", href: "/portal" },
          { label: "Overview" },
        ],
      }}
      sidebarProps={{
        companyName: "Acme Trust & Safety",
        userEmail: "sec-ops@acmecorp.com",
      }}
    >
      {/* Page Header */}
      <SectionHeading
        eyebrow="System Overview"
        title="Command Center"
        description="Real-time verification metrics, active model worker health, and recent media triage stream."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<RefreshCw className="size-3.5" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<Upload className="size-3.5" />}
            >
              New Scan
            </Button>
          </div>
        }
      />

      <Divider />

      {/* Demo KPI Summary Cards (using clean design tokens, border-default, no heavy shadows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-base border border-border-default rounded-md p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Scans Today
            </span>
            <Activity className="size-4" aria-hidden="true" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono text-text-primary">
              14,892
            </span>
            <span className="text-xs font-mono font-medium text-risk-low">
              +12.4%
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Quota: 50,000 / day
          </span>
        </div>

        <div className="bg-surface-base border border-border-default rounded-md p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              High Risk Media
            </span>
            <Shield className="size-4 text-risk-high" aria-hidden="true" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono text-risk-high">
              342
            </span>
            <span className="text-xs font-mono font-medium text-risk-high">
              2.30% rate
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Requires triage review
          </span>
        </div>

        <div className="bg-surface-base border border-border-default rounded-md p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Avg SLA Latency
            </span>
            <FileCheck className="size-4 text-brand-500" aria-hidden="true" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono text-text-primary">
              14.2s
            </span>
            <span className="text-xs font-mono font-medium text-risk-low">
              SLA &lt;180m
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            Celery GPU Queue: 4ms
          </span>
        </div>

        <div className="bg-surface-base border border-border-default rounded-md p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Model Health
            </span>
            <StatusBadge status="completed" showIcon={false} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold font-mono text-text-primary">
              9/9 Active
            </span>
            <span className="text-xs font-mono font-medium text-risk-low">
              100%
            </span>
          </div>
          <span className="text-[11px] text-text-tertiary">
            AASIST, RawNet3, FTCN, SBI
          </span>
        </div>
      </div>

      {/* Demo Section — Layout Shell Validation Box */}
      <div className="bg-surface-base border border-border-default rounded-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-text-primary">
              Application Shell Verification
            </h3>
            <Badge variant="api">Layout Test</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("/portal/logs")}
            >
              Simulate Logs Nav
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("/portal")}
            >
              Reset Nav
            </Button>
          </div>
        </div>

        <p className="text-sm text-text-secondary">
          This preview route validates the full <strong>AppShell</strong> frame: persistent left sidebar, top header bar with breadcrumbs and environment badge, responsive collapse behavior, and content grid alignment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="border border-border-default rounded p-4 flex flex-col gap-1.5 bg-surface-subtle/50">
            <span className="text-xs font-mono font-semibold text-text-primary uppercase">
              1. Sidebar Navigation
            </span>
            <span className="text-xs text-text-secondary">
              Structured categories (Overview, Analysis, Integration, Billing), active blue indicator, collapse toggle, user/org card.
            </span>
          </div>

          <div className="border border-border-default rounded p-4 flex flex-col gap-1.5 bg-surface-subtle/50">
            <span className="text-xs font-mono font-semibold text-text-primary uppercase">
              2. Top Header Bar
            </span>
            <span className="text-xs text-text-secondary">
              Breadcrumb context, live sandbox/production badge, API docs trigger, and mobile menu hamburger button.
            </span>
          </div>

          <div className="border border-border-default rounded p-4 flex flex-col gap-1.5 bg-surface-subtle/50">
            <span className="text-xs font-mono font-semibold text-text-primary uppercase">
              3. Responsive Grid
            </span>
            <span className="text-xs text-text-secondary">
              Seamless transition from full desktop view to collapsed icon mode and mobile slide-out drawer.
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
