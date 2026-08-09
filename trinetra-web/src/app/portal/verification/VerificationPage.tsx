"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { AppShell } from "@/components/layout";
import { SectionHeading, Button, Divider } from "@/components/ui";
import {
  Plus,
  Search,
  X,
  FileVideo,
  FileImage,
  FileAudio,
  Upload,
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  FileDown,
  ChevronRight,
  Filter,
  RefreshCw,
  XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type JobStatus = "Completed" | "Review required" | "Processing" | "Failed";
type MediaKind = "Video" | "Image" | "Audio" | "Auto";

export interface VerificationJob {
  id: string;
  mediaName: string;
  mediaKind: Exclude<MediaKind, "Auto">;
  sizeBytes: number;
  status: JobStatus;
  score: number | null; // 0-100 or null if processing/failed
  submitted: string;
  processingTime: string;
  signals: {
    synthetic: { status: "review" | "pass" | "warning"; detail: string };
    provenance: { status: "unverified" | "pass" | "warning"; detail: string };
    metadata: { status: "inconsistent" | "consistent" | "warning"; detail: string };
    forensic: { status: "review" | "pass" | "warning"; detail: string };
  };
}

interface SelectedFile {
  name: string;
  size: number;
  type: string;
  mediaKind: Exclude<MediaKind, "Auto">;
}

type DrawerMode = "none" | "newJob" | "viewJob";

// ─── Initial Mock Jobs ────────────────────────────────────────────────────────

const INITIAL_JOBS: VerificationJob[] = [
  {
    id: "trn_8F2A91",
    mediaName: "campaign_asset.mp4",
    mediaKind: "Video",
    sizeBytes: 42 * 1024 * 1024,
    status: "Completed",
    score: 82,
    submitted: "Just now",
    processingTime: "18.4s",
    signals: {
      synthetic: {
        status: "review",
        detail: "Synthetic facial manipulation indicators detected across frame ranges 240-410.",
      },
      provenance: {
        status: "unverified",
        detail: "No C2PA content authentication manifest bound to this media file.",
      },
      metadata: {
        status: "inconsistent",
        detail: "FFmpeg encoding signature differs from reported capture hardware timestamps.",
      },
      forensic: {
        status: "review",
        detail: "Compression artifact mismatches observed in high-frequency visual channels.",
      },
    },
  },
  {
    id: "trn_8F2A88",
    mediaName: "product_demo.mov",
    mediaKind: "Video",
    sizeBytes: 68 * 1024 * 1024,
    status: "Review required",
    score: 61,
    submitted: "18 min ago",
    processingTime: "22.1s",
    signals: {
      synthetic: {
        status: "review",
        detail: "Deepfake audio-lip sync discrepancy detected with 0.84 confidence score.",
      },
      provenance: {
        status: "unverified",
        detail: "C2PA signature header present but hash verification failed validation.",
      },
      metadata: {
        status: "inconsistent",
        detail: "EXIF camera serial number missing; container metadata modified.",
      },
      forensic: {
        status: "review",
        detail: "Spatial noise variance anomalies detected around facial keypoints.",
      },
    },
  },
  {
    id: "trn_8F2A71",
    mediaName: "press_image.jpg",
    mediaKind: "Image",
    sizeBytes: 4.8 * 1024 * 1024,
    status: "Completed",
    score: 96,
    submitted: "1 hour ago",
    processingTime: "4.2s",
    signals: {
      synthetic: {
        status: "pass",
        detail: "No generative AI or diffusion model signatures detected in spatial analysis.",
      },
      provenance: {
        status: "pass",
        detail: "Valid C2PA claim signature verified from Leica M11 camera hardware trust root.",
      },
      metadata: {
        status: "consistent",
        detail: "Exif tags, lens parameters, and sensor calibration timestamps match natively.",
      },
      forensic: {
        status: "pass",
        detail: "Error Level Analysis (ELA) exhibits uniform Quantization Matrix structure.",
      },
    },
  },
  {
    id: "trn_8F2A43",
    mediaName: "interview.wav",
    mediaKind: "Audio",
    sizeBytes: 12 * 1024 * 1024,
    status: "Processing",
    score: null,
    submitted: "2 hours ago",
    processingTime: "In progress",
    signals: {
      synthetic: {
        status: "review",
        detail: "Awaiting spectrogram model extraction.",
      },
      provenance: {
        status: "unverified",
        detail: "Pending manifest parser output.",
      },
      metadata: {
        status: "consistent",
        detail: "WAV header structure validated.",
      },
      forensic: {
        status: "pass",
        detail: "Phase continuity check in progress.",
      },
    },
  },
  {
    id: "trn_8F2A12",
    mediaName: "statement_audio.mp3",
    mediaKind: "Audio",
    sizeBytes: 8.4 * 1024 * 1024,
    status: "Completed",
    score: 88,
    submitted: "3 hours ago",
    processingTime: "12.8s",
    signals: {
      synthetic: {
        status: "review",
        detail: "Neural voice cloning artifacts detected in vocal formant transitions.",
      },
      provenance: {
        status: "unverified",
        detail: "No digital provenance record provided.",
      },
      metadata: {
        status: "consistent",
        detail: "Audio stream duration matches container metadata length.",
      },
      forensic: {
        status: "pass",
        detail: "Background acoustic noise floor shows expected continuous environmental ambience.",
      },
    },
  },
  {
    id: "trn_8F2990",
    mediaName: "social_clip.mp4",
    mediaKind: "Video",
    sizeBytes: 19 * 1024 * 1024,
    status: "Failed",
    score: null,
    submitted: "5 hours ago",
    processingTime: "Failed",
    signals: {
      synthetic: {
        status: "review",
        detail: "Corrupted video track prevented neural layer evaluation.",
      },
      provenance: {
        status: "unverified",
        detail: "Unable to parse media stream container.",
      },
      metadata: {
        status: "inconsistent",
        detail: "Truncated MP4 box header.",
      },
      forensic: {
        status: "review",
        detail: "Processing terminated due to stream corruption.",
      },
    },
  },
];

const PIPELINE_STAGES = [
  { id: "receive", label: "Media received", description: "File validated and queued for analysis" },
  { id: "extract", label: "Signal extraction", description: "Extracting forensic signals from media content" },
  { id: "provenance", label: "Provenance analysis", description: "Checking C2PA manifest and content origin" },
  { id: "forensic", label: "Forensic evaluation", description: "Running model ensemble across detection modalities" },
  { id: "result", label: "Result generation", description: "Compiling structured verification output" },
];

// ─── Component Helpers ────────────────────────────────────────────────────────

function MediaIcon({ kind, className = "size-4" }: { kind: MediaKind; className?: string }) {
  if (kind === "Video") return <FileVideo className={className} aria-hidden="true" />;
  if (kind === "Image") return <FileImage className={className} aria-hidden="true" />;
  if (kind === "Audio") return <FileAudio className={className} aria-hidden="true" />;
  return <Upload className={className} aria-hidden="true" />;
}

function StatusBadge({ status }: { status: JobStatus }) {
  const styles: Record<JobStatus, string> = {
    Completed: "text-risk-low bg-risk-low-bg border-risk-low-border",
    "Review required": "text-risk-medium bg-risk-medium-bg border-risk-medium-border",
    Processing: "text-brand-600 bg-brand-50 border-brand-100",
    Failed: "text-risk-critical bg-risk-critical-bg border-risk-critical-border",
  };

  const icons: Record<JobStatus, React.ReactNode> = {
    Completed: <CheckCircle2 className="size-3" aria-hidden="true" />,
    "Review required": <AlertTriangle className="size-3" aria-hidden="true" />,
    Processing: <Loader2 className="size-3 animate-spin" aria-hidden="true" />,
    Failed: <XCircle className="size-3" aria-hidden="true" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${styles[status]}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── VerificationPage Component ───────────────────────────────────────────────

export function VerificationPage() {
  const [jobs, setJobs] = useState<VerificationJob[]>(INITIAL_JOBS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [mediaFilter, setMediaFilter] = useState<string>("All");

  // Drawer state
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("none");
  const [selectedJob, setSelectedJob] = useState<VerificationJob | null>(null);

  // New verification form inside drawer
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [mediaType, setMediaType] = useState<MediaKind>("Auto");
  const [signalProfile, setSignalProfile] = useState("Standard");
  const [outputDetail, setOutputDetail] = useState("Standard");
  const [isDragging, setIsDragging] = useState(false);
  const [creatingState, setCreatingState] = useState<"form" | "processing" | "complete">("form");
  const [pipelineIndex, setPipelineIndex] = useState(-1);
  const [createdJob, setCreatedJob] = useState<VerificationJob | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [exported, setExported] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase().trim();
    return jobs.filter((j) => {
      const matchesSearch =
        !q ||
        j.id.toLowerCase().includes(q) ||
        j.mediaName.toLowerCase().includes(q) ||
        j.status.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All" || j.status === statusFilter;
      const matchesMedia =
        mediaFilter === "All" || j.mediaKind === mediaFilter;
      return matchesSearch && matchesStatus && matchesMedia;
    });
  }, [jobs, search, statusFilter, mediaFilter]);

  // Operational metrics
  const activeJobs = jobs.filter((j) => j.status === "Processing").length;
  const completedToday = jobs.filter((j) => j.status === "Completed").length;
  const reviewRequired = jobs.filter((j) => j.status === "Review required").length;

  // File drop handler
  const handleFileSelect = useCallback((f: File) => {
    let kind: Exclude<MediaKind, "Auto"> = "Video";
    if (f.type.startsWith("image/")) kind = "Image";
    else if (f.type.startsWith("audio/")) kind = "Audio";
    setSelectedFile({
      name: f.name,
      size: f.size,
      type: f.type || "application/octet-stream",
      mediaKind: kind,
    });
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  // Run new verification process inside drawer
  const runVerification = () => {
    if (!selectedFile) return;
    setCreatingState("processing");
    setPipelineIndex(0);

    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `trn_8F${randomNum}`;

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < PIPELINE_STAGES.length) {
        setPipelineIndex(idx);
      } else {
        clearInterval(interval);
        const newJobObj: VerificationJob = {
          id: newId,
          mediaName: selectedFile.name,
          mediaKind: mediaType === "Auto" ? selectedFile.mediaKind : mediaType,
          sizeBytes: selectedFile.size,
          status: "Completed",
          score: 84,
          submitted: "Just now",
          processingTime: "14.2s",
          signals: {
            synthetic: {
              status: "review",
              detail: "Synthetic manipulation indicators detected in localized spatial region.",
            },
            provenance: {
              status: "unverified",
              detail: "No C2PA authenticity manifest present in media header.",
            },
            metadata: {
              status: "inconsistent",
              detail: "Container duration mismatches stream packet count.",
            },
            forensic: {
              status: "pass",
              detail: "Uniform compression artifact matrix across primary frames.",
            },
          },
        };
        setJobs((prev) => [newJobObj, ...prev]);
        setCreatedJob(newJobObj);
        setCreatingState("complete");
      }
    }, 800);
  };

  const openNewVerificationDrawer = () => {
    setSelectedFile(null);
    setMediaType("Auto");
    setSignalProfile("Standard");
    setOutputDetail("Standard");
    setCreatingState("form");
    setPipelineIndex(-1);
    setCreatedJob(null);
    setDrawerMode("newJob");
  };

  const openJobDetail = (job: VerificationJob) => {
    setSelectedJob(job);
    setCopiedId(false);
    setExported(false);
    setDrawerMode("viewJob");
  };

  const closeDrawer = () => {
    setDrawerMode("none");
    setSelectedJob(null);
  };

  const copyJobId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const exportResult = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <AppShell
      topBarProps={{
        title: "Verification",
        environment: "sandbox",
        breadcrumbs: [
          { label: "Workspace", href: "/portal" },
          { label: "Verification" },
        ],
      }}
    >
      {/* ── Page Header ── */}
      <SectionHeading
        eyebrow="VERIFICATION"
        title="Verification"
        description="Create verification jobs, monitor processing status, and inspect forensic results."
        action={
          <Button
            variant="primary"
            size="md"
            leadingIcon={<Plus className="size-4" />}
            onClick={openNewVerificationDrawer}
          >
            New verification
          </Button>
        }
      />

      <Divider />

      {/* ── Top Operational Summary Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Jobs", value: activeJobs, status: activeJobs > 0 ? "brand" : "neutral" },
          { label: "Completed Today", value: completedToday, status: "neutral" },
          { label: "Review Required", value: reviewRequired, status: reviewRequired > 0 ? "warning" : "neutral" },
          { label: "API Usage", value: "64%", status: "neutral" },
        ].map(({ label, value, status }) => (
          <div
            key={label}
            className="bg-surface-base border border-border-default rounded-md px-4 py-3 flex flex-col gap-1"
          >
            <span className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
              {label}
            </span>
            <span
              className={[
                "font-mono text-2xl font-bold leading-none",
                status === "brand"
                  ? "text-brand-500"
                  : status === "warning"
                  ? "text-risk-medium"
                  : "text-text-primary",
              ].join(" ")}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Main Workspace: Jobs Table ── */}
      <div className="flex flex-col gap-4">
        {/* Section title & description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Recent verifications
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Verification jobs submitted by your organization.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search
                className="size-3.5 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs font-mono bg-surface-base border border-border-default rounded focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 w-44 text-text-primary placeholder:text-text-tertiary"
                aria-label="Search jobs"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-surface-base border border-border-default rounded p-0.5">
              <Filter className="size-3 text-text-tertiary ml-1.5 mr-0.5" aria-hidden="true" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-7 text-xs bg-transparent text-text-secondary focus:outline-none cursor-pointer pr-1"
                aria-label="Filter by status"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Review required">Review required</option>
                <option value="Processing">Processing</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Media Filter */}
            <div className="flex items-center gap-1 bg-surface-base border border-border-default rounded p-0.5">
              <select
                value={mediaFilter}
                onChange={(e) => setMediaFilter(e.target.value)}
                className="h-7 text-xs bg-transparent text-text-secondary focus:outline-none cursor-pointer px-2"
                aria-label="Filter by media type"
              >
                <option value="All">All Media</option>
                <option value="Video">Video</option>
                <option value="Image">Image</option>
                <option value="Audio">Audio</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Jobs Table */}
        <div className="hidden md:block bg-surface-base border border-border-default rounded-md overflow-hidden">
          <table
            className="w-full text-sm"
            role="table"
            aria-label="Verification jobs"
          >
            <thead>
              <tr className="bg-surface-subtle border-b border-border-default">
                {["JOB", "MEDIA", "STATUS", "SCORE", "SUBMITTED", "ACTIONS"].map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="text-left px-4 py-2.5 font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-text-tertiary">
                    No verification jobs match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => openJobDetail(job)}
                    className="border-b border-border-default last:border-0 hover:bg-surface-subtle transition-colors cursor-pointer"
                  >
                    {/* Job ID */}
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-600">
                      {job.id}
                    </td>

                    {/* Media */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MediaIcon kind={job.mediaKind} className="size-3.5 text-text-tertiary shrink-0" />
                        <span className="font-mono text-xs text-text-primary font-medium truncate max-w-[200px]">
                          {job.mediaName}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3 font-mono text-xs">
                      {job.score !== null ? (
                        <span
                          className={
                            job.score >= 80
                              ? "text-risk-medium font-semibold"
                              : job.score >= 50
                              ? "text-risk-high font-semibold"
                              : "text-risk-low font-semibold"
                          }
                        >
                          {job.score} / 100
                        </span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>

                    {/* Submitted */}
                    <td className="px-4 py-3 font-mono text-xs text-text-tertiary">
                      {job.submitted}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openJobDetail(job)}
                        trailingIcon={<ChevronRight className="size-3" />}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Job Records */}
        <div className="md:hidden flex flex-col gap-2">
          {filteredJobs.length === 0 ? (
            <p className="text-xs text-text-tertiary text-center py-6">
              No verification jobs match your filter criteria.
            </p>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => openJobDetail(job)}
                className="bg-surface-base border border-border-default rounded-md p-4 flex flex-col gap-2.5 cursor-pointer hover:border-brand-200 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-brand-600">
                    {job.id}
                  </span>
                  <StatusBadge status={job.status} />
                </div>

                <div className="flex items-center gap-2">
                  <MediaIcon kind={job.mediaKind} className="size-3.5 text-text-tertiary shrink-0" />
                  <span className="font-mono text-xs text-text-primary font-medium truncate">
                    {job.mediaName}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-default text-xs font-mono">
                  <span className="text-text-tertiary">{job.submitted}</span>
                  {job.score !== null ? (
                    <span className="font-semibold text-risk-medium">
                      Score: {job.score} / 100
                    </span>
                  ) : (
                    <span className="text-text-tertiary">—</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── SIDE DRAWER (New Verification / Job Details) ── */}
      {drawerMode !== "none" && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={closeDrawer} />

          {/* Drawer Body */}
          <div className="w-full max-w-lg bg-surface-base border-l border-border-default h-full flex flex-col shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-border-default flex items-center justify-between bg-surface-subtle shrink-0">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-500">
                  {drawerMode === "newJob" ? "JOB CREATION" : "OPERATIONAL RECORD"}
                </p>
                <h2 className="text-lg font-semibold text-text-primary leading-tight">
                  {drawerMode === "newJob"
                    ? "New verification job"
                    : `Job ${selectedJob?.id}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close drawer"
                className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-base transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 flex-1 flex flex-col gap-6">
              {/* ── MODE A: New Verification Drawer ── */}
              {drawerMode === "newJob" && (
                <>
                  {creatingState === "form" ? (
                    <div className="flex flex-col gap-5">
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">
                          Media payload
                        </h3>
                        <p className="text-xs text-text-secondary mt-0.5">
                          Upload video, image, or audio content to enqueue a new verification task.
                        </p>
                      </div>

                      {/* Dropzone */}
                      {!selectedFile ? (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          className={[
                            "border-2 border-dashed rounded-md p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer",
                            isDragging
                              ? "border-brand-400 bg-brand-50"
                              : "border-border-default bg-surface-app hover:border-brand-300 hover:bg-surface-subtle",
                          ].join(" ")}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="size-10 rounded-full bg-surface-base border border-border-default flex items-center justify-center">
                            <Upload className="size-4 text-text-tertiary" aria-hidden="true" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-text-primary">
                              Drag and drop a file, or{" "}
                              <span className="text-brand-600 font-semibold underline">
                                browse files
                              </span>
                            </p>
                            <p className="text-[11px] font-mono text-text-tertiary mt-1">
                              MP4, MOV, JPG, PNG, WAV, MP3 — Max 100 MB
                            </p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*,image/*,audio/*"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileSelect(f);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="border border-border-default rounded-md bg-surface-base px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <MediaIcon kind={selectedFile.mediaKind} className="size-4 text-brand-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-medium text-text-primary truncate">
                                {selectedFile.name}
                              </p>
                              <p className="font-mono text-[10px] text-text-tertiary">
                                {selectedFile.mediaKind} &middot; {formatBytes(selectedFile.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="p-1 rounded text-text-tertiary hover:text-risk-critical"
                          >
                            <X className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      )}

                      {/* Job Parameters */}
                      <div className="border-t border-border-default pt-4 flex flex-col gap-4">
                        <h3 className="text-sm font-semibold text-text-primary">
                          Parameters
                        </h3>

                        <div className="grid grid-cols-1 gap-3">
                          {[
                            {
                              label: "Media type",
                              value: mediaType,
                              options: ["Auto", "Video", "Image", "Audio"],
                              onChange: (val: string) => setMediaType(val as MediaKind),
                            },
                            {
                              label: "Signal profile",
                              value: signalProfile,
                              options: ["Standard", "Deep", "Express"],
                              onChange: setSignalProfile,
                            },
                            {
                              label: "Output detail",
                              value: outputDetail,
                              options: ["Standard", "Full", "Summary"],
                              onChange: setOutputDetail,
                            },
                          ].map(({ label, value, options, onChange }) => (
                            <div key={label} className="flex items-center justify-between text-xs">
                              <span className="text-text-secondary font-medium">{label}</span>
                              <select
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                className="font-mono text-xs bg-surface-base border border-border-default rounded px-2.5 py-1 focus:outline-none focus:border-brand-500 cursor-pointer"
                              >
                                {options.map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Submit CTA */}
                      <div className="pt-2">
                        <Button
                          variant="primary"
                          size="md"
                          className="w-full"
                          disabled={!selectedFile}
                          onClick={runVerification}
                          trailingIcon={<ChevronRight className="size-4" />}
                        >
                          Run verification job
                        </Button>
                      </div>
                    </div>
                  ) : creatingState === "processing" ? (
                    <div className="flex flex-col gap-6 py-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="size-5 text-brand-600 animate-spin" aria-hidden="true" />
                        <div>
                          <p className="font-mono text-xs font-semibold text-brand-600">
                            Status: Processing
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Running model ensemble across detection modalities...
                          </p>
                        </div>
                      </div>

                      {/* Pipeline steps */}
                      <div className="border border-border-default rounded-md bg-surface-base p-4 flex flex-col gap-3">
                        <p className="font-mono text-[10px] font-semibold uppercase text-text-tertiary">
                          Pipeline Execution
                        </p>

                        <div className="flex flex-col gap-3">
                          {PIPELINE_STAGES.map((stage, i) => {
                            const isDone = i < pipelineIndex;
                            const isCurrent = i === pipelineIndex;
                            return (
                              <div key={stage.id} className="flex items-start gap-3 text-xs">
                                <div className="mt-0.5">
                                  {isDone ? (
                                    <CheckCircle2 className="size-4 text-risk-low" aria-hidden="true" />
                                  ) : isCurrent ? (
                                    <Loader2 className="size-4 text-brand-500 animate-spin" aria-hidden="true" />
                                  ) : (
                                    <Circle className="size-4 text-text-tertiary" aria-hidden="true" />
                                  )}
                                </div>
                                <div>
                                  <p
                                    className={[
                                      "font-medium leading-tight",
                                      isDone
                                        ? "text-text-primary"
                                        : isCurrent
                                        ? "text-brand-600 font-semibold"
                                        : "text-text-tertiary",
                                    ].join(" ")}
                                  >
                                    {stage.label}
                                  </p>
                                  <p className="text-[11px] text-text-tertiary mt-0.5">
                                    {stage.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Complete state inside creation drawer */
                    <div className="flex flex-col gap-6 py-2">
                      <div className="flex items-center gap-3 bg-risk-low-bg border border-risk-low-border p-4 rounded-md text-risk-low">
                        <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
                        <div>
                          <p className="font-mono text-xs font-bold">Verification Job Complete</p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Job ID <span className="font-mono font-semibold">{createdJob?.id}</span> is compiled and ready for review.
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        className="w-full"
                        onClick={() => {
                          if (createdJob) openJobDetail(createdJob);
                        }}
                      >
                        View result details
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* ── MODE B: Job Detail View ── */}
              {drawerMode === "viewJob" && selectedJob && (
                <div className="flex flex-col gap-6">
                  {/* Job Metadata Grid */}
                  <div className="bg-surface-subtle border border-border-default rounded-md p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between pb-3 border-b border-border-default">
                      <div>
                        <span className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
                          Job ID
                        </span>
                        <p className="font-mono text-base font-bold text-brand-600">
                          {selectedJob.id}
                        </p>
                      </div>
                      <StatusBadge status={selectedJob.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-text-tertiary font-mono">Media file</span>
                        <p className="font-mono font-medium text-text-primary truncate">
                          {selectedJob.mediaName}
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] text-text-tertiary font-mono">Media type</span>
                        <p className="font-mono font-medium text-text-primary">
                          {selectedJob.mediaKind}
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] text-text-tertiary font-mono">Submitted</span>
                        <p className="font-mono text-text-secondary">{selectedJob.submitted}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-text-tertiary font-mono">Processing time</span>
                        <p className="font-mono text-text-secondary">{selectedJob.processingTime}</p>
                      </div>
                    </div>

                    {/* Verification Score Card */}
                    {selectedJob.score !== null && (
                      <div className="mt-1 pt-3 border-t border-border-default flex items-center justify-between">
                        <span className="font-mono text-xs text-text-secondary">
                          Verification Score
                        </span>
                        <span className="font-mono text-xl font-bold text-risk-medium">
                          {selectedJob.score} <span className="text-xs text-text-tertiary font-normal">/ 100</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Structured Forensic Evidence */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-text-primary">
                      Forensic signal decomposition
                    </h3>

                    <div className="bg-surface-base border border-border-default rounded-md divide-y divide-border-default">
                      {[
                        {
                          title: "Synthetic media detection",
                          statusLabel: selectedJob.signals.synthetic.status === "review" ? "Review required" : "Passed",
                          badgeStyle: selectedJob.signals.synthetic.status === "review" ? "text-risk-medium bg-risk-medium-bg" : "text-risk-low bg-risk-low-bg",
                          detail: selectedJob.signals.synthetic.detail,
                        },
                        {
                          title: "Provenance / C2PA",
                          statusLabel: selectedJob.signals.provenance.status === "unverified" ? "Not verified" : "Verified",
                          badgeStyle: selectedJob.signals.provenance.status === "unverified" ? "text-text-tertiary bg-surface-subtle" : "text-risk-low bg-risk-low-bg",
                          detail: selectedJob.signals.provenance.detail,
                        },
                        {
                          title: "Metadata analysis",
                          statusLabel: selectedJob.signals.metadata.status === "inconsistent" ? "Inconsistent" : "Consistent",
                          badgeStyle: selectedJob.signals.metadata.status === "inconsistent" ? "text-risk-medium bg-risk-medium-bg" : "text-risk-low bg-risk-low-bg",
                          detail: selectedJob.signals.metadata.detail,
                        },
                        {
                          title: "Forensic signals",
                          statusLabel: selectedJob.signals.forensic.status === "review" ? "Review required" : "Passed",
                          badgeStyle: selectedJob.signals.forensic.status === "review" ? "text-risk-medium bg-risk-medium-bg" : "text-risk-low bg-risk-low-bg",
                          detail: selectedJob.signals.forensic.detail,
                        },
                      ].map((sig) => (
                        <div key={sig.title} className="p-3.5 flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-text-primary">
                              {sig.title}
                            </span>
                            <span
                              className={`font-mono text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border border-border-default ${sig.badgeStyle}`}
                            >
                              {sig.statusLabel}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed font-mono mt-0.5">
                            {sig.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Result Actions */}
                  <div className="border-t border-border-default pt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        leadingIcon={copiedId ? <Check className="size-3.5 text-risk-low" /> : <Copy className="size-3.5" />}
                        onClick={() => copyJobId(selectedJob.id)}
                      >
                        {copiedId ? "Copied ID" : "Copy Job ID"}
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        leadingIcon={exported ? <Check className="size-3.5 text-risk-low" /> : <FileDown className="size-3.5" />}
                        onClick={exportResult}
                      >
                        {exported ? "Exported" : "Export result"}
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      leadingIcon={<RefreshCw className="size-3.5" />}
                      onClick={openNewVerificationDrawer}
                    >
                      Run another verification
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
