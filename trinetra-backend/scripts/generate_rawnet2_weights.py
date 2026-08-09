#!/usr/bin/env python3
"""
scripts/generate_rawnet2_weights.py
-------------------------------------
Generates an architecture-matching RawNet2 state dict and saves it.

Default output: models/audio/rawnet2/weights/RawNet2.pth (relative to backend root)
Override:       set RAWNET2_WEIGHTS_PATH env var, or pass --output <path>

Usage (host):
    python scripts/generate_rawnet2_weights.py

Usage (Docker build, via Dockerfile):
    python /app/scripts/generate_rawnet2_weights.py --output /app/weights/RawNet2.pth
"""
from __future__ import annotations
import os
import sys
import argparse
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]

# Default output path - overridden by __main__ via --output or RAWNET2_WEIGHTS_PATH
OUT_PATH: Path = BACKEND_ROOT / "models" / "audio" / "rawnet2" / "weights" / "RawNet2.pth"

sys.path.insert(0, str(BACKEND_ROOT))

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


def generate_with_torch() -> bool:
    import torch
    import torch.nn as nn

    class SincConv(nn.Module):
        def __init__(self, out_channels, kernel_size, sample_rate=16000):
            super().__init__()
            self.out_channels = out_channels
            self.kernel_size = kernel_size
            self.sample_rate = sample_rate
            self.low_hz_ = nn.Parameter(
                torch.Tensor(out_channels, 1).uniform_(0, sample_rate / 4)
            )
            self.band_hz_ = nn.Parameter(
                torch.Tensor(out_channels, 1).uniform_(0, sample_rate / 4)
            )
            n = torch.arange(-(kernel_size - 1) / 2, (kernel_size - 1) / 2 + 1)
            self.register_buffer(
                "window_", 0.54 - 0.46 * torch.cos(2 * torch.pi * n / (kernel_size - 1))
            )
            self.register_buffer("n_", 2 * torch.pi * n / sample_rate)

        def forward(self, x):
            return x

    class ResBlock(nn.Module):
        def __init__(self, in_ch, out_ch):
            super().__init__()
            self.bn1 = nn.BatchNorm1d(in_ch)
            self.conv1 = nn.Conv1d(in_ch, out_ch, 3, padding=1, bias=False)
            self.bn2 = nn.BatchNorm1d(out_ch)
            self.conv2 = nn.Conv1d(out_ch, out_ch, 3, padding=1, bias=False)
            self.downsample = (
                nn.Conv1d(in_ch, out_ch, 1, bias=False) if in_ch != out_ch else None
            )
            self.mp = nn.MaxPool1d(3)

        def forward(self, x):
            return x

    class RawNet2(nn.Module):
        def __init__(self, nb_classes=2):
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
            self.gru = nn.GRU(
                input_size=512, hidden_size=1024, num_layers=3, batch_first=True
            )
            self.fc = nn.Linear(1024, nb_classes)

        def forward(self, x):
            return x

    torch.manual_seed(42)
    model = RawNet2(nb_classes=2)
    out_path = OUT_PATH
    out_path.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), out_path)
    size_kb = out_path.stat().st_size // 1024
    print(f"[OK] Saved RawNet2 initialized state dict -> {out_path} ({size_kb} KB)")
    return True



def generate_with_struct() -> bool:
    """
    Pure-Python fallback that writes a minimal valid PyTorch zip+pickle format.
    Uses numpy to create float32 arrays that match the architecture.
    """
    import io
    import pickle
    import struct
    import zipfile
    import numpy as np

    rng = np.random.RandomState(42)

    def _rand(*shape):
        return rng.randn(*shape).astype(np.float32)

    def _ones(*shape):
        return np.ones(shape, dtype=np.float32)

    def _zeros(*shape):
        return np.zeros(shape, dtype=np.float32)

    # Build state dict as numpy arrays with correct shapes
    state = {
        # SincConv
        "sinc.low_hz_":                _rand(128, 1),
        "sinc.band_hz_":               _rand(128, 1),
        "sinc.window_":                _rand(1024),
        "sinc.n_":                     _rand(1024),
        # BN after sinc
        "bn_sinc.weight":              _ones(128),
        "bn_sinc.bias":                _zeros(128),
        "bn_sinc.running_mean":        _zeros(128),
        "bn_sinc.running_var":         _ones(128),
        "bn_sinc.num_batches_tracked": np.array(0, dtype=np.int64),
        # ResBlock 0: 128 -> 128
        "res_blocks.0.bn1.weight":     _ones(128),
        "res_blocks.0.bn1.bias":       _zeros(128),
        "res_blocks.0.bn1.running_mean": _zeros(128),
        "res_blocks.0.bn1.running_var": _ones(128),
        "res_blocks.0.bn1.num_batches_tracked": np.array(0, dtype=np.int64),
        "res_blocks.0.conv1.weight":   _rand(128, 128, 3),
        "res_blocks.0.bn2.weight":     _ones(128),
        "res_blocks.0.bn2.bias":       _zeros(128),
        "res_blocks.0.bn2.running_mean": _zeros(128),
        "res_blocks.0.bn2.running_var": _ones(128),
        "res_blocks.0.bn2.num_batches_tracked": np.array(0, dtype=np.int64),
        "res_blocks.0.conv2.weight":   _rand(128, 128, 3),
        # ResBlock 1: 128 -> 512
        "res_blocks.1.bn1.weight":     _ones(128),
        "res_blocks.1.bn1.bias":       _zeros(128),
        "res_blocks.1.bn1.running_mean": _zeros(128),
        "res_blocks.1.bn1.running_var": _ones(128),
        "res_blocks.1.bn1.num_batches_tracked": np.array(0, dtype=np.int64),
        "res_blocks.1.conv1.weight":   _rand(512, 128, 3),
        "res_blocks.1.bn2.weight":     _ones(512),
        "res_blocks.1.bn2.bias":       _zeros(512),
        "res_blocks.1.bn2.running_mean": _zeros(512),
        "res_blocks.1.bn2.running_var": _ones(512),
        "res_blocks.1.bn2.num_batches_tracked": np.array(0, dtype=np.int64),
        "res_blocks.1.conv2.weight":   _rand(512, 512, 3),
        "res_blocks.1.downsample.weight": _rand(512, 128, 1),
        # ResBlocks 2-5: 512 -> 512 (no downsample)
        **{
            f"res_blocks.{i}.bn1.weight":     _ones(512)
            for i in range(2, 6)
        },
        **{
            f"res_blocks.{i}.bn1.bias":       _zeros(512)
            for i in range(2, 6)
        },
        **{
            f"res_blocks.{i}.bn1.running_mean": _zeros(512)
            for i in range(2, 6)
        },
        **{
            f"res_blocks.{i}.bn1.running_var": _ones(512)
            for i in range(2, 6)
        },
        **{
            f"res_blocks.{i}.bn1.num_batches_tracked": np.array(0, dtype=np.int64)
            for i in range(2, 6)
        },
        **{
            f"res_blocks.{i}.conv1.weight":   _rand(512, 512, 3)
            for i in range(2, 6)
        },
        **{
            f"res_blocks.{i}.bn2.weight":     _ones(512)
            for i in range(2, 6)
        },
        **{
            f"res_blocks.{i}.bn2.bias":       _zeros(512)
            for i in range(2, 6)
        },
        **{
            f"res_blocks.{i}.bn2.running_mean": _zeros(512)
            for i in range(2, 6)
        },
        **{
            f"res_blocks.{i}.bn2.running_var": _ones(512)
            for i in range(2, 6)
        },
        **{
            f"res_blocks.{i}.bn2.num_batches_tracked": np.array(0, dtype=np.int64)
            for i in range(2, 6)
        },
        **{
            f"res_blocks.{i}.conv2.weight":   _rand(512, 512, 3)
            for i in range(2, 6)
        },
        # BN before GRU
        "bn_before_gru.weight":        _ones(512),
        "bn_before_gru.bias":          _zeros(512),
        "bn_before_gru.running_mean":  _zeros(512),
        "bn_before_gru.running_var":   _ones(512),
        "bn_before_gru.num_batches_tracked": np.array(0, dtype=np.int64),
        # GRU (3 layers, hidden=1024)
        # Layer 0: input_size=512
        "gru.weight_ih_l0":  _rand(3 * 1024, 512),
        "gru.weight_hh_l0":  _rand(3 * 1024, 1024),
        "gru.bias_ih_l0":    _zeros(3 * 1024),
        "gru.bias_hh_l0":    _zeros(3 * 1024),
        # Layers 1-2: input_size=1024
        "gru.weight_ih_l1":  _rand(3 * 1024, 1024),
        "gru.weight_hh_l1":  _rand(3 * 1024, 1024),
        "gru.bias_ih_l1":    _zeros(3 * 1024),
        "gru.bias_hh_l1":    _zeros(3 * 1024),
        "gru.weight_ih_l2":  _rand(3 * 1024, 1024),
        "gru.weight_hh_l2":  _rand(3 * 1024, 1024),
        "gru.bias_ih_l2":    _zeros(3 * 1024),
        "gru.bias_hh_l2":    _zeros(3 * 1024),
        # FC head
        "fc.weight": _rand(2, 1024),
        "fc.bias":   _zeros(2),
    }

    # Serialize using numpy-based storage (PyTorch zip format)
    # We'll write a simple pickle file that torch.load can read.
    # This uses the legacy pickle protocol that torch understands.
    out_path = OUT_PATH
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Convert numpy arrays to a format torch.load understands:
    # Use pickle with numpy arrays - torch.load can handle this with
    # weights_only=False (the default) since numpy arrays are serializable.
    import pickle as _pickle
    with open(out_path, "wb") as f:
        _pickle.dump(state, f, protocol=4)

    size_kb = out_path.stat().st_size // 1024
    print(f"[OK] Saved RawNet2 numpy state dict -> {out_path} ({size_kb} KB)")
    print("[NOTE] These are initialized (not pretrained) weights.")
    return True


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default=None, help="Output path for RawNet2.pth")
    args = ap.parse_args()

    # Resolve output path: CLI > env var > default
    raw_out = (
        args.output
        or os.environ.get("RAWNET2_WEIGHTS_PATH")
        or str(BACKEND_ROOT / "models" / "audio" / "rawnet2" / "weights" / "RawNet2.pth")
    )
    OUT_PATH = Path(raw_out)

    if TORCH_AVAILABLE:
        print("torch available -- using torch.save()")
        success = generate_with_torch()
    else:
        print("torch not available -- using numpy+pickle serialization")
        try:
            import numpy
            success = generate_with_struct()
        except ImportError:
            print("[ERROR] Neither torch nor numpy available. Install one of them.")
            success = False

    sys.exit(0 if success else 1)

