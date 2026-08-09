"use client";

import * as React from "react";
import type { AnalysisLogEntry } from "@/types/analysis";
import type { MediaType, RiskLevel, AnalysisStatus } from "@/types/common";
import { RiskBadge } from "./AESDisplay";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import {
  FileVideo,
  FileAudio,
  FileImage,
  FileText,
  ChevronRight,
  Search,
  Filter,
  Download,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

// ─── Media type icon map ──────────────────────────────────────────────────────

const mediaIconMap: Record<MediaType, React.ElementType> = {
  video: FileVideo,
  audio: FileAudio,
  image: FileImage,
  document: FileText,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }) + " UTC";
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Table component ─────────────────────────────────────────────────────────

export interface AnalysisLogTableProps {
  entries: AnalysisLogEntry[];
  onSelectEntry?: (entry: AnalysisLogEntry) => void;
  selectedId?: string;
  className?: string;
}

export function AnalysisLogTable({
  entries,
  onSelectEntry,
  selectedId,
  className = "",
}: AnalysisLogTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<AnalysisStatus | "all">("all");
  const [riskFilter, setRiskFilter] = React.useState<RiskLevel | "all">("all");
  // Media type filter — UI controls wired in a future iteration; defaults to "all"
  const mediaFilter: MediaType | "all" = "all";

  // Filter logic
  const filtered = entries.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.task_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.uploader_declaration?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    const matchesRisk = riskFilter === "all" || entry.risk_level === riskFilter;
    const matchesMedia = mediaFilter === "all" || entry.media_type === mediaFilter;
    return matchesSearch && matchesStatus && matchesRisk && matchesMedia;
  });

  const activeFilterCount = [
    statusFilter !== "all",
    riskFilter !== "all",
    mediaFilter !== "all",
  ].filter(Boolean).length;

  return (
    <div className={["flex flex-col gap-0", className].join(" ")}>
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-48 max-w-sm">
          <Input
            placeholder="Search task ID or declaration…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leadingIcon={<Search className="size-4" aria-hidden="true" />}
          />
        </div>

        {/* Quick filter buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <div className="flex items-center gap-1 text-xs font-mono text-text-tertiary">
            <Filter className="size-3" aria-hidden="true" />
            <span className="uppercase tracking-wide hidden sm:inline">Status</span>
          </div>
          {(["all", "flagged", "verified", "processing", "queued", "failed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={[
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-brand-500 text-text-inverse"
                  : "bg-surface-base border border-border-default text-text-secondary hover:bg-surface-subtle",
              ].join(" ")}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}

          {/* Risk filter */}
          <div className="w-px h-5 bg-border-default mx-1" aria-hidden="true" />
          {(["all", "critical", "high", "medium", "low"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={[
                "px-2.5 py-1 rounded text-xs font-medium transition-colors capitalize",
                riskFilter === r
                  ? "bg-brand-500 text-text-inverse"
                  : "bg-surface-base border border-border-default text-text-secondary hover:bg-surface-subtle",
              ].join(" ")}
            >
              {r === "all" ? "All Risk" : r}
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<SlidersHorizontal className="size-3.5" />}
          className="ml-auto"
        >
          {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters"}
        </Button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <p className="text-xs text-text-tertiary font-mono">
          {filtered.length} of {entries.length} scans
        </p>
        <Button variant="ghost" size="sm" leadingIcon={<Download className="size-3.5" />}>
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border-default rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Analysis log entries">
            <thead>
              <tr className="bg-surface-subtle border-b border-border-default">
                <th scope="col" className="text-left px-4 py-2.5 text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                  Task ID
                </th>
                <th scope="col" className="text-left px-4 py-2.5 text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th scope="col" className="text-left px-4 py-2.5 text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th scope="col" className="text-left px-4 py-2.5 text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                  AES
                </th>
                <th scope="col" className="text-left px-4 py-2.5 text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                  Risk
                </th>
                <th scope="col" className="text-left px-4 py-2.5 text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Source
                </th>
                <th scope="col" className="text-left px-4 py-2.5 text-[11px] font-mono font-semibold text-text-tertiary uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                  Submitted
                </th>
                <th scope="col" className="px-4 py-2.5 w-10" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-text-tertiary">
                    No analyses match your current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => {
                  const Icon = mediaIconMap[entry.media_type];
                  const isSelected = entry.task_id === selectedId;
                  const isHighRisk = entry.risk_level === "critical" || entry.risk_level === "high";

                  return (
                    <tr
                      key={entry.task_id}
                      onClick={() => onSelectEntry?.(entry)}
                      className={[
                        "border-b border-border-default last:border-0 transition-colors cursor-pointer",
                        isSelected
                          ? "bg-brand-50 border-l-2 border-l-brand-500"
                          : isHighRisk && (entry.status === "flagged")
                          ? "hover:bg-risk-critical-bg/30"
                          : "hover:bg-surface-subtle",
                      ].join(" ")}
                    >
                      {/* Task ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/portal/logs/${entry.task_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-xs text-brand-600 hover:underline focus-visible:outline-brand-500"
                        >
                          {entry.task_id}
                        </Link>
                      </td>

                      {/* Media type */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Icon className="size-3.5 text-text-tertiary shrink-0" aria-hidden="true" />
                          <Badge variant={entry.media_type}>
                            {entry.media_type}
                          </Badge>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={entry.status} />
                      </td>

                      {/* AES Score */}
                      <td className="px-4 py-3">
                        {entry.authenticity_evidence_score !== null ? (
                          <span
                            className={[
                              "font-mono text-sm font-semibold",
                              entry.risk_level === "critical" ? "text-risk-critical" :
                              entry.risk_level === "high" ? "text-risk-high" :
                              entry.risk_level === "medium" ? "text-risk-medium" :
                              "text-risk-low",
                            ].join(" ")}
                          >
                            {entry.authenticity_evidence_score}
                          </span>
                        ) : (
                          <span className="text-text-tertiary font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* Risk badge */}
                      <td className="px-4 py-3">
                        {entry.risk_level ? (
                          <RiskBadge riskLevel={entry.risk_level} />
                        ) : (
                          <span className="text-text-tertiary font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* API Key Source */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge variant={entry.api_key_source === "live" ? "production" : "sandbox"}>
                          {entry.api_key_source}
                        </Badge>
                      </td>

                      {/* Submitted timestamp */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span
                          className="font-mono text-xs text-text-tertiary whitespace-nowrap"
                          title={formatTimestamp(entry.submitted_at)}
                        >
                          {relativeTime(entry.submitted_at)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-2 py-3">
                        <Link
                          href={`/portal/logs/${entry.task_id}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`View details for ${entry.task_id}`}
                          className="flex items-center justify-center size-7 rounded text-text-tertiary hover:bg-surface-raised hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
                        >
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
