// ─── Media & Risk ─────────────────────────────────────────────────────────────

export type MediaType = "video" | "audio" | "image" | "document";

export type RiskLevel = "critical" | "high" | "medium" | "low";

export type AnalysisStatus =
  | "processing"
  | "completed"
  | "failed"
  | "queued"
  | "verified"
  | "flagged";

export type ConfidenceInterval = "HIGH" | "MEDIUM" | "LOW";

export type FusionMethod = "stacking" | "averaging" | "voting";

export type ActionRecommendation =
  | "AUTO_HOLD_FOR_HUMAN_TRIAGE"
  | "AUTO_BLOCK"
  | "CLEAR_FOR_PUBLICATION"
  | "MANUAL_REVIEW_RECOMMENDED"
  | "INSUFFICIENT_DATA";

// ─── AES Score ───────────────────────────────────────────────────────────────

/** Authenticity Evidence Score: 0 = synthetic, 100 = authentic */
export type AESScore = number;

/** Map AES numeric value to risk level */
export function aesToRiskLevel(aes: AESScore): RiskLevel {
  if (aes <= 25) return "critical";
  if (aes <= 49) return "high";
  if (aes <= 69) return "medium";
  return "low";
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  critical: "HIGH RISK",
  high: "ELEVATED",
  medium: "MODERATE",
  low: "AUTHENTIC",
};

export const STATUS_LABELS: Record<AnalysisStatus, string> = {
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  queued: "Queued",
  verified: "Verified",
  flagged: "Flagged",
};
