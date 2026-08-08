"""
scripts/health_check.py
-----------------------
Phase 11 validation script.

Polls every model container's GET /health endpoint and reports status.
Run this before treating the build as handoff-ready.

Usage:
    python scripts/health_check.py

Exit code:
    0 — all containers healthy
    1 — one or more containers unreachable or unhealthy
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

import httpx


def _load_registry() -> list:
    registry_path = Path(__file__).resolve().parents[1] / "config" / "model_registry.json"
    with open(registry_path) as f:
        return json.load(f)["models"]


async def _check(session: httpx.AsyncClient, model: dict) -> tuple[str, bool, str]:
    url = f"{model['container_url']}:{model['port']}{model['health_endpoint']}"
    try:
        resp = await session.get(url, timeout=5.0)
        ok = resp.status_code == 200 and resp.json().get("status") == "ok"
        detail = f"version={resp.json().get('weight_version', '?')}" if ok else f"HTTP {resp.status_code}"
        return model["name"], ok, detail
    except Exception as exc:
        return model["name"], False, str(exc)


async def main() -> int:
    registry = _load_registry()
    enabled = [m for m in registry if m.get("enabled")]

    print(f"\n{'='*60}")
    print("TRINETRA — Model Container Health Check")
    print(f"{'='*60}\n")
    print(f"Checking {len(enabled)} model container(s)...\n")

    async with httpx.AsyncClient() as session:
        results = await asyncio.gather(*[_check(session, m) for m in enabled])

    all_ok = True
    for name, ok, detail in results:
        status = "✅ OK" if ok else "❌ FAIL"
        print(f"  [{status}] {name:<25}  {detail}")
        if not ok:
            all_ok = False

    print(f"\n{'='*60}")
    if all_ok:
        print("✅  All containers healthy — build is handoff-ready.")
    else:
        print("❌  One or more containers are unhealthy. Review logs before handoff.")
    print(f"{'='*60}\n")

    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
