import type { DailyUsageRecord, CreditBalance, BillingSummary } from "@/types/usage";

// ─── Consistent with Command Center mock (14,892 scans today, 100,000 total credits, $1,847.92 spent)

// ─── 30 days of daily usage — current month ────────────────────────────────────

export const MOCK_DAILY_USAGE: DailyUsageRecord[] = [
  { date: "2026-07-10", total_scans: 8_214,  video_scans: 3_102, audio_scans: 2_811, image_scans: 1_904, document_scans: 397,  high_risk_detected: 189, cost_usd: 41.07 },
  { date: "2026-07-11", total_scans: 9_047,  video_scans: 3_412, audio_scans: 3_103, image_scans: 2_100, document_scans: 432,  high_risk_detected: 212, cost_usd: 45.24 },
  { date: "2026-07-12", total_scans: 5_212,  video_scans: 2_009, audio_scans: 1_788, image_scans: 1_201, document_scans: 214,  high_risk_detected: 103, cost_usd: 26.06 },
  { date: "2026-07-13", total_scans: 4_988,  video_scans: 1_920, audio_scans: 1_703, image_scans: 1_144, document_scans: 221,  high_risk_detected: 98,  cost_usd: 24.94 },
  { date: "2026-07-14", total_scans: 10_340, video_scans: 3_901, audio_scans: 3_546, image_scans: 2_401, document_scans: 492,  high_risk_detected: 248, cost_usd: 51.70 },
  { date: "2026-07-15", total_scans: 11_892, video_scans: 4_482, audio_scans: 4_077, image_scans: 2_764, document_scans: 569,  high_risk_detected: 287, cost_usd: 59.46 },
  { date: "2026-07-16", total_scans: 12_441, video_scans: 4_700, audio_scans: 4_268, image_scans: 2_892, document_scans: 581,  high_risk_detected: 304, cost_usd: 62.21 },
  { date: "2026-07-17", total_scans: 11_023, video_scans: 4_162, audio_scans: 3_782, image_scans: 2_561, document_scans: 518,  high_risk_detected: 263, cost_usd: 55.12 },
  { date: "2026-07-18", total_scans: 13_109, video_scans: 4_952, audio_scans: 4_498, image_scans: 3_050, document_scans: 609,  high_risk_detected: 318, cost_usd: 65.55 },
  { date: "2026-07-19", total_scans: 6_734,  video_scans: 2_542, audio_scans: 2_310, image_scans: 1_566, document_scans: 316,  high_risk_detected: 148, cost_usd: 33.67 },
  { date: "2026-07-20", total_scans: 5_891,  video_scans: 2_224, audio_scans: 2_020, image_scans: 1_370, document_scans: 277,  high_risk_detected: 121, cost_usd: 29.46 },
  { date: "2026-07-21", total_scans: 14_022, video_scans: 5_300, audio_scans: 4_808, image_scans: 3_260, document_scans: 654,  high_risk_detected: 341, cost_usd: 70.11 },
  { date: "2026-07-22", total_scans: 12_778, video_scans: 4_826, audio_scans: 4_383, image_scans: 2_972, document_scans: 597,  high_risk_detected: 309, cost_usd: 63.89 },
  { date: "2026-07-23", total_scans: 13_456, video_scans: 5_082, audio_scans: 4_614, image_scans: 3_129, document_scans: 631,  high_risk_detected: 328, cost_usd: 67.28 },
  { date: "2026-07-24", total_scans: 11_204, video_scans: 4_231, audio_scans: 3_842, image_scans: 2_604, document_scans: 527,  high_risk_detected: 268, cost_usd: 56.02 },
  { date: "2026-07-25", total_scans: 9_867,  video_scans: 3_726, audio_scans: 3_384, image_scans: 2_295, document_scans: 462,  high_risk_detected: 231, cost_usd: 49.34 },
  { date: "2026-07-26", total_scans: 5_102,  video_scans: 1_927, audio_scans: 1_749, image_scans: 1_188, document_scans: 238,  high_risk_detected: 104, cost_usd: 25.51 },
  { date: "2026-07-27", total_scans: 4_621,  video_scans: 1_745, audio_scans: 1_584, image_scans: 1_074, document_scans: 218,  high_risk_detected: 89,  cost_usd: 23.11 },
  { date: "2026-07-28", total_scans: 15_201, video_scans: 5_742, audio_scans: 5_212, image_scans: 3_538, document_scans: 709,  high_risk_detected: 369, cost_usd: 76.01 },
  { date: "2026-07-29", total_scans: 13_887, video_scans: 5_247, audio_scans: 4_762, image_scans: 3_231, document_scans: 647,  high_risk_detected: 334, cost_usd: 69.44 },
  { date: "2026-07-30", total_scans: 14_112, video_scans: 5_332, audio_scans: 4_841, image_scans: 3_285, document_scans: 654,  high_risk_detected: 339, cost_usd: 70.56 },
  { date: "2026-07-31", total_scans: 12_340, video_scans: 4_661, audio_scans: 4_232, image_scans: 2_871, document_scans: 576,  high_risk_detected: 296, cost_usd: 61.70 },
  { date: "2026-08-01", total_scans: 11_788, video_scans: 4_451, audio_scans: 4_043, image_scans: 2_741, document_scans: 553,  high_risk_detected: 278, cost_usd: 58.94 },
  { date: "2026-08-02", total_scans: 5_299,  video_scans: 2_002, audio_scans: 1_817, image_scans: 1_232, document_scans: 248,  high_risk_detected: 107, cost_usd: 26.50 },
  { date: "2026-08-03", total_scans: 4_801,  video_scans: 1_814, audio_scans: 1_646, image_scans: 1_117, document_scans: 224,  high_risk_detected: 95,  cost_usd: 24.01 },
  { date: "2026-08-04", total_scans: 13_991, video_scans: 5_288, audio_scans: 4_802, image_scans: 3_253, document_scans: 648,  high_risk_detected: 336, cost_usd: 69.96 },
  { date: "2026-08-05", total_scans: 14_508, video_scans: 5_482, audio_scans: 4_978, image_scans: 3_375, document_scans: 673,  high_risk_detected: 351, cost_usd: 72.54 },
  { date: "2026-08-06", total_scans: 13_244, video_scans: 5_003, audio_scans: 4_543, image_scans: 3_081, document_scans: 617,  high_risk_detected: 318, cost_usd: 66.22 },
  { date: "2026-08-07", total_scans: 12_901, video_scans: 4_874, audio_scans: 4_425, image_scans: 3_000, document_scans: 602,  high_risk_detected: 309, cost_usd: 64.51 },
  { date: "2026-08-08", total_scans: 14_892, video_scans: 5_628, audio_scans: 5_113, image_scans: 3_467, document_scans: 684,  high_risk_detected: 342, cost_usd: 74.46 },
];

// ─── Credit balance — exact match with Command Center mock ────────────────────

export const MOCK_CREDIT_BALANCE: CreditBalance = {
  total_credits: 100_000,
  used_credits: 53_892,
  remaining_credits: 46_108,
  expires_at: "2026-09-01T00:00:00Z",
  spend_cap_usd: 5_000,
  spend_cap_enabled: true,
  current_spend_usd: 1_847.92,
};

// ─── Billing summary ──────────────────────────────────────────────────────────

export const MOCK_BILLING_SUMMARY: BillingSummary = {
  plan_name: "Growth",
  billing_period_start: "2026-08-01T00:00:00Z",
  billing_period_end: "2026-08-31T23:59:59Z",
  scans_included: 50_000,
  scans_used: 53_892,
  overage_rate_per_scan_usd: 0.005,
  estimated_bill_usd: 1_847.92,
};

// ─── Model pipeline usage (credits consumed by each model) ────────────────────

export interface ModelPipelineUsage {
  model: string;
  modality: string;
  scans_processed: number;
  credits_consumed: number;
  avg_latency_ms: number;
}

export const MOCK_MODEL_PIPELINE_USAGE: ModelPipelineUsage[] = [
  { model: "AASIST",             modality: "Audio",      scans_processed: 32_904, credits_consumed: 18_044, avg_latency_ms: 3_820 },
  { model: "RawNet3",            modality: "Audio",      scans_processed: 32_904, credits_consumed: 17_389, avg_latency_ms: 4_012 },
  { model: "FTCN",               modality: "Video",      scans_processed: 27_218, credits_consumed: 14_901, avg_latency_ms: 5_210 },
  { model: "SBI",                modality: "Video",      scans_processed: 27_218, credits_consumed: 13_788, avg_latency_ms: 4_891 },
  { model: "NPR",                modality: "Image",      scans_processed: 19_441, credits_consumed: 9_820,  avg_latency_ms: 2_100 },
  { model: "UniversalFakeDetect",modality: "Image",      scans_processed: 19_441, credits_consumed: 9_441,  avg_latency_ms: 2_340 },
  { model: "c2pa-rs",            modality: "Provenance", scans_processed: 53_892, credits_consumed: 5_389,  avg_latency_ms: 180  },
  { model: "Fusion Stacking",    modality: "Meta",       scans_processed: 53_892, credits_consumed: 4_850,  avg_latency_ms: 620  },
  { model: "ReportLab PDF",      modality: "Report",     scans_processed: 53_892, credits_consumed: 2_160,  avg_latency_ms: 390  },
];

// ─── Usage history rows (for table) ───────────────────────────────────────────

export interface UsageHistoryRow {
  date: string;       // YYYY-MM-DD
  task_id: string;
  media_type: "video" | "audio" | "image" | "document";
  credits_used: number;
  aes_score: number | null;
  status: "completed" | "flagged" | "verified" | "failed";
  environment: "live" | "sandbox";
  cost_usd: number;
}

export const MOCK_USAGE_HISTORY: UsageHistoryRow[] = [
  { date: "2026-08-08", task_id: "trk_982347110_x", media_type: "video",    credits_used: 5, aes_score: 31,  status: "flagged",   environment: "live",    cost_usd: 0.025 },
  { date: "2026-08-08", task_id: "trk_881023441_x", media_type: "audio",    credits_used: 3, aes_score: 8,   status: "flagged",   environment: "live",    cost_usd: 0.015 },
  { date: "2026-08-08", task_id: "trk_779452332_x", media_type: "image",    credits_used: 2, aes_score: 19,  status: "flagged",   environment: "live",    cost_usd: 0.010 },
  { date: "2026-08-08", task_id: "trk_667834219_x", media_type: "video",    credits_used: 5, aes_score: 38,  status: "flagged",   environment: "live",    cost_usd: 0.025 },
  { date: "2026-08-08", task_id: "trk_554219887_x", media_type: "video",    credits_used: 5, aes_score: 54,  status: "completed", environment: "live",    cost_usd: 0.025 },
  { date: "2026-08-08", task_id: "trk_443108776_x", media_type: "video",    credits_used: 5, aes_score: 91,  status: "verified",  environment: "live",    cost_usd: 0.025 },
  { date: "2026-08-08", task_id: "trk_332007665_x", media_type: "image",    credits_used: 2, aes_score: 85,  status: "verified",  environment: "sandbox", cost_usd: 0.000 },
  { date: "2026-08-07", task_id: "trk_887452110_x", media_type: "audio",    credits_used: 3, aes_score: 78,  status: "verified",  environment: "live",    cost_usd: 0.015 },
  { date: "2026-08-07", task_id: "trk_776341009_x", media_type: "image",    credits_used: 2, aes_score: 22,  status: "flagged",   environment: "live",    cost_usd: 0.010 },
  { date: "2026-08-07", task_id: "trk_665230898_x", media_type: "video",    credits_used: 5, aes_score: 63,  status: "completed", environment: "sandbox", cost_usd: 0.000 },
  { date: "2026-08-07", task_id: "trk_554119787_x", media_type: "document", credits_used: 1, aes_score: 96,  status: "verified",  environment: "live",    cost_usd: 0.005 },
  { date: "2026-08-06", task_id: "trk_443008676_x", media_type: "video",    credits_used: 5, aes_score: 44,  status: "flagged",   environment: "live",    cost_usd: 0.025 },
  { date: "2026-08-06", task_id: "trk_332897565_x", media_type: "audio",    credits_used: 3, aes_score: 71,  status: "verified",  environment: "live",    cost_usd: 0.015 },
  { date: "2026-08-06", task_id: "trk_221786454_x", media_type: "image",    credits_used: 2, aes_score: 15,  status: "flagged",   environment: "live",    cost_usd: 0.010 },
  { date: "2026-08-05", task_id: "trk_110675343_x", media_type: "video",    credits_used: 5, aes_score: 88,  status: "verified",  environment: "live",    cost_usd: 0.025 },
  { date: "2026-08-05", task_id: "trk_009564232_x", media_type: "audio",    credits_used: 3, aes_score: 7,   status: "flagged",   environment: "live",    cost_usd: 0.015 },
  { date: "2026-08-04", task_id: "trk_998453121_x", media_type: "document", credits_used: 1, aes_score: null, status: "failed",   environment: "live",    cost_usd: 0.000 },
  { date: "2026-08-04", task_id: "trk_887342010_x", media_type: "video",    credits_used: 5, aes_score: 62,  status: "completed", environment: "live",    cost_usd: 0.025 },
  { date: "2026-08-03", task_id: "trk_776230899_x", media_type: "image",    credits_used: 2, aes_score: 92,  status: "verified",  environment: "sandbox", cost_usd: 0.000 },
  { date: "2026-08-02", task_id: "trk_665119788_x", media_type: "audio",    credits_used: 3, aes_score: 41,  status: "flagged",   environment: "live",    cost_usd: 0.015 },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

/** Sum of credits used across current period (consistent with CreditBalance.used_credits) */
export const PERIOD_CREDITS_USED = MOCK_CREDIT_BALANCE.used_credits; // 53,892

/** Media type totals derived from daily usage, last 30 days */
export const MEDIA_TOTALS = MOCK_DAILY_USAGE.reduce(
  (acc, d) => ({
    video: acc.video + d.video_scans,
    audio: acc.audio + d.audio_scans,
    image: acc.image + d.image_scans,
    document: acc.document + d.document_scans,
  }),
  { video: 0, audio: 0, image: 0, document: 0 }
);

export const MEDIA_TOTAL_ALL =
  MEDIA_TOTALS.video + MEDIA_TOTALS.audio + MEDIA_TOTALS.image + MEDIA_TOTALS.document;
