import type {
  AESScore,
  MediaType,
  RiskLevel,
  AnalysisStatus,
  ConfidenceInterval,
  FusionMethod,
  ActionRecommendation,
} from "./common";

// ─── Per-model result ─────────────────────────────────────────────────────────

export interface ModelResult {
  /** Raw probability 0.0–1.0 */
  probability: number;
  /** "synthetic" | "authentic" */
  class: "synthetic" | "authentic";
  /** Weight version hash for legal reproducibility */
  weight_version?: string;
}

// ─── Anomaly timestamp ────────────────────────────────────────────────────────

export interface AnomalyTimestamp {
  start: string; // "MM:SS"
  end: string;
}

// ─── Full analysis result — mirrors PRD webhook payload ──────────────────────

export interface AnalysisResult {
  /** Unique task identifier — format: trk_XXXXXXXXX_x */
  task_id: string;
  /** Authenticity Evidence Score: 0 (synthetic) – 100 (authentic) */
  authenticity_evidence_score: AESScore;
  risk_level: RiskLevel;
  confidence_interval: ConfidenceInterval;
  /** Most significant anomaly type detected */
  primary_anomaly: string | null;
  anomaly_timestamps: AnomalyTimestamp[];
  /** Which modalities were present in this media */
  modalities_scanned: MediaType[];
  /** Per-model individual detection results */
  model_results: Record<string, ModelResult | number>;
  fusion_method_used: FusionMethod;
  model_weight_versions: Record<string, string>;
  c2pa_manifest_present: boolean;
  uploader_declaration_mismatch: boolean;
  action_recommendation: ActionRecommendation;
  audit_pdf_report_url: string | null;
}

// ─── Analysis log entry (list view) ──────────────────────────────────────────

export interface AnalysisLogEntry {
  task_id: string;
  status: AnalysisStatus;
  media_type: MediaType;
  submitted_at: string;       // ISO 8601
  completed_at: string | null;// ISO 8601
  authenticity_evidence_score: AESScore | null;
  risk_level: RiskLevel | null;
  confidence_interval: ConfidenceInterval | null;
  primary_anomaly: string | null;
  api_key_source: "live" | "sandbox";
  uploader_declaration: string | null;
  file_hash: string;
  audit_pdf_report_url: string | null;
  result?: AnalysisResult;
}
