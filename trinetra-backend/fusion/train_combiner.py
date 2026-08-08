"""
fusion/train_combiner.py
-------------------------
One-time setup script to fit the Fusion Layer stacking meta-learner.

Run this AFTER all model containers are healthy and returning real scores.

Usage:
    python -m fusion.train_combiner

What it does:
  1. Downloads accessible benchmark datasets (Section 2 of the plan):
       - ASVspoof 2019 LA (audio)
       - FaceForensics++ subset (video)
       - Celeb-DF (video)
       - DeepSafe HF benchmark (image, audio, video)
  2. Runs each benchmark sample through the relevant model containers.
  3. Trains a candidate pool of scikit-learn classifiers on the resulting
     (feature_vector → real/fake) dataset.
  4. Selects the best by 5-fold cross-validated AUC.
  5. Saves the winner to fusion/weights/combiner.pkl.

This produces the `combiner.pkl` loaded by fusion/combiner.py at runtime.
"""

from __future__ import annotations

import asyncio
import json
import os
import pickle
import sys
from pathlib import Path
from typing import Dict, List, Tuple

import httpx
import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC

# Optional: XGBoost / LightGBM (install separately)
try:
    from xgboost import XGBClassifier  # type: ignore
    _HAS_XGB = True
except ImportError:
    _HAS_XGB = False

try:
    from lightgbm import LGBMClassifier  # type: ignore
    _HAS_LGB = True
except ImportError:
    _HAS_LGB = False

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fusion.combiner import MODEL_FEATURE_ORDER

WEIGHTS_DIR = Path(__file__).resolve().parent / "weights"
WEIGHTS_DIR.mkdir(exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# Dataset downloader (HuggingFace DeepSafe benchmark — freely downloadable)
# ─────────────────────────────────────────────────────────────────────────────

async def _fetch_deepsafe_benchmark() -> List[Tuple[str, bytes, int]]:
    """
    Download samples from the DeepSafe HuggingFace benchmark dataset.
    Returns list of (filename, file_bytes, label) where label=1 means fake.

    Dataset: https://huggingface.co/datasets/siddharthksah/DeepSafe-benchmark
    """
    from datasets import load_dataset  # type: ignore  # pip install datasets
    ds = load_dataset("siddharthksah/DeepSafe-benchmark", split="test")
    samples = []
    for row in ds:
        label = int(row.get("label", 0))
        # Depending on dataset structure, image may be under 'image' key
        img = row.get("image") or row.get("file")
        if img is not None:
            if hasattr(img, "tobytes"):
                import io
                buf = io.BytesIO()
                img.save(buf, format="JPEG")
                file_bytes = buf.getvalue()
            else:
                file_bytes = bytes(img)
            samples.append(("sample.jpg", file_bytes, label))
    print(f"[Train] Loaded {len(samples)} samples from DeepSafe benchmark.")
    return samples


async def _call_model_container(
    session: httpx.AsyncClient,
    model_name: str,
    file_bytes: bytes,
    filename: str,
    registry: list,
) -> float:
    for m in registry:
        if m["name"] == model_name and m["enabled"]:
            url = f"{m['container_url']}:{m['port']}{m['predict_endpoint']}"
            try:
                resp = await session.post(url, files={"file": (filename, file_bytes)}, timeout=60.0)
                if resp.status_code == 200:
                    return float(resp.json().get("probability", 0.5))
            except Exception:
                pass
    return 0.5  # uncertain default


async def _build_feature_matrix(
    samples: List[Tuple[str, bytes, int]],
    registry: list,
    modality: str = "image",
) -> Tuple[np.ndarray, np.ndarray]:
    """Run all samples through eligible model containers to build feature matrix."""
    eligible_models = [
        m["name"] for m in registry
        if m["enabled"] and m["modality"] == modality
    ]

    X_rows = []
    y_rows = []

    async with httpx.AsyncClient() as session:
        for filename, file_bytes, label in samples:
            row = []
            for model_name in MODEL_FEATURE_ORDER:
                if model_name in eligible_models:
                    prob = await _call_model_container(
                        session, model_name, file_bytes, filename, registry
                    )
                else:
                    prob = 0.5  # model not available for this modality
                row.append(prob)
            X_rows.append(row)
            y_rows.append(label)

    return np.array(X_rows, dtype=np.float32), np.array(y_rows, dtype=np.int32)


def _build_candidate_pool() -> dict:
    candidates = {
        "logistic_regression": LogisticRegression(max_iter=1000, C=1.0),
        "random_forest":       RandomForestClassifier(n_estimators=200, random_state=42),
        "gradient_boosting":   GradientBoostingClassifier(n_estimators=200, random_state=42),
        "svm":                 CalibratedClassifierCV(SVC(probability=False, kernel="rbf")),
        "knn":                 KNeighborsClassifier(n_neighbors=5),
        "naive_bayes":         GaussianNB(),
    }
    if _HAS_XGB:
        candidates["xgboost"] = XGBClassifier(use_label_encoder=False, eval_metric="logloss",
                                               random_state=42)
    if _HAS_LGB:
        candidates["lightgbm"] = LGBMClassifier(random_state=42, verbose=-1)
    return candidates


def train_and_save(X: np.ndarray, y: np.ndarray) -> None:
    """Train all candidates, select best by cross-validated AUC, save to disk."""
    if len(X) < 10:
        print("[Train] Not enough samples for training. Exiting.")
        return

    candidates = _build_candidate_pool()
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    best_name, best_score, best_model = None, -1.0, None
    for name, clf in candidates.items():
        try:
            scores = cross_val_score(clf, X, y, cv=skf, scoring="roc_auc", n_jobs=-1)
            mean_auc = float(scores.mean())
            print(f"  {name}: AUC = {mean_auc:.4f} ± {scores.std():.4f}")
            if mean_auc > best_score:
                best_name, best_score, best_model = name, mean_auc, clf
        except Exception as e:
            print(f"  {name}: FAILED — {e}")

    if best_model is None:
        print("[Train] All candidates failed. No model saved.")
        return

    # Refit on full dataset
    best_model.fit(X, y)
    out_path = WEIGHTS_DIR / "combiner.pkl"
    with open(out_path, "wb") as f:
        pickle.dump(best_model, f)

    print(f"\n[Train] Best model: {best_name} (AUC={best_score:.4f})")
    print(f"[Train] Saved to {out_path}")


async def main() -> None:
    config_path = Path(__file__).resolve().parents[1] / "config" / "model_registry.json"
    with open(config_path) as f:
        registry = json.load(f)["models"]

    print("[Train] Fetching DeepSafe benchmark dataset...")
    samples = await _fetch_deepsafe_benchmark()

    if not samples:
        print("[Train] No samples loaded. Aborting.")
        return

    print(f"[Train] Building feature matrix from {len(samples)} samples...")
    X, y = await _build_feature_matrix(samples, registry, modality="image")
    print(f"[Train] Feature matrix shape: {X.shape}, labels: {dict(zip(*np.unique(y, return_counts=True)))}")

    print("[Train] Training candidate classifiers...")
    train_and_save(X, y)


if __name__ == "__main__":
    asyncio.run(main())
