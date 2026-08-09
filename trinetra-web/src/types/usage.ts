// ─── Usage record (daily) ─────────────────────────────────────────────────────

export interface DailyUsageRecord {
  date: string; // "YYYY-MM-DD"
  total_scans: number;
  video_scans: number;
  audio_scans: number;
  image_scans: number;
  document_scans: number;
  high_risk_detected: number;
  /** Cost in USD for that day */
  cost_usd: number;
}

// ─── Credit balance ───────────────────────────────────────────────────────────

export interface CreditBalance {
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
  /** ISO 8601 expiry date */
  expires_at: string | null;
  spend_cap_usd: number | null;
  spend_cap_enabled: boolean;
  current_spend_usd: number;
}

// ─── Billing summary ──────────────────────────────────────────────────────────

export interface BillingSummary {
  plan_name: "Starter" | "Growth" | "Enterprise" | "Pay-as-you-go";
  billing_period_start: string;
  billing_period_end: string;
  scans_included: number;
  scans_used: number;
  overage_rate_per_scan_usd: number;
  estimated_bill_usd: number;
}
