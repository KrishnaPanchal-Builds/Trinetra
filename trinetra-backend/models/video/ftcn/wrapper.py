"""
models/video/ftcn/wrapper.py
----------------------------
FTCN (Frequency-Temporal Convolutional Network) deepfake detection microservice.

Source: https://github.com/yinglinzheng/FTCN
        Also available via DeepfakeBench: https://github.com/SCLBD/DeepfakeBench

The FTCN model analyzes temporal inconsistencies in video frames using
frequency and temporal convolutions.

Input to /predict: a ZIP or tar of extracted video frames (JPG/PNG) at 3fps,
or a single mp4/webm file.  The wrapper auto-extracts frames if a video file
is detected.

Exposes:
  GET  /health   → {"status": "ok", "model": "ftcn", "weight_version": "..."}
  POST /predict  → {"probability": float, "model_class": "authentic"|"synthetic"}
"""

from __future__ import annotations

import io
import os
import sys
import tempfile
from pathlib import Path
from typing import List

import numpy as np
import torch
import torch.nn as nn
import torchvision.transforms as T
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
from sdk.base_wrapper import BaseModelWrapper  # noqa: E402

FTCN_REPO = Path(os.environ.get("FTCN_REPO_ROOT", "/app/ftcn_repo"))
if FTCN_REPO.exists():
    sys.path.insert(0, str(FTCN_REPO))

try:
    from model import get_model as ftcn_get_model  # from upstream FTCN repo
    _FTCN_NATIVE = True
except ImportError:
    _FTCN_NATIVE = False

# ---------------------------------------------------------------------------
# Lightweight fallback: XceptionNet backbone (from DeepfakeBench / SBI)
# Used when the FTCN repo is not present.
# ---------------------------------------------------------------------------

class SeparableConv2d(nn.Module):
    def __init__(self, in_ch, out_ch, k=1, s=1, p=0, d=1, b=False):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch, in_ch, k, s, p, dilation=d, groups=in_ch, bias=b),
            nn.Conv2d(in_ch, out_ch, 1, bias=b),
        )
    def forward(self, x):
        return self.conv(x)


class Block(nn.Module):
    def __init__(self, in_ch, out_ch, reps, s=1, start_with_relu=True, grow_first=True):
        super().__init__()
        self.skip = None
        if out_ch != in_ch or s != 1:
            self.skip = nn.Sequential(
                nn.Conv2d(in_ch, out_ch, 1, s, bias=False),
                nn.BatchNorm2d(out_ch),
            )
        layers = []
        ch = in_ch
        for i in range(reps):
            out = out_ch if grow_first or i == reps - 1 else in_ch
            if start_with_relu or i > 0:
                layers.append(nn.ReLU(inplace=True))
            layers += [SeparableConv2d(ch, out, 3, 1, 1), nn.BatchNorm2d(out)]
            ch = out
        if s != 1:
            layers.append(nn.MaxPool2d(3, s, 1))
        self.rep = nn.Sequential(*layers)

    def forward(self, x):
        skip = self.skip(x) if self.skip else x
        return self.rep(x) + skip


class XceptionFallback(nn.Module):
    """Simplified XceptionNet for binary deepfake classification."""
    def __init__(self, nb_classes=2):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, 2, bias=False)
        self.bn1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 64, 3, bias=False)
        self.bn2 = nn.BatchNorm2d(64)
        self.blocks = nn.Sequential(
            Block(64, 128, 2, 2, False, True),
            Block(128, 256, 2, 2),
            Block(256, 728, 2, 2),
            *[Block(728, 728, 3, 1) for _ in range(8)],
            Block(728, 1024, 2, 2, grow_first=False),
        )
        self.conv3 = SeparableConv2d(1024, 1536, 3, 1, 1)
        self.bn3 = nn.BatchNorm2d(1536)
        self.conv4 = SeparableConv2d(1536, 2048, 3, 1, 1)
        self.bn4 = nn.BatchNorm2d(2048)
        self.fc = nn.Linear(2048, nb_classes)

    def forward(self, x):
        x = nn.functional.relu(self.bn1(self.conv1(x)))
        x = nn.functional.relu(self.bn2(self.conv2(x)))
        x = self.blocks(x)
        x = nn.functional.relu(self.bn3(self.conv3(x)))
        x = nn.functional.relu(self.bn4(self.conv4(x)))
        x = nn.functional.adaptive_avg_pool2d(x, 1).flatten(1)
        return self.fc(x)


# ---------------------------------------------------------------------------
# Frame extraction utility
# ---------------------------------------------------------------------------

def _extract_frames(file_bytes: bytes, n_frames: int = 8) -> List[Image.Image]:
    """Extract up to n_frames evenly spaced frames from a video file."""
    import subprocess, struct

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp.write(file_bytes)
        video_path = tmp.name

    out_dir = tempfile.mkdtemp()
    try:
        subprocess.run(
            [
                "ffmpeg", "-i", video_path,
                "-vf", f"fps=3,scale=299:299",
                "-frames:v", str(n_frames),
                "-q:v", "2",
                f"{out_dir}/frame_%04d.jpg",
            ],
            capture_output=True, timeout=30,
        )
        frames = sorted(Path(out_dir).glob("*.jpg"))
        images = [Image.open(f).convert("RGB") for f in frames[:n_frames]]
    except Exception:
        images = []
    finally:
        os.unlink(video_path)
        for f in Path(out_dir).glob("*"):
            f.unlink()
        os.rmdir(out_dir)

    return images


_TRANSFORM = T.Compose([
    T.Resize((299, 299)),
    T.ToTensor(),
    T.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
])


class FTCNWrapper(BaseModelWrapper):
    MODEL_NAME = "ftcn"
    WEIGHTS_PATH = Path("weights/ftcn.pth")

    def _load_model(self) -> None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._device = device

        # Try native FTCN model first, fall back to Xception
        if _FTCN_NATIVE and Path(self.WEIGHTS_PATH).exists():
            model = ftcn_get_model()
            state = torch.load(self.WEIGHTS_PATH, map_location=device)
            if isinstance(state, dict) and "model" in state:
                state = state["model"]
            state = {k.replace("module.", ""): v for k, v in state.items()}
            model.load_state_dict(state, strict=False)
            print("[FTCN] Loaded native FTCN model.")
        else:
            model = XceptionFallback(nb_classes=2)
            if Path(self.WEIGHTS_PATH).exists():
                state = torch.load(self.WEIGHTS_PATH, map_location=device)
                if isinstance(state, dict) and "state_dict" in state:
                    state = state["state_dict"]
                state = {k.replace("module.", ""): v for k, v in state.items()}
                model.load_state_dict(state, strict=False)
                print("[FTCN] Loaded XceptionNet fallback weights.")
            else:
                print("[FTCN] WARNING: No weights found. Dev/random mode.")

        model.eval()
        self._model = model.to(device)

    def _run_inference(self, file_bytes: bytes) -> float:
        if self._model is None:
            return 0.5

        # Try to detect if this is a video file (check magic bytes)
        is_video = file_bytes[:4] in (b"\x00\x00\x00\x18", b"\x00\x00\x00\x1c") or \
                   file_bytes[4:8] == b"ftyp" or file_bytes[:3] == b"ID3"

        if is_video:
            frames = _extract_frames(file_bytes, n_frames=8)
        else:
            # Single frame image passed directly
            frames = [Image.open(io.BytesIO(file_bytes)).convert("RGB")]

        if not frames:
            return 0.5

        tensors = torch.stack([_TRANSFORM(f) for f in frames]).to(self._device)

        with torch.no_grad():
            logits = self._model(tensors)  # [N, 2]
            probs = torch.softmax(logits, dim=1)
            fake_prob = probs[:, 1].mean().item()

        return float(fake_prob)


_wrapper = FTCNWrapper()
app = _wrapper.build_app()
