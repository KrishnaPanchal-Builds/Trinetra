"""
celery_worker/tasks.py
-----------------------
Core Celery task: run_analysis

Full pipeline for a single scan job:
  1.  C2PA fast-fail (Phase 4)
  2.  Modality detection + health-check gate (Phase 3)
  3.  Parallel model inference across relevant containers
  4.  Fusion layer → AES score (Phase 5)
  5.  PDF report generation (Phase 7)
  6.  MongoDB persistence + webhook delivery (Phase 6/7)
"""

from __future__ import annotations

import asyncio
import json
import mimetypes
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded
from pymongo import MongoClient  # type: ignore

from celery_worker.app import celery_app
from fusion.combiner import FusionCombiner
from provenance.c2pa_check import check_c2pa_manifest
from reports.pdf_generator import generate_pdf_report


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _get_mongo():
    client = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017"))
    return client["trinetra"]


def _load_registry() -> list:
    registry_path = Path(__file__).resolve().parents[1] / "config" / "model_registry.json"
    with open(registry_path) as f:
        return json.load(f)["models"]


def _detect_modality(content_type: str) -> str:
    ct = content_type.lower()
    if ct.startswith("image/"):
        return "image"
    if ct.startswith("audio/"):
        return "audio"
    if ct.startswith("video/"):
        return "video"
    return "unknown"


def _risk_label(aes: int) -> str:
    if aes >= 85:
        return "CONFIRMED_SYNTHETIC"
    if aes >= 60:
        return "HIGH_RISK"
    if aes >= 35:
        return "MEDIUM_RISK"
    return "LOW_RISK"


def _action_from_risk(risk: str) -> str:
    return {
        "CONFIRMED_SYNTHETIC": "AUTO_TAKEDOWN",
        "HIGH_RISK":           "AUTO_HOLD_FOR_HUMAN_TRIAGE",
        "MEDIUM_RISK":         "REVIEW_RECOMMENDED",
        "LOW_RISK":            "AUTHENTIC",
    }.get(risk, "REVIEW_RECOMMENDED")


# ─────────────────────────────────────────────────────────────────────────────
# Model call helpers (sync wrappers around async HTTP)
# ─────────────────────────────────────────────────────────────────────────────

async def _check_health(session: httpx.AsyncClient, model: dict) -> bool:
    url = f"{model['container_url']}:{model['port']}{model['health_endpoint']}"
    try:
        resp = await session.get(url, timeout=5.0)
        return resp.status_code == 200 and resp.json().get("status") == "ok"
    except Exception:
        return False


async def _call_predict(
    session: httpx.AsyncClient,
    model: dict,
    file_bytes: bytes,
    filename: str = "media.bin",
) -> Optional[Dict[str, Any]]:
    url = f"{model['container_url']}:{model['port']}{model['predict_endpoint']}"
    try:
        resp = await session.post(
            url,
            files={"file": (filename, file_bytes)},
            timeout=60.0,
        )
        if resp.status_code == 200:
            data = resp.json()
            return {
                "probability": float(data.get("probability", 0.5)),
                "class": data.get("model_class", "authentic"),
            }
    except Exception as exc:
        print(f"[Worker] Model {model['name']} predict failed: {exc}")
    return None


async def _run_parallel_inference(
    file_bytes: bytes,
    filename: str,
    modality: str,
    registry: list,
) -> Dict[str, Optional[Dict[str, Any]]]:
    """Run all healthy model containers for the detected modality in parallel."""
    eligible = [m for m in registry if m["enabled"] and m["modality"] == modality]
    results: Dict[str, Optional[Dict[str, Any]]] = {}

    async with httpx.AsyncClient() as session:
        # Health check all eligible containers first
        health_checks = await asyncio.gather(*[_check_health(session, m) for m in eligible])
        healthy = [m for m, ok in zip(eligible, health_checks) if ok]

        if not healthy:
            print(f"[Worker] No healthy {modality} containers available.")
            return {}

        # Parallel predict calls
        predictions = await asyncio.gather(
            *[_call_predict(session, m, file_bytes, filename) for m in healthy],
            return_exceptions=True,
        )
        for model, pred in zip(healthy, predictions):
            if isinstance(pred, dict):
                results[model["name"]] = pred
            else:
                results[model["name"]] = None

    return results


# ─────────────────────────────────────────────────────────────────────────────
# Webhook delivery
# ─────────────────────────────────────────────────────────────────────────────

async def _fire_webhook(webhook_url: str, payload: dict) -> None:
    if not webhook_url:
        return
    try:
        async with httpx.AsyncClient() as session:
            await session.post(webhook_url, json=payload, timeout=15.0)
    except Exception as exc:
        print(f"[Worker] Webhook delivery failed to {webhook_url}: {exc}")


# ─────────────────────────────────────────────────────────────────────────────
# Main Celery task
# ─────────────────────────────────────────────────────────────────────────────

@celery_app.task(
    bind=True,
    name="trinetra.run_analysis",
    max_retries=2,
    default_retry_delay=10,
    acks_late=True,
)
def run_analysis(
    self,
    task_id: str,
    file_path: str,
    content_type: str,
    uploader_declaration: str,
    owner_id: str = "",
    tier: str = "basic",
    webhook_url: str = "",
) -> dict:
    """
    Full TRINETRA analysis pipeline for a single media file.
    """
    db = _get_mongo()
    scans_col = db["scans"]
    registry = _load_registry()

    # Mark as processing
    scans_col.update_one(
        {"task_id": task_id},
        {"$set": {"status": "processing", "owner_id": owner_id, "tier": tier,
                  "created_at": datetime.now(timezone.utc)}},
        upsert=True,
    )

    start_time = time.time()
    try:
        file_bytes = Path(file_path).read_bytes()
        filename   = Path(file_path).name

        # ── Phase 4: C2PA Fast-Fail ────────────────────────────────────────────
        c2pa_result = check_c2pa_manifest(file_bytes)
        c2pa_present = c2pa_result["present"]

        if c2pa_present:
            # Short-circuit: AI-generated manifest detected
            result = _build_result(
                task_id=task_id,
                aes=99,
                risk="CONFIRMED_SYNTHETIC",
                primary_anomaly="C2PA_MANIFEST_DETECTED",
                modalities_scanned=[_detect_modality(content_type)],
                model_results={},
                fusion_method="voting",
                c2pa_present=True,
                uploader_mismatch=False,
                weight_versions={},
                pdf_url=None,
                tier=tier,
            )
            _persist_and_notify(scans_col, task_id, result, webhook_url)
            _cleanup(file_path)
            return result

        # ── Phase 3: Modality Detection + Parallel Inference ───────────────────
        modality = _detect_modality(content_type)
        if modality == "unknown":
            # Try to infer from bytes
            modality = "image"  # safe default for binary blobs

        # Run model inference
        model_results = asyncio.run(
            _run_parallel_inference(file_bytes, filename, modality, registry)
        )

        # Collect weight versions from health responses (cached in registry for now)
        weight_versions = {
            name: f"v1.0.0-{result['probability']:.2f}"[:16]  # placeholder hash
            for name, result in model_results.items()
            if result is not None
        }

        modalities_scanned = [modality] if model_results else []

        # ── Phase 5: Fusion Layer ──────────────────────────────────────────────
        combiner = FusionCombiner(tier=tier)
        aes, confidence, fusion_method, primary_anomaly = combiner.fuse(
            model_results=model_results,
            c2pa_present=c2pa_present,
            uploader_declaration=uploader_declaration,
        )

        uploader_mismatch = (
            bool(uploader_declaration)
            and uploader_declaration.lower() in ("original footage", "authentic", "real")
            and aes > 60
        )

        risk = _risk_label(aes)

        # ── Phase 7: PDF Report ───────────────────────────────────────────────
        pdf_url = None
        try:
            pdf_path = generate_pdf_report(
                task_id=task_id,
                aes=aes,
                risk=risk,
                confidence=confidence,
                modalities_scanned=modalities_scanned,
                model_results=model_results,
                weight_versions=weight_versions,
                primary_anomaly=primary_anomaly,
                uploader_declaration=uploader_declaration,
            )
            base_url = os.environ.get("API_BASE_URL", "https://api.trinetra.ai")
            pdf_url = f"{base_url}/reports/{task_id}.pdf"
        except Exception as pdf_err:
            print(f"[Worker] PDF generation failed: {pdf_err}")

        # ── Build final result dict ────────────────────────────────────────────
        result = _build_result(
            task_id=task_id,
            aes=aes,
            risk=risk,
            primary_anomaly=primary_anomaly,
            modalities_scanned=modalities_scanned,
            model_results=model_results,
            fusion_method=fusion_method,
            c2pa_present=c2pa_present,
            uploader_mismatch=uploader_mismatch,
            weight_versions=weight_versions,
            pdf_url=pdf_url,
            tier=tier,
            confidence=confidence,
        )

        _persist_and_notify(scans_col, task_id, result, webhook_url)
        _cleanup(file_path)

        elapsed = time.time() - start_time
        print(f"[Worker] {task_id} completed in {elapsed:.2f}s - AES={aes}, risk={risk}")
        return result

    except SoftTimeLimitExceeded:
        _fail_task(scans_col, task_id, "Task timed out (soft limit).")
        raise
    except Exception as exc:
        _fail_task(scans_col, task_id, str(exc))
        try:
            self.retry(exc=exc)
        except Exception:
            pass
        raise


def _build_result(
    task_id, aes, risk, primary_anomaly, modalities_scanned, model_results,
    fusion_method, c2pa_present, uploader_mismatch, weight_versions, pdf_url, tier,
    confidence="MEDIUM",
) -> dict:
    """Construct the canonical result dict matching the Section 8 contract."""
    # Tier filtering: basic tier gets AES + risk only (per Phase 9 spec)
    if tier == "basic":
        result_model_results = {}
        result_weight_versions = {}
    elif tier == "premium":
        result_model_results = {
            name: res for name, res in model_results.items() if res is not None
        }
        result_weight_versions = {}
    else:  # enterprise
        result_model_results = {
            name: res for name, res in model_results.items() if res is not None
        }
        result_weight_versions = weight_versions

    return {
        "task_id": task_id,
        "authenticity_evidence_score": aes,
        "risk_level": risk,
        "confidence_interval": confidence,
        "primary_anomaly": primary_anomaly,
        "anomaly_timestamps": [],  # populated by temporal analysis in future phases
        "modalities_scanned": modalities_scanned,
        "model_results": result_model_results,
        "fusion_method_used": fusion_method,
        "model_weight_versions": result_weight_versions,
        "c2pa_manifest_present": c2pa_present,
        "uploader_declaration_mismatch": uploader_mismatch,
        "action_recommendation": _action_from_risk(risk),
        "audit_pdf_report_url": pdf_url,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def _persist_and_notify(scans_col, task_id: str, result: dict, webhook_url: str) -> None:
    scans_col.update_one(
        {"task_id": task_id},
        {"$set": {"status": "complete", "result": result}},
        upsert=True,
    )
    if webhook_url:
        asyncio.run(_fire_webhook(webhook_url, result))


def _fail_task(scans_col, task_id: str, error: str) -> None:
    scans_col.update_one(
        {"task_id": task_id},
        {"$set": {"status": "failed", "error": error}},
        upsert=True,
    )


def _cleanup(file_path: str) -> None:
    """Delete the raw media file immediately after analysis (DPDP compliance)."""
    try:
        Path(file_path).unlink(missing_ok=True)
    except Exception:
        pass

