"""
models/audio/aasist/wrapper.py
------------------------------
AASIST anti-spoofing microservice.

Source: https://github.com/clovaai/aasist
Model:  AASIST - Audio Anti-Spoofing using Integrated Spectro-Temporal Graph
        Attention Networks.

The AASIST repo ships its own model definition files under `models/`.
We reference them via the AASIST_REPO_ROOT env variable (set in Dockerfile).

Exposes:
  GET  /health   → {"status": "ok", "model": "aasist", "weight_version": "..."}
  POST /predict  → {"probability": float, "model_class": "authentic"|"synthetic"}

Input: raw audio bytes (WAV / FLAC).  The wrapper converts to 16kHz mono float32.
"""

from __future__ import annotations

import io
import os
import sys
from pathlib import Path

import numpy as np
import torch

# Allow SDK import regardless of working directory
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
from sdk.base_wrapper import BaseModelWrapper  # noqa: E402

# ---------------------------------------------------------------------------
# AASIST model architecture import
# ---------------------------------------------------------------------------
# The AASIST repo is cloned into /app/aasist_repo/ inside the container.
# We add it to the path and import AASIST directly.
AASIST_REPO = Path(os.environ.get("AASIST_REPO_ROOT", "/app/aasist_repo"))
if AASIST_REPO.exists():
    sys.path.insert(0, str(AASIST_REPO))

try:
    from models.AASIST import Model as AASISTModel  # from the upstream repo
    _AASIST_AVAILABLE = True
except ImportError:
    _AASIST_AVAILABLE = False


def _load_audio_to_tensor(file_bytes: bytes, target_sr: int = 16000) -> torch.Tensor:
    """
    Decode audio bytes to a 1-D float32 tensor at target_sr.
    Uses torchaudio if available, else soundfile.
    """
    import tempfile, soundfile as sf
    buf = io.BytesIO(file_bytes)
    try:
        import torchaudio
        waveform, sr = torchaudio.load(buf)
        if sr != target_sr:
            waveform = torchaudio.functional.resample(waveform, sr, target_sr)
        # Mono
        waveform = waveform.mean(dim=0)
        return waveform
    except Exception:
        # Fallback: soundfile
        buf.seek(0)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        data, sr = sf.read(tmp_path, dtype="float32", always_2d=False)
        os.unlink(tmp_path)
        tensor = torch.from_numpy(data)
        if tensor.ndim > 1:
            tensor = tensor.mean(dim=1)
        # Resample if needed (simple decimation - good enough for triage)
        if sr != target_sr:
            ratio = target_sr / sr
            n_out = int(len(tensor) * ratio)
            indices = torch.linspace(0, len(tensor) - 1, n_out).long()
            tensor = tensor[indices]
        return tensor


class AASISTWrapper(BaseModelWrapper):
    MODEL_NAME = "aasist"
    WEIGHTS_PATH = Path("weights/AASIST.pth")

    # AASIST expects exactly 64600 samples (4 seconds @ 16kHz)
    _MAX_LEN = 64600

    def _load_model(self) -> None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._device = device

        if _AASIST_AVAILABLE and Path(self.WEIGHTS_PATH).exists():
            # Load AASIST config from the repo's default config
            import json
            config_path = AASIST_REPO / "config" / "AASIST.conf"
            with open(config_path) as f:
                config = json.load(f)

            model = AASISTModel(config["model_config"])
            state = torch.load(self.WEIGHTS_PATH, map_location=device)
            if isinstance(state, dict) and "model" in state:
                state = state["model"]
            state = {k.replace("module.", ""): v for k, v in state.items()}
            model.load_state_dict(state, strict=False)
            model.eval()
            self._model = model.to(device)
            print("[AASIST] Loaded pretrained weights.")
        else:
            print(
                "[AASIST] WARNING: AASIST repo or weights not found. "
                "Running stub model - DEVELOPMENT MODE ONLY."
            )
            self._model = None

    def _run_inference(self, file_bytes: bytes) -> float:
        if self._model is None:
            # Dev stub: return 0.5 (uncertain)
            return 0.5

        waveform = _load_audio_to_tensor(file_bytes, target_sr=16000)

        # Pad / truncate to fixed length
        if len(waveform) < self._MAX_LEN:
            waveform = torch.nn.functional.pad(waveform, (0, self._MAX_LEN - len(waveform)))
        else:
            waveform = waveform[:self._MAX_LEN]

        waveform = waveform.unsqueeze(0).to(self._device)  # [1, 64600]

        with torch.no_grad():
            _, output = self._model(waveform)  # AASIST returns (emb, logits)
            # output shape: [1, 2]  - index 1 = spoof class
            probs = torch.softmax(output, dim=1)
            spoof_prob = probs[0, 1].item()

        return float(spoof_prob)


_wrapper = AASISTWrapper()
app = _wrapper.build_app()

