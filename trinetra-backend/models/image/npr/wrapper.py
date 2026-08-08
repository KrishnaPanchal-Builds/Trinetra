"""
models/image/npr/wrapper.py
---------------------------
NPR (Neural Pattern Recognition) deepfake detector microservice.

Source: https://github.com/chuangchuangtan/NPR-DeepfakeDetection
Model:  ResNet-50 fine-tuned to detect GAN/diffusion upsampling artifacts.

Exposes:
  GET  /health   → {"status": "ok", "model": "npr", "weight_version": "<sha256_12>"}
  POST /predict  → {"probability": float, "model_class": "authentic"|"synthetic"}

The wrapper performs:
  1. Decode uploaded image bytes to a PIL Image.
  2. Apply NPR's standard pre-processing pipeline.
  3. Run a single forward pass through the ResNet-50 backbone.
  4. Return softmax probability for the "fake" class.
"""

from __future__ import annotations

import io
import sys
from pathlib import Path

import torch
import torch.nn as nn
import torchvision.transforms as T
from PIL import Image

# Ensure the SDK is importable when run inside the container
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
from sdk.base_wrapper import BaseModelWrapper  # noqa: E402

# ---------------------------------------------------------------------------
# NPR uses a standard ResNet-50 with a 2-class linear head.
# We import it from torchvision rather than requiring the full training repo.
# ---------------------------------------------------------------------------
import torchvision.models as models


class NPRWrapper(BaseModelWrapper):
    MODEL_NAME = "npr"
    WEIGHTS_PATH = Path("weights/npr.pth")

    # NPR standard pre-processing (ImageNet stats, 224×224 crop)
    _TRANSFORM = T.Compose([
        T.Resize(256),
        T.CenterCrop(224),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    def _load_model(self) -> None:
        """Load ResNet-50 backbone and NPR weights."""
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._device = device

        # Build ResNet-50 with 2-class output head (real / fake)
        backbone = models.resnet50(weights=None)
        backbone.fc = nn.Linear(backbone.fc.in_features, 2)

        weights_path = Path(self.WEIGHTS_PATH)
        if weights_path.exists():
            state = torch.load(weights_path, map_location=device)
            # Some checkpoints are stored under a "model" or "state_dict" key
            if isinstance(state, dict) and "state_dict" in state:
                state = state["state_dict"]
            elif isinstance(state, dict) and "model" in state:
                state = state["model"]
            # Strip DataParallel prefix if present
            state = {k.replace("module.", ""): v for k, v in state.items()}
            backbone.load_state_dict(state, strict=False)
            print(f"[NPR] Loaded weights from {weights_path}")
        else:
            # Dev/CI mode: random weights so the service still starts and is callable.
            print(
                f"[NPR] WARNING: weight file not found at {weights_path}. "
                "Running with random (untrained) weights — DEVELOPMENT MODE ONLY."
            )

        backbone.eval()
        self._model = backbone.to(device)

    def _run_inference(self, file_bytes: bytes) -> float:
        """
        Decode raw image bytes and return probability that image is synthetic.

        Args:
            file_bytes: raw bytes of the uploaded image file.

        Returns:
            probability: float in [0, 1]  (closer to 1 → more likely synthetic)
        """
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        tensor = self._TRANSFORM(image).unsqueeze(0).to(self._device)

        with torch.no_grad():
            logits = self._model(tensor)          # shape: [1, 2]
            probs = torch.softmax(logits, dim=1)  # shape: [1, 2]
            fake_prob = probs[0, 1].item()        # index 1 = "fake"

        return float(fake_prob)


# ---------------------------------------------------------------------------
# Entrypoint — run with:  uvicorn wrapper:app --host 0.0.0.0 --port 8005
# ---------------------------------------------------------------------------

_wrapper = NPRWrapper()
app = _wrapper.build_app()
