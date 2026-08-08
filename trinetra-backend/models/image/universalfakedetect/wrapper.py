"""
models/image/universalfakedetect/wrapper.py
-------------------------------------------
UniversalFakeDetect microservice.

Source: https://github.com/WisconsinAIVision/UniversalFakeDetect
Model:  CLIP ViT-L/14 backbone with a linear classifier trained to generalize
        across unseen generators (DALL·E, Midjourney, SD, etc.).

This is the key out-of-distribution generalizer — the model is not tuned to
specific GAN artifacts but to generic CLIP-space features that differentiate
real vs. synthetic images from any generator.

Exposes:
  GET  /health   → {"status": "ok", "model": "universalfakedetect", "weight_version": "..."}
  POST /predict  → {"probability": float, "model_class": "authentic"|"synthetic"}

Input: raw image bytes.
"""

from __future__ import annotations

import io
import os
import sys
from pathlib import Path

import torch
import torch.nn as nn
import torchvision.transforms as T
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
from sdk.base_wrapper import BaseModelWrapper  # noqa: E402

UFD_REPO = Path(os.environ.get("UFD_REPO_ROOT", "/app/ufd_repo"))
if UFD_REPO.exists():
    sys.path.insert(0, str(UFD_REPO))

# Try to import CLIP from the OpenAI package
try:
    import clip
    _CLIP_AVAILABLE = True
except ImportError:
    _CLIP_AVAILABLE = False
    print("[UFD] WARNING: 'clip' package not installed — will use fallback ViT from timm.")

# Try timm as fallback
try:
    import timm
    _TIMM_AVAILABLE = True
except ImportError:
    _TIMM_AVAILABLE = False


# ---------------------------------------------------------------------------
# UniversalFakeDetect linear probe
# ---------------------------------------------------------------------------

class CLIPLinearProbe(nn.Module):
    """
    CLIP ViT-L/14 feature extractor + linear binary classifier.
    Matches the architecture in the UFD paper.
    """
    def __init__(self, clip_model, feature_dim: int = 768):
        super().__init__()
        self.clip_model = clip_model
        self.classifier = nn.Linear(feature_dim, 1)  # binary logit

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        with torch.no_grad():
            features = self.clip_model.encode_image(x).float()  # [B, 768]
        logit = self.classifier(features)  # [B, 1]
        return logit


_UFD_TRANSFORM = T.Compose([
    T.Resize(224),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize(mean=[0.48145466, 0.4578275, 0.40821073],
                std=[0.26862954, 0.26130258, 0.27577711]),
])


class UniversalFakeDetectWrapper(BaseModelWrapper):
    MODEL_NAME = "universalfakedetect"
    WEIGHTS_PATH = Path("weights/UniversalFakeDetect.pth")

    def _load_model(self) -> None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._device = device
        self._model = None

        if _CLIP_AVAILABLE:
            clip_model, _ = clip.load("ViT-L/14", device=device)
            clip_model.eval()
            # Feature dim for ViT-L/14 is 768
            self._probe = CLIPLinearProbe(clip_model, feature_dim=768).to(device)

            weights_path = Path(self.WEIGHTS_PATH)
            if weights_path.exists():
                state = torch.load(weights_path, map_location=device)
                # UFD checkpoint may contain full probe state or just classifier
                if isinstance(state, dict) and "fc.weight" in state:
                    # Only classifier head saved
                    self._probe.classifier.load_state_dict(
                        {"weight": state["fc.weight"], "bias": state["fc.bias"]}
                    )
                elif isinstance(state, dict) and "classifier.weight" in state:
                    self._probe.classifier.weight.data = state["classifier.weight"]
                    self._probe.classifier.bias.data = state["classifier.bias"]
                else:
                    self._probe.load_state_dict(state, strict=False)
                print("[UFD] Loaded UniversalFakeDetect weights.")
            else:
                print("[UFD] WARNING: classifier weights not found. Dev mode (random head).")

            self._probe.eval()
            self._model = self._probe
        else:
            print("[UFD] CLIP not available. Service starts in stub mode.")

    def _run_inference(self, file_bytes: bytes) -> float:
        if self._model is None:
            return 0.5

        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        tensor = _UFD_TRANSFORM(image).unsqueeze(0).to(self._device)

        with torch.no_grad():
            logit = self._model(tensor)  # [1, 1]
            prob = torch.sigmoid(logit).item()

        return float(prob)  # closer to 1 = more likely fake


_wrapper = UniversalFakeDetectWrapper()
app = _wrapper.build_app()
