"""
models/audio/rawnet2/wrapper.py
-------------------------------
RawNet2 anti-spoofing microservice.

Source: https://github.com/Jungjee/RawNet  (also bundled in AASIST repo)
Model:  RawNet2 — end-to-end raw-waveform anti-spoofing model.

Note: RawNet2 (anti-spoofing) NOT RawNet3 (speaker-verification).
      See Section 2 of TRINETRA_Backend_Implementation_Plan.md.

Exposes:
  GET  /health   → {"status": "ok", "model": "rawnet2", "weight_version": "..."}
  POST /predict  → {"probability": float, "model_class": "authentic"|"synthetic"}

Input: raw audio bytes (WAV/FLAC).
"""

from __future__ import annotations

import io
import os
import sys
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
from sdk.base_wrapper import BaseModelWrapper  # noqa: E402

# ---------------------------------------------------------------------------
# RawNet2 architecture (self-contained, no external repo dependency)
# Based on the published architecture in Tak et al. 2021 / Jung et al. 2019
# ---------------------------------------------------------------------------

class SincConv(nn.Module):
    """Sinc-based convolution layer (first layer of RawNet2)."""

    def __init__(self, out_channels: int, kernel_size: int, sample_rate: int = 16000):
        super().__init__()
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.sample_rate = sample_rate

        # Learnable cutoff frequencies
        self.low_hz_ = nn.Parameter(torch.Tensor(out_channels, 1).uniform_(0, sample_rate / 4))
        self.band_hz_ = nn.Parameter(torch.Tensor(out_channels, 1).uniform_(0, sample_rate / 4))

        # Hanning window
        n = torch.arange(-(kernel_size - 1) / 2, (kernel_size - 1) / 2 + 1)
        self.register_buffer("window_", 0.54 - 0.46 * torch.cos(2 * torch.pi * n / (kernel_size - 1)))
        self.register_buffer("n_", 2 * torch.pi * n / sample_rate)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        low = 50 + torch.abs(self.low_hz_)
        high = torch.clamp(low + torch.abs(self.band_hz_), 50, self.sample_rate / 2 - 50)
        f_times_t = self.n_.unsqueeze(0) * high - self.n_.unsqueeze(0) * low
        band_pass = (
            2 * high * torch.sinc(2 * high / self.sample_rate * self.n_)
            - 2 * low * torch.sinc(2 * low / self.sample_rate * self.n_)
        )
        band_pass = band_pass * self.window_
        band_pass = band_pass / (band_pass.norm(p=2, dim=-1, keepdim=True) + 1e-8)
        return F.conv1d(x, band_pass.unsqueeze(1), stride=1, padding=self.kernel_size // 2)


class ResBlock(nn.Module):
    def __init__(self, in_ch: int, out_ch: int):
        super().__init__()
        self.bn1 = nn.BatchNorm1d(in_ch)
        self.conv1 = nn.Conv1d(in_ch, out_ch, 3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm1d(out_ch)
        self.conv2 = nn.Conv1d(out_ch, out_ch, 3, padding=1, bias=False)
        self.downsample = nn.Conv1d(in_ch, out_ch, 1, bias=False) if in_ch != out_ch else None
        self.mp = nn.MaxPool1d(3)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        residual = self.downsample(x) if self.downsample else x
        out = self.conv1(F.leaky_relu(self.bn1(x), 0.3))
        out = self.conv2(F.leaky_relu(self.bn2(out), 0.3))
        return self.mp(out + residual)


class RawNet2(nn.Module):
    def __init__(self, nb_classes: int = 2):
        super().__init__()
        self.sinc = SincConv(128, 1024, 16000)
        self.bn_sinc = nn.BatchNorm1d(128)
        self.res_blocks = nn.Sequential(
            ResBlock(128, 128),
            ResBlock(128, 512),
            ResBlock(512, 512),
            ResBlock(512, 512),
            ResBlock(512, 512),
            ResBlock(512, 512),
        )
        self.bn_before_gru = nn.BatchNorm1d(512)
        self.gru = nn.GRU(input_size=512, hidden_size=1024, num_layers=3, batch_first=True)
        self.fc_output = nn.Linear(1024, nb_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [B, T]
        x = x.unsqueeze(1)                          # [B, 1, T]
        x = F.max_pool1d(torch.abs(self.sinc(x)), 3)
        x = F.leaky_relu(self.bn_sinc(x), 0.3)
        x = self.res_blocks(x)
        x = F.leaky_relu(self.bn_before_gru(x), 0.3)
        x = x.transpose(1, 2)                       # [B, T', 512]
        _, h = self.gru(x)                           # h: [3, B, 1024]
        x = h[-1]                                    # [B, 1024]
        return self.fc_output(x)                     # [B, 2]


# ---------------------------------------------------------------------------
# Audio loader (shared utility)
# ---------------------------------------------------------------------------

def _load_audio(file_bytes: bytes, target_sr: int = 16000) -> torch.Tensor:
    import tempfile, soundfile as sf
    try:
        import torchaudio
        waveform, sr = torchaudio.load(io.BytesIO(file_bytes))
        if sr != target_sr:
            waveform = torchaudio.functional.resample(waveform, sr, target_sr)
        return waveform.mean(dim=0)
    except Exception:
        buf = io.BytesIO(file_bytes)
        buf.seek(0)
        data, sr = sf.read(buf, dtype="float32", always_2d=False)
        tensor = torch.from_numpy(data if data.ndim == 1 else data.mean(axis=1))
        if sr != target_sr:
            n_out = int(len(tensor) * target_sr / sr)
            indices = torch.linspace(0, len(tensor) - 1, n_out).long()
            tensor = tensor[indices]
        return tensor


class RawNet2Wrapper(BaseModelWrapper):
    MODEL_NAME = "rawnet2"
    WEIGHTS_PATH = Path("weights/RawNet2.pth")

    _MAX_LEN = 64600  # 4s @ 16kHz

    def _load_model(self) -> None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._device = device
        model = RawNet2(nb_classes=2)

        weights_path = Path(self.WEIGHTS_PATH)
        if weights_path.exists() and weights_path.stat().st_size > 1000:
            state = torch.load(weights_path, map_location=device, weights_only=False)

            # Handle numpy-pickle format (generated by generate_rawnet2_weights.py)
            if isinstance(state, dict):
                import numpy as np
                converted = {}
                for k, v in state.items():
                    if isinstance(v, np.ndarray):
                        converted[k] = torch.from_numpy(v.copy())
                    else:
                        converted[k] = v
                state = converted

            # Unwrap nested 'model' key if present
            if isinstance(state, dict) and "model" in state and isinstance(state["model"], dict):
                state = state["model"]

            # Strip DataParallel prefix
            state = {k.replace("module.", ""): v for k, v in state.items()}

            # Remap fc.* -> fc_output.* (generated weights use 'fc', model uses 'fc_output')
            remapped = {}
            for k, v in state.items():
                if k.startswith("fc.") and not k.startswith("fc_output."):
                    remapped["fc_output." + k[3:]] = v
                else:
                    remapped[k] = v
            state = remapped

            missing, unexpected = model.load_state_dict(state, strict=False)
            if missing:
                print(f"[RawNet2] WARNING: missing keys: {missing[:5]}{'...' if len(missing) > 5 else ''}")
            if unexpected:
                print(f"[RawNet2] WARNING: unexpected keys: {unexpected[:5]}{'...' if len(unexpected) > 5 else ''}")
            pretrained = any("_pretrained" in str(weights_path) for _ in [0])
            print("[RawNet2] Weights loaded (initialized, not pretrained — awaiting real checkpoint).")
        else:
            print("[RawNet2] WARNING: weights not found or empty. Running in DEVELOPMENT mode.")

        model.eval()
        self._model = model.to(device)


    def _run_inference(self, file_bytes: bytes) -> float:
        waveform = _load_audio(file_bytes, 16000)

        if len(waveform) < self._MAX_LEN:
            waveform = F.pad(waveform, (0, self._MAX_LEN - len(waveform)))
        else:
            waveform = waveform[:self._MAX_LEN]

        waveform = waveform.unsqueeze(0).to(self._device)  # [1, 64600]

        with torch.no_grad():
            logits = self._model(waveform)      # [1, 2]
            probs = torch.softmax(logits, dim=1)
            spoof_prob = probs[0, 1].item()     # index 1 = spoof / synthetic

        return float(spoof_prob)


_wrapper = RawNet2Wrapper()
app = _wrapper.build_app()
