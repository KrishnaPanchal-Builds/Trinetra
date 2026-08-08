"""
api/routes/history.py
---------------------
GET /api/v1/history?limit=50&offset=0

Returns paginated scan history for the authenticated API key owner.
Backs the Triage Dashboard.
"""

from __future__ import annotations

import os
from typing import List

from fastapi import APIRouter, Depends, Query

from api.auth import require_api_key
from api.models import HistoryResponse, ScanResult

router = APIRouter()


def _get_mongo_scans():
    from pymongo import MongoClient  # type: ignore
    client = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017"))
    return client["trinetra"]["scans"]


@router.get(
    "/history",
    response_model=HistoryResponse,
    summary="Retrieve scan history",
    description=(
        "Returns paginated scan history for the authenticated client.  "
        "Each item has the same shape as the webhook payload.  "
        "Retention period depends on subscription tier (7–30 days basic, "
        "90 days premium, custom enterprise)."
    ),
)
async def get_history(
    limit: int = Query(default=50, ge=1, le=500, description="Max records to return."),
    offset: int = Query(default=0, ge=0, description="Pagination offset."),
    key_doc: dict = Depends(require_api_key),
) -> HistoryResponse:
    col = _get_mongo_scans()
    owner_id = str(key_doc.get("owner_id", ""))
    tier = key_doc.get("tier", "basic")

    # Retention filter
    from datetime import datetime, timedelta, timezone
    retention_days = {"basic": 30, "premium": 90, "enterprise": 36500}.get(tier, 30)
    cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)

    query = {
        "owner_id": owner_id,
        "status": "complete",
        "created_at": {"$gte": cutoff},
    }

    total = col.count_documents(query)
    docs = list(
        col.find(query, {"_id": 0})
           .sort("created_at", -1)
           .skip(offset)
           .limit(limit)
    )

    results: List[ScanResult] = []
    for doc in docs:
        result_data = doc.get("result", doc)
        try:
            results.append(ScanResult(**result_data))
        except Exception:
            continue  # Skip malformed historical documents

    return HistoryResponse(results=results, total=total)
