"""
sdk/base_wrapper.py
-------------------
Shared contract every TRINETRA model wrapper must satisfy.

Each model container runs a standalone FastAPI app.  The app must expose:
  GET /health  →  HealthResponse
  POST /predict → PredictResponse

Subclasses only need to override `_load_model()` and `_run_inference()`.
"""

from __future__ import annotations

import abc
import hashlib
import os
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Response schemas (canonical - matches Section 8 of the implementation plan)
# ---------------------------------------------------------------------------


class HealthResponse(BaseModel):
    status: Literal["ok", "error"]
    model: str
    weight_version: str  # SHA-256 hex of the weight file


class PredictResponse(BaseModel):
    probability: float  # 0.0 → 1.0  (higher = more likely synthetic)
    model_class: Literal["authentic", "synthetic"]  # renamed to avoid Python keyword


# ---------------------------------------------------------------------------
# Base wrapper
# ---------------------------------------------------------------------------


class BaseModelWrapper(abc.ABC):
    """
    Abstract base for every TRINETRA model microservice.

    Concrete subclass must set:
        MODEL_NAME   : str   – e.g. "npr"
        WEIGHTS_PATH : Path  – path to the weights file inside the container
    """

    MODEL_NAME: str = "base"
    WEIGHTS_PATH: Path = Path("weights/model.pth")

    def __init__(self) -> None:
        self._model = None
        self._weight_version: str = self._compute_weight_hash()
        self._load_model()

    # ------------------------------------------------------------------
    # Abstract interface
    # ------------------------------------------------------------------

    @abc.abstractmethod
    def _load_model(self) -> None:
        """Load weights into self._model.  Called once at startup."""

    @abc.abstractmethod
    def _run_inference(self, file_bytes: bytes) -> float:
        """
        Run inference on raw file bytes.

        Returns:
            probability: float in [0, 1]  (1 = definitely synthetic)
        """

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _compute_weight_hash(self) -> str:
        """SHA-256 of the weights file for legal reproducibility."""
        p = Path(self.WEIGHTS_PATH)
        if not p.exists():
            return "weights-not-found"
        h = hashlib.sha256()
        with p.open("rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()[:12]  # first 12 hex chars  (e.g. "a9f31c042d87")

    # ------------------------------------------------------------------
    # FastAPI factory
    # ------------------------------------------------------------------

    def build_app(self) -> FastAPI:
        """Create and return the FastAPI application for this model."""
        app = FastAPI(
            title=f"TRINETRA - {self.MODEL_NAME.upper()} Model Microservice",
            version="1.0.0",
            description=(
                f"Exposes `GET /health` and `POST /predict` for the "
                f"{self.MODEL_NAME} deepfake-detection model."
            ),
        )

        wrapper = self  # capture for closures below

        @app.get(
            "/health",
            response_model=HealthResponse,
            summary="Liveness / readiness check",
        )
        async def health() -> HealthResponse:
            return HealthResponse(
                status="ok",
                model=wrapper.MODEL_NAME,
                weight_version=wrapper._weight_version,
            )

        @app.post(
            "/predict",
            response_model=PredictResponse,
            summary="Run deepfake-detection inference on uploaded media",
        )
        async def predict(file: UploadFile = File(...)) -> PredictResponse:
            data = await file.read()
            if not data:
                raise HTTPException(status_code=400, detail="Empty file uploaded.")
            try:
                prob = wrapper._run_inference(data)
            except Exception as exc:  # noqa: BLE001
                raise HTTPException(
                    status_code=500, detail=f"Inference error: {exc}"
                ) from exc

            model_class: Literal["authentic", "synthetic"] = (
                "synthetic" if prob >= 0.5 else "authentic"
            )
            return PredictResponse(probability=prob, model_class=model_class)

        return app

