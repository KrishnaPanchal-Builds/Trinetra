"""
api/routes/health.py
--------------------
GET /api/v1/system-health

Returns the health of the gateway and all model containers.
Backs any status widget the frontend wants to show.
"""

from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from typing import Dict, Literal

import httpx
from fastapi import APIRouter

from api.models import SystemHealthResponse

router = APIRouter()


def _load_registry() -> list:
    registry_path = Path(__file__).resolve().parents[2] / "config" / "model_registry.json"
    with open(registry_path) as f:
        return json.load(f)["models"]


async def _check_model(
    session: httpx.AsyncClient,
    model: dict,
) -> tuple[str, Literal["ok", "degraded", "error", "unknown"]]:
    url = f"{model['container_url']}:{model['port']}{model['health_endpoint']}"
    try:
        resp = await session.get(url, timeout=5.0)
        if resp.status_code == 200 and resp.json().get("status") == "ok":
            return model["name"], "ok"
        return model["name"], "degraded"
    except Exception:
        return model["name"], "error"


@router.get(
    "/system-health",
    response_model=SystemHealthResponse,
    summary="System and model container health",
    description=(
        "Polls the `/health` endpoint of every registered model container "
        "and returns a status map.  No authentication required."
    ),
)
async def system_health() -> SystemHealthResponse:
    registry = _load_registry()
    enabled_models = [m for m in registry if m.get("enabled")]

    async with httpx.AsyncClient() as session:
        checks = await asyncio.gather(
            *[_check_model(session, m) for m in enabled_models],
            return_exceptions=True,
        )

    model_statuses: Dict[str, str] = {}
    for item in checks:
        if isinstance(item, tuple):
            name, state = item
            model_statuses[name] = state
        # Exceptions are silently mapped to "unknown"

    # Mark any registered model not checked as unknown
    for m in enabled_models:
        if m["name"] not in model_statuses:
            model_statuses[m["name"]] = "unknown"

    gateway_status: Literal["ok", "degraded", "error"] = "ok"
    if any(v == "error" for v in model_statuses.values()):
        gateway_status = "degraded"

    return SystemHealthResponse(gateway=gateway_status, models=model_statuses)
