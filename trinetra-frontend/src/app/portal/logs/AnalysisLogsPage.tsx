"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import { SectionHeading, Button, Divider } from "@/components/ui";
import { AnalysisLogTable } from "@/components/portal";
import { MOCK_ANALYSES } from "@/lib/mock/analyses";
import { Upload, Download } from "lucide-react";

export function AnalysisLogsPage() {
  return (
    <AppShell
      topBarProps={{
        title: "Analysis Logs",
        environment: "sandbox",
        breadcrumbs: [
          { label: "Workspace", href: "/portal" },
          { label: "Logs" },
        ],
      }}
    >
      <SectionHeading
        eyebrow="LOGS"
        title="Analysis Logs"
        description="Complete searchable history of all media submitted through the TRINETRA API. High-risk items are flagged and linked to forensic evidence."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Download className="size-3.5" />}
            >
              Export
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

      <AnalysisLogTable entries={MOCK_ANALYSES} />
    </AppShell>
  );
}
