"""
api/routes/scan.py
------------------
POST /api/v1/scan-media

Validates the API key, saves the file to temp storage, pushes a Celery job
to Redis, and immediately returns 202 Accepted + task_id.

The actual analysis happens in celery_worker/tasks.py.
"""

from __future__ import annotations

import os
import tempfile
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from api.auth import require_api_key
from api.models import ScanSubmitResponse

router = APIRouter()

# Max upload size: 500 MB (enforced in gateway / nginx; Celery does the heavy lifting)
MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024

ALLOWED_MIME_TYPES = {
    # Images
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp",
    # Audio
    "audio/wav", "audio/mpeg", "audio/flac", "audio/ogg", "audio/mp4",
    # Video
    "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo",
}


@router.post(
    "/scan-media",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=ScanSubmitResponse,
    summary="Submit media for deepfake analysis",
    description=(
        "Accepts a media file (image, audio, or video) and an optional "
        "uploader declaration string.  Returns immediately with a `task_id`; "
        "the result is delivered asynchronously via webhook once analysis "
        "completes (typically within 5–18 seconds depending on modality)."
    ),
    responses={
        202: {"description": "Job queued successfully"},
        400: {"description": "Invalid file type or empty file"},
        401: {"description": "Missing or invalid API key"},
        413: {"description": "File exceeds 500 MB limit"},
        429: {"description": "Rate limit exceeded"},
    },
)
async def scan_media(
    file: UploadFile = File(..., description="The media file to analyze (image/audio/video)."),
    uploader_declaration: str = Form(
        default="",
        description="Free-text declaration from the content uploader (e.g. 'Original Footage').",
    ),
    key_doc: dict = Depends(require_api_key),
) -> ScanSubmitResponse:
    # ── Validate MIME type ────────────────────────────────────────────────────
    content_type = file.content_type or ""
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: '{content_type}'. "
                   f"Accepted types: {sorted(ALLOWED_MIME_TYPES)}",
        )

    # ── Read & size-check ─────────────────────────────────────────────────────
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the 500 MB limit ({len(file_bytes):,} bytes received).",
        )

    # ── Generate task_id ──────────────────────────────────────────────────────
    task_id = "trk_" + uuid.uuid4().hex

    # ── Persist to temp storage ───────────────────────────────────────────────
    # In production this would be S3/GCS.  In single-node mode, write to /tmp.
    tmp_dir = Path(os.environ.get("TMP_MEDIA_DIR", "/tmp/trinetra"))
    tmp_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename or "upload").suffix or ".bin"
    tmp_path = tmp_dir / f"{task_id}{ext}"
    tmp_path.write_bytes(file_bytes)

    # ── Enqueue Celery task ────────────────────────────────────────────────────
    try:
        from celery_worker.tasks import run_analysis  # lazy import
        run_analysis.apply_async(
            args=[task_id, str(tmp_path), content_type, uploader_declaration],
            kwargs={"owner_id": str(key_doc.get("owner_id", "")),
                    "tier": key_doc.get("tier", "basic"),
                    "webhook_url": key_doc.get("webhook_url", "")},
            queue=_queue_for_tier(key_doc.get("tier", "basic")),
            task_id=task_id,
        )
    except Exception as exc:
        # If Celery/Redis is unreachable, return a helpful error
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Task queue unavailable: {exc}. Please retry in a moment.",
        )

    return ScanSubmitResponse(task_id=task_id, status="queued")


def _queue_for_tier(tier: str) -> str:
    """Map subscription tier to Celery queue name."""
    return {
        "enterprise": "enterprise",
        "premium":    "premium",
        "basic":      "basic",
        "test":       "basic",
    }.get(tier, "basic")
