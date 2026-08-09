"""
api/models.py
-------------
Pydantic data models for the TRINETRA API contract (Section 8).

These schemas define the exact shape of every request and response body.
The frontend team builds against these schemas - do not rename or restructure
fields without coordinating with them first.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# Shared primitives
# ─────────────────────────────────────────────────────────────────────────────

class AnomalyTimestamp(BaseModel):
    start: str = Field(example="00:31")
    end: str   = Field(example="00:39")


class ModelResult(BaseModel):
    probability: float = Field(ge=0.0, le=1.0, example=0.94)
    model_class: str   = Field(alias="class", example="synthetic")

    model_config = {"populate_by_name": True}


# ─────────────────────────────────────────────────────────────────────────────
# Webhook payload / result schema (the canonical output shape)
# ─────────────────────────────────────────────────────────────────────────────

class ScanResult(BaseModel):
    """
    The full result payload.  Returned both:
    - As the `result` field in GET /api/v1/task/{task_id} (when status=complete)
    - As the webhook POST body fired to the client's registered URL
    - As each item in GET /api/v1/history
    """
    task_id: str = Field(example="trk_982347110_x")
    authenticity_evidence_score: int = Field(ge=0, le=100, example=31)
    risk_level: Literal["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK", "CONFIRMED_SYNTHETIC"] = Field(
        example="HIGH_RISK"
    )
    confidence_interval: Literal["HIGH", "MEDIUM", "LOW"] = Field(example="HIGH")
    primary_anomaly: str = Field(
        example="SYNTHETIC_AUDIO_DUBBING",
        description=(
            "One of: NONE, SYNTHETIC_AUDIO_DUBBING, FACE_SWAP, "
            "AI_GENERATED_IMAGE, C2PA_MANIFEST_DETECTED, MULTI_MODAL_ANOMALY"
        ),
    )
    anomaly_timestamps: List[AnomalyTimestamp] = Field(
        default_factory=list,
        example=[{"start": "00:31", "end": "00:39"}],
    )
    modalities_scanned: List[str] = Field(
        example=["audio", "video"],
        description="Which modalities were actually evaluated."
    )
    model_results: Dict[str, Any] = Field(
        example={
            "aasist":   {"probability": 0.94, "class": "synthetic"},
            "rawnet2":  {"probability": 0.88, "class": "synthetic"},
            "ftcn":     {"probability": 0.12, "class": "authentic"},
            "sbi":      {"probability": 0.09, "class": "authentic"},
        }
    )
    fusion_method_used: Literal["stacking", "averaging", "voting"] = Field(
        example="stacking"
    )
    model_weight_versions: Dict[str, str] = Field(
        default_factory=dict,
        example={"aasist": "v3.2.1-a9f31c", "rawnet2": "v2.0.0-77e21b"},
    )
    c2pa_manifest_present: bool = Field(example=False)
    uploader_declaration_mismatch: bool = Field(example=True)
    action_recommendation: Literal[
        "AUTHENTIC",
        "REVIEW_RECOMMENDED",
        "AUTO_HOLD_FOR_HUMAN_TRIAGE",
        "AUTO_TAKEDOWN",
    ] = Field(example="AUTO_HOLD_FOR_HUMAN_TRIAGE")
    audit_pdf_report_url: Optional[str] = Field(
        default=None, example="https://api.trinetra.ai/reports/trk_982347110_x.pdf"
    )
    created_at: Optional[datetime] = None


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/v1/scan-media - response
# ─────────────────────────────────────────────────────────────────────────────

class ScanSubmitResponse(BaseModel):
    task_id: str  = Field(example="trk_982347110_x")
    status: str   = Field(example="queued")


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/task/{task_id} - response
# ─────────────────────────────────────────────────────────────────────────────

class TaskStatusResponse(BaseModel):
    task_id: str
    status: Literal["queued", "processing", "complete", "failed"]
    result: Optional[ScanResult] = None
    error: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/history - response
# ─────────────────────────────────────────────────────────────────────────────

class HistoryResponse(BaseModel):
    results: List[ScanResult]
    total: int


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/system-health - response
# ─────────────────────────────────────────────────────────────────────────────

class SystemHealthResponse(BaseModel):
    gateway: Literal["ok", "degraded", "error"]
    models: Dict[str, Literal["ok", "degraded", "error", "unknown"]]


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/v1/keys - request + response
# ─────────────────────────────────────────────────────────────────────────────

class KeyCreateRequest(BaseModel):
    key_type: Literal["test", "live"] = Field(example="live")
    label: Optional[str] = Field(default=None, example="Production Key 1")


class KeyCreateResponse(BaseModel):
    api_key: str      = Field(example="sk_live_982347...")
    key_type: str     = Field(example="live")
    tier: str         = Field(example="premium")
    created_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/v1/webhook-url - request + response
# ─────────────────────────────────────────────────────────────────────────────

class WebhookRegisterRequest(BaseModel):
    url: str = Field(example="https://client-platform.com/api/deepfake-webhook")


class WebhookRegisterResponse(BaseModel):
    registered_url: str
    updated_at: datetime

