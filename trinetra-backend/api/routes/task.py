"""
api/routes/task.py
------------------
GET /api/v1/task/{task_id}

Polls the status of an analysis job.  Used by the Sandbox UI to show
a loading → result transition without waiting for a webhook.
"""

from __future__ import annotations

import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from api.auth import require_api_key
from api.models import ScanResult, TaskStatusResponse

router = APIRouter()


def _get_mongo_scans():
    from pymongo import MongoClient  # type: ignore
    client = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017"))
    return client["trinetra"]["scans"]


@router.get(
    "/task/{task_id}",
    response_model=TaskStatusResponse,
    summary="Poll analysis task status",
    description=(
        "Returns the current status of an analysis job.  "
        "When `status` is `complete`, the `result` field contains the full "
        "scan result in the same shape as the webhook payload."
    ),
    responses={
        200: {"description": "Task status returned"},
        401: {"description": "Invalid API key"},
        404: {"description": "Task not found"},
    },
)
async def get_task(
    task_id: str,
    key_doc: dict = Depends(require_api_key),
) -> TaskStatusResponse:
    col = _get_mongo_scans()
    doc = col.find_one({"task_id": task_id, "owner_id": str(key_doc.get("owner_id", ""))})

    if not doc:
        # Also check Celery task state (may not be in Mongo yet if still running)
        celery_status = _check_celery_state(task_id)
        if celery_status in ("PENDING", "STARTED"):
            return TaskStatusResponse(
                task_id=task_id,
                status="queued" if celery_status == "PENDING" else "processing",
            )
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found.")

    status_map = {
        "queued":     "queued",
        "processing": "processing",
        "complete":   "complete",
        "failed":     "failed",
    }
    task_status = status_map.get(doc.get("status", "queued"), "queued")

    result: Optional[ScanResult] = None
    if task_status == "complete" and "result" in doc:
        result = ScanResult(**doc["result"])

    return TaskStatusResponse(
        task_id=task_id,
        status=task_status,
        result=result,
        error=doc.get("error"),
    )


def _check_celery_state(task_id: str) -> str:
    try:
        from celery_worker.app import celery_app  # type: ignore
        result = celery_app.AsyncResult(task_id)
        return result.state
    except Exception:
        return "UNKNOWN"
