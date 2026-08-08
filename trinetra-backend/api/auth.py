"""
api/auth.py
-----------
API key authentication and tier rate-limiting middleware.

Mechanism (Phase 9):
  - Every API key is stored as a document in MongoDB collection `api_keys`.
  - Redis token-bucket counters enforce per-minute and per-month quotas.
  - The `tier` field on the key doc determines which limits apply.
"""

from __future__ import annotations

import hashlib
import os
import secrets
import time
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# ── Tier rate-limit config ────────────────────────────────────────────────────
TIER_LIMITS = {
    "basic": {
        "rpm": 10,          # requests per minute
        "monthly": 1_000,   # scans per month
    },
    "premium": {
        "rpm": 60,
        "monthly": 10_000,
    },
    "enterprise": {
        "rpm": 600,
        "monthly": 1_000_000,  # effectively unlimited
    },
    "test": {
        "rpm": 5,
        "monthly": 100,
    },
}

bearer_scheme = HTTPBearer(auto_error=False)


def _get_redis():
    """Lazy import Redis to avoid hard startup failure if Redis is down."""
    import redis as redis_lib  # type: ignore
    return redis_lib.from_url(
        os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
        decode_responses=True,
    )


def _get_mongo_key_collection():
    """Lazy import MongoDB to avoid hard startup failure."""
    from pymongo import MongoClient  # type: ignore
    client = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017"))
    return client["trinetra"]["api_keys"]


async def require_api_key(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = None,
) -> dict:
    """
    FastAPI dependency.  Call as:
        key_doc = Depends(require_api_key)

    Returns the full MongoDB key document (includes tier, owner, etc.).
    Raises HTTPException on invalid/missing key or rate-limit breach.
    """
    # Pull token from header
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Expected: Bearer <API_KEY>",
        )
    raw_key = auth_header[len("Bearer "):]

    # Look up in MongoDB
    try:
        col = _get_mongo_key_collection()
        key_doc = col.find_one({"key_hash": _hash_key(raw_key)})
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Auth database unavailable: {exc}",
        )

    if not key_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key.",
        )

    if key_doc.get("revoked"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API key has been revoked.",
        )

    # Rate limiting (Redis token bucket — per minute)
    tier = key_doc.get("tier", "basic")
    limits = TIER_LIMITS.get(tier, TIER_LIMITS["basic"])
    owner = key_doc.get("owner_id", key_doc["_id"])

    try:
        r = _get_redis()
        rpm_key = f"rpm:{owner}:{int(time.time() // 60)}"
        pipe = r.pipeline()
        pipe.incr(rpm_key)
        pipe.expire(rpm_key, 60)
        count, _ = pipe.execute()

        if count > limits["rpm"]:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {limits['rpm']} requests/minute for tier '{tier}'.",
                headers={"Retry-After": "60"},
            )

        # Monthly quota check
        month_key = f"monthly:{owner}:{datetime.now(timezone.utc).strftime('%Y-%m')}"
        monthly_count = int(r.get(month_key) or 0)
        if monthly_count >= limits["monthly"]:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Monthly scan quota ({limits['monthly']}) exceeded for tier '{tier}'.",
            )
    except HTTPException:
        raise
    except Exception:
        # If Redis is down, degrade gracefully — don't block the request
        pass

    return key_doc


def _hash_key(raw_key: str) -> str:
    """SHA-256 of the raw API key for safe storage."""
    return hashlib.sha256(raw_key.encode()).hexdigest()


def generate_api_key(key_type: str = "live") -> str:
    """Generate a new cryptographic API key."""
    prefix = "sk_live_" if key_type == "live" else "sk_test_"
    return prefix + secrets.token_urlsafe(32)
