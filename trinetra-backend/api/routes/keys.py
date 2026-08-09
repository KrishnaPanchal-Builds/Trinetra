"""
api/routes/keys.py
------------------
POST /api/v1/keys         → generate a new API key
POST /api/v1/webhook-url  → register/update the client's webhook callback URL
"""

from __future__ import annotations

import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from api.auth import generate_api_key, _hash_key, require_api_key
from api.models import (
    KeyCreateRequest,
    KeyCreateResponse,
    WebhookRegisterRequest,
    WebhookRegisterResponse,
)

router = APIRouter()


def _get_mongo_keys():
    from pymongo import MongoClient  # type: ignore
    client = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017"))
    return client["trinetra"]["api_keys"]


@router.post(
    "/keys",
    response_model=KeyCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a new API key",
    description=(
        "Creates a new Test_Key or Live_Key for the authenticated account.  "
        "The raw key is returned only once - store it immediately."
    ),
)
async def create_key(
    body: KeyCreateRequest,
    key_doc: dict = Depends(require_api_key),
) -> KeyCreateResponse:
    raw_key = generate_api_key(body.key_type)
    key_hash = _hash_key(raw_key)
    tier = key_doc.get("tier", "basic")
    now = datetime.now(timezone.utc)

    col = _get_mongo_keys()
    col.insert_one({
        "key_hash": key_hash,
        "key_type": body.key_type,
        "label": body.label,
        "tier": tier,
        "owner_id": key_doc.get("owner_id"),
        "revoked": False,
        "created_at": now,
        "webhook_url": key_doc.get("webhook_url", ""),
    })

    return KeyCreateResponse(
        api_key=raw_key,
        key_type=body.key_type,
        tier=tier,
        created_at=now,
    )


@router.post(
    "/webhook-url",
    response_model=WebhookRegisterResponse,
    summary="Register or update webhook callback URL",
    description=(
        "Sets the URL TRINETRA will POST the final scan result to once analysis "
        "completes.  Each API key can have exactly one registered webhook URL."
    ),
)
async def register_webhook(
    body: WebhookRegisterRequest,
    key_doc: dict = Depends(require_api_key),
) -> WebhookRegisterResponse:
    if not body.url.startswith("https://"):
        raise HTTPException(
            status_code=400,
            detail="Webhook URL must use HTTPS.",
        )

    col = _get_mongo_keys()
    now = datetime.now(timezone.utc)
    col.update_one(
        {"key_hash": key_doc["key_hash"]},
        {"$set": {"webhook_url": body.url, "webhook_updated_at": now}},
    )

    return WebhookRegisterResponse(registered_url=body.url, updated_at=now)

