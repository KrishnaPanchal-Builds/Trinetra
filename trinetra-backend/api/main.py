"""
api/main.py
-----------
TRINETRA FastAPI Gateway — primary entry point.

All routes are prefixed /api/v1 per the Section 8 contract.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import JSONResponse

from api.routes import scan, task, history, keys, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: nothing heavy to do here — Celery workers initialise separately
    yield
    # Shutdown: nothing to clean up


def create_app() -> FastAPI:
    app = FastAPI(
        title="TRINETRA — Multimodal Deepfake Detection API",
        version="1.0.0",
        description=(
            "Enterprise-grade, asynchronous B2B deepfake triage API.\n\n"
            "Analyzes audio, video, and static image content through six "
            "independent forensic models and returns an Authenticity Evidence "
            "Score (AES) with a statistically grounded confidence bound.\n\n"
            "**Base URL:** `https://api.trinetra.ai`\n\n"
            "**Auth:** `Authorization: Bearer <API_KEY>` on every request except `/api/v1/system-health`."
        ),
        terms_of_service="https://trinetra.ai/terms",
        contact={"name": "TRINETRA Engineering", "email": "api@trinetra.ai"},
        license_info={"name": "Proprietary", "url": "https://trinetra.ai/license"},
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ── CORS ─────────────────────────────────────────────────────────────────
    # Permits the frontend sandbox to call the API from the browser.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Tighten to specific origins in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(scan.router,    prefix="/api/v1", tags=["Scanning"])
    app.include_router(task.router,    prefix="/api/v1", tags=["Tasks"])
    app.include_router(history.router, prefix="/api/v1", tags=["History"])
    app.include_router(keys.router,    prefix="/api/v1", tags=["Key Management"])
    app.include_router(health.router,  prefix="/api/v1", tags=["System Health"])

    # ── Root redirect ─────────────────────────────────────────────────────────
    @app.get("/", include_in_schema=False)
    async def root():
        return JSONResponse({"message": "TRINETRA API — see /docs for the OpenAPI spec."})

    return app


app = create_app()
