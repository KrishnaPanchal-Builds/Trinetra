// ─── API Keys ─────────────────────────────────────────────────────────────────

export type APIKeyEnvironment = "live" | "sandbox";

export interface APIKey {
  id: string;
  name: string;
  /** Partially masked key for display — only last 4 chars visible */
  masked_key: string;
  environment: APIKeyEnvironment;
  created_at: string;       // ISO 8601
  last_used_at: string | null;
  scans_this_month: number;
  is_active: boolean;
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export type WebhookStatus = "active" | "failing" | "disabled";

export interface WebhookEndpoint {
  id: string;
  url: string;
  status: WebhookStatus;
  created_at: string;
  last_triggered_at: string | null;
  last_http_status: number | null;
  total_deliveries: number;
  failed_deliveries: number;
  /** Events this webhook subscribes to */
  events: Array<"analysis.completed" | "analysis.failed" | "analysis.flagged">;
}

// ─── Webhook Delivery Log ─────────────────────────────────────────────────────

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  task_id: string;
  delivered_at: string;
  http_status: number;
  duration_ms: number;
  event: string;
  success: boolean;
}
