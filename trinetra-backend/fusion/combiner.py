"""
fusion/combiner.py
------------------
Phase 5: Fusion Layer — combines model probability scores into a single AES.

Strategy (per Section 7 of the implementation plan):
  - Stacking (primary):   A trained scikit-learn meta-learner is fitted on
                          benchmark data and serialized to disk.  Used in
                          production (premium + enterprise tiers).
  - Averaging (baseline): Mean of available model probabilities.  Used for
                          basic tier and when the stacking model is unavailable.
  - Voting (fast):        Majority vote.  Used when <2 model scores are present.

The meta-learner is fitted by running:
    python fusion/train_combiner.py

That script trains on the accessible benchmark datasets from Section 2 of the
plan (ASVspoof 2019 LA, FaceForensics++, Celeb-DF, DF40, DeepSafe HF dataset)
and saves the best-performing candidate to fusion/weights/combiner.pkl.
"""

from __future__ import annotations

import os
import pickle
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import numpy as np

COMBINER_WEIGHTS_PATH = Path(__file__).resolve().parent / "weights" / "combiner.pkl"

# Fixed model order — must match the feature vector the meta-learner was trained on
MODEL_FEATURE_ORDER = [
    "aasist",
    "rawnet2",
    "ftcn",
    "sbi",
    "npr",
    "universalfakedetect",
]


def _load_meta_learner() -> Optional[Any]:
    if COMBINER_WEIGHTS_PATH.exists():
        try:
            with open(COMBINER_WEIGHTS_PATH, "rb") as f:
                return pickle.load(f)
        except Exception as exc:
            print(f"[Fusion] Failed to load meta-learner: {exc}")
    return None


_META_LEARNER = _load_meta_learner()  # loaded once at import time


class FusionCombiner:
    def __init__(self, tier: str = "basic"):
        self._tier = tier

    def fuse(
        self,
        model_results: Dict[str, Optional[Dict[str, Any]]],
        c2pa_present: bool = False,
        uploader_declaration: str = "",
    ) -> Tuple[int, str, str, str]:
        """
        Combine model results into an Authenticity Evidence Score.

        Returns:
            (aes, confidence, fusion_method, primary_anomaly)
              aes:            int 0–100  (higher = more likely synthetic)
              confidence:     "HIGH" | "MEDIUM" | "LOW"
              fusion_method:  "stacking" | "averaging" | "voting"
              primary_anomaly: string key identifying the dominant signal
        """
        # C2PA pre-empts everything
        if c2pa_present:
            return 99, "HIGH", "voting", "C2PA_MANIFEST_DETECTED"

        # Gather available scores
        scores: Dict[str, float] = {}
        for name, res in model_results.items():
            if res is not None and isinstance(res.get("probability"), (int, float)):
                scores[name] = float(res["probability"])

        n_scores = len(scores)

        if n_scores == 0:
            return 50, "LOW", "voting", "NONE"

        # ── Voting fallback (fewer than 2 scores) ─────────────────────────────
        if n_scores == 1:
            prob = list(scores.values())[0]
            aes = int(prob * 100)
            return aes, "LOW", "voting", _primary_anomaly(scores)

        # ── Basic tier: simple averaging ──────────────────────────────────────
        if self._tier == "basic":
            return self._averaging(scores)

        # ── Premium/Enterprise: stacking (if available) ───────────────────────
        if _META_LEARNER is not None:
            try:
                return self._stacking(scores)
            except Exception as exc:
                print(f"[Fusion] Stacking failed, falling back to averaging: {exc}")

        return self._averaging(scores)

    def _averaging(
        self, scores: Dict[str, float]
    ) -> Tuple[int, str, str, str]:
        mean_prob = float(np.mean(list(scores.values())))
        aes = int(mean_prob * 100)
        # Confidence: higher when scores agree (low std dev)
        std = float(np.std(list(scores.values()))) if len(scores) > 1 else 0.5
        confidence = "HIGH" if std < 0.15 else ("MEDIUM" if std < 0.30 else "LOW")
        return aes, confidence, "averaging", _primary_anomaly(scores)

    def _stacking(
        self, scores: Dict[str, float]
    ) -> Tuple[int, str, str, str]:
        # Build feature vector in canonical order; missing models → 0.5 (uncertain)
        feature_vec = np.array(
            [scores.get(m, 0.5) for m in MODEL_FEATURE_ORDER], dtype=np.float32
        ).reshape(1, -1)

        meta = _META_LEARNER
        prob = float(meta.predict_proba(feature_vec)[0][1])  # probability of class=1 (fake)
        aes = int(prob * 100)

        # Confidence from prediction variance (if the meta-learner supports it)
        confidence = _stacking_confidence(meta, feature_vec, prob)
        return aes, confidence, "stacking", _primary_anomaly(scores)


def _primary_anomaly(scores: Dict[str, float]) -> str:
    """Identify the dominant anomaly signal from model scores."""
    if not scores:
        return "NONE"

    audio_scores = {k: v for k, v in scores.items() if k in ("aasist", "rawnet2")}
    video_scores = {k: v for k, v in scores.items() if k in ("ftcn", "sbi")}
    image_scores = {k: v for k, v in scores.items() if k in ("npr", "universalfakedetect")}

    audio_mean  = float(np.mean(list(audio_scores.values()))) if audio_scores else 0.0
    video_mean  = float(np.mean(list(video_scores.values()))) if video_scores else 0.0
    image_mean  = float(np.mean(list(image_scores.values()))) if image_scores else 0.0

    dominant_score = max(audio_mean, video_mean, image_mean)

    if dominant_score < 0.35:
        return "NONE"

    if audio_mean == dominant_score and audio_mean > video_mean:
        return "SYNTHETIC_AUDIO_DUBBING"
    if video_mean == dominant_score:
        return "FACE_SWAP"
    if image_mean == dominant_score:
        return "AI_GENERATED_IMAGE"

    return "MULTI_MODAL_ANOMALY"


def _stacking_confidence(meta_learner: Any, feature_vec: np.ndarray, prob: float) -> str:
    """
    Derive confidence from meta-learner prediction.
    Uses distance from decision boundary (0.5) as a proxy.
    """
    distance = abs(prob - 0.5)
    if distance > 0.35:
        return "HIGH"
    if distance > 0.15:
        return "MEDIUM"
    return "LOW"
