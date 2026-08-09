"""
scripts/seed_keys.py
--------------------
Seeds MongoDB with test API keys for all three tiers (Phase 12 handoff).

Run ONCE after MongoDB is up:
    python scripts/seed_keys.py

Output: prints the raw API keys to stdout - save them immediately.
"""

from __future__ import annotations

import os
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from api.auth import generate_api_key, _hash_key

from pymongo import MongoClient  # type: ignore

MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")


def seed():
    client = MongoClient(MONGODB_URI)
    col = client["trinetra"]["api_keys"]

    tiers = ["basic", "premium", "enterprise"]
    print("\n" + "="*60)
    print("TRINETRA - Seeding test API keys")
    print("="*60 + "\n")

    for tier in tiers:
        key_type = "test"
        raw_key = generate_api_key(key_type)
        key_hash = _hash_key(raw_key)

        doc = {
            "key_hash": key_hash,
            "key_type": key_type,
            "label": f"Seeded {tier.capitalize()} Test Key",
            "tier": tier,
            "owner_id": f"seed-owner-{tier}",
            "revoked": False,
            "created_at": datetime.now(timezone.utc),
            "webhook_url": "",
        }
        col.update_one({"label": doc["label"]}, {"$set": doc}, upsert=True)

        print(f"  Tier: {tier:<12}  Key: {raw_key}")

    print("\n" + "="*60)
    print("Keys seeded. Store these securely -- they will not be shown again.")
    print("="*60 + "\n")


if __name__ == "__main__":
    seed()

