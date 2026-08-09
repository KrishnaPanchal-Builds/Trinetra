import type { APIKey, WebhookEndpoint, WebhookDelivery } from "@/types/api";

// ─── Mock API Keys ────────────────────────────────────────────────────────────

export const MOCK_API_KEYS: APIKey[] = [
  {
    id: "key_001",
    name: "Production Integration",
    masked_key: "sk_live_••••••••••••••••3f9a",
    environment: "live",
    created_at: "2026-06-12T09:15:00Z",
    last_used_at: "2026-08-08T12:01:44Z",
    scans_this_month: 14892,
    is_active: true,
  },
  {
    id: "key_002",
    name: "Staging Environment",
    masked_key: "sk_live_••••••••••••••••b72c",
    environment: "live",
    created_at: "2026-07-01T14:30:00Z",
    last_used_at: "2026-08-07T18:47:14Z",
    scans_this_month: 1204,
    is_active: true,
  },
  {
    id: "key_003",
    name: "Developer Testing",
    masked_key: "sk_test_••••••••••••••••a41d",
    environment: "sandbox",
    created_at: "2026-07-18T11:00:00Z",
    last_used_at: "2026-08-08T09:54:01Z",
    scans_this_month: 287,
    is_active: true,
  },
  {
    id: "key_004",
    name: "QA Automation",
    masked_key: "sk_test_••••••••••••••••c09e",
    environment: "sandbox",
    created_at: "2026-05-22T08:20:00Z",
    last_used_at: "2026-07-30T16:55:00Z",
    scans_this_month: 0,
    is_active: false,
  },
];

// ─── Mock Webhook Endpoints ───────────────────────────────────────────────────

export const MOCK_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: "wh_001",
    url: "https://platform.acmecorp.com/api/trinetra-webhook",
    status: "active",
    created_at: "2026-06-12T09:30:00Z",
    last_triggered_at: "2026-08-08T11:43:26Z",
    last_http_status: 200,
    total_deliveries: 14892,
    failed_deliveries: 3,
    events: ["analysis.completed", "analysis.flagged"],
  },
  {
    id: "wh_002",
    url: "https://staging.acmecorp.com/api/deepfake-callback",
    status: "failing",
    created_at: "2026-07-01T14:45:00Z",
    last_triggered_at: "2026-08-07T20:04:39Z",
    last_http_status: 503,
    total_deliveries: 1204,
    failed_deliveries: 87,
    events: ["analysis.completed", "analysis.failed", "analysis.flagged"],
  },
  {
    id: "wh_003",
    url: "https://monitor.acmecorp.com/api/alerts",
    status: "disabled",
    created_at: "2026-05-30T10:00:00Z",
    last_triggered_at: null,
    last_http_status: null,
    total_deliveries: 0,
    failed_deliveries: 0,
    events: ["analysis.flagged"],
  },
];

// ─── Mock Webhook Delivery Log ────────────────────────────────────────────────

export const MOCK_WEBHOOK_DELIVERIES: WebhookDelivery[] = [
  {
    id: "del_001",
    webhook_id: "wh_001",
    task_id: "trk_982347110_x",
    delivered_at: "2026-08-08T11:43:27Z",
    http_status: 200,
    duration_ms: 142,
    event: "analysis.flagged",
    success: true,
  },
  {
    id: "del_002",
    webhook_id: "wh_001",
    task_id: "trk_881023441_x",
    delivered_at: "2026-08-08T10:29:34Z",
    http_status: 200,
    duration_ms: 98,
    event: "analysis.flagged",
    success: true,
  },
  {
    id: "del_003",
    webhook_id: "wh_002",
    task_id: "trk_779452332_x",
    delivered_at: "2026-08-08T09:54:20Z",
    http_status: 503,
    duration_ms: 30001,
    event: "analysis.flagged",
    success: false,
  },
  {
    id: "del_004",
    webhook_id: "wh_001",
    task_id: "trk_667834219_x",
    delivered_at: "2026-08-08T09:13:03Z",
    http_status: 200,
    duration_ms: 211,
    event: "analysis.completed",
    success: true,
  },
  {
    id: "del_005",
    webhook_id: "wh_001",
    task_id: "trk_554219887_x",
    delivered_at: "2026-08-08T08:31:25Z",
    http_status: 200,
    duration_ms: 167,
    event: "analysis.completed",
    success: true,
  },
  {
    id: "del_006",
    webhook_id: "wh_001",
    task_id: "trk_443108776_x",
    delivered_at: "2026-08-08T08:01:10Z",
    http_status: 200,
    duration_ms: 133,
    event: "analysis.completed",
    success: true,
  },
];
