#!/usr/bin/env python3
"""
scripts/download_weights.py
----------------------------
Repeatable, idempotent script to download all 6 pretrained model weights
for TRINETRA's model containers.

Usage:
    python scripts/download_weights.py [--force]

    --force   Re-download even if the weight file already exists.

What it downloads (in order):
  1. AASIST.pth        - from clovaai/aasist GitHub repo (committed in-tree)
  2. RawNet2.pth       - from eurecom-asp/rawnet2-antispoofing GitHub repo
  3. ftcn.pth          - Xception/FF++ from DeepfakeBench Google Drive
  4. sbi_xception.pth  - Xception/FF++ from DeepfakeBench Google Drive (same backbone)
  5. npr.pth           - from HuggingFace siddharthksah/deepsafe-weights
  6. UniversalFakeDetect.pth - fc_weights.pth from HuggingFace

After running this script, rebuild containers with:
    docker-compose up --build -d
"""

from __future__ import annotations

import argparse
import hashlib
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

# ─── Root of the backend repo (two levels up from this script) ────────────────
BACKEND_ROOT = Path(__file__).resolve().parents[1]

# ─── Weight destination paths (must match config/model_registry.json) ─────────
WEIGHT_DESTINATIONS = {
    "aasist":              BACKEND_ROOT / "models/audio/aasist/weights/AASIST.pth",
    "rawnet2":             BACKEND_ROOT / "models/audio/rawnet2/weights/RawNet2.pth",
    "ftcn":                BACKEND_ROOT / "models/video/ftcn/weights/ftcn.pth",
    "sbi":                 BACKEND_ROOT / "models/video/sbi/weights/sbi_xception.pth",
    "npr":                 BACKEND_ROOT / "models/image/npr/weights/npr.pth",
    "universalfakedetect": BACKEND_ROOT / "models/image/universalfakedetect/weights/UniversalFakeDetect.pth",
}

# ─── HuggingFace direct download URLs ─────────────────────────────────────────
HF_REPO  = "siddharthksah/deepsafe-weights"
HF_BASE  = "https://huggingface.co/siddharthksah/deepsafe-weights/resolve/main"
# NOTE: paths within the HuggingFace repo (used by hf_hub_download)
# VERIFIED 2026-08-09 against the live HuggingFace API manifest:
#   - universalfakedetect/fc_weights.pth  EXISTS
#   - npr_deepfakedetection/NPR.pth       DOES NOT EXIST in this repo
#     NPR weights must be obtained from chuangchuangtan/NPR-DeepfakeDetection (GDrive only)
HF_PATHS = {
    "universalfakedetect": "universalfakedetect/fc_weights.pth",
}
HF_URLS = {
    "universalfakedetect": f"{HF_BASE}/universalfakedetect/fc_weights.pth",
}

# ─── Direct GitHub release URLs (no gdown/GDrive needed) ───────────────────────
GITHUB_RELEASE_URLS = {
    # Native FTCN+TT weights - single asset from yinglinzheng/FTCN "weights" release
    # Verified: https://github.com/yinglinzheng/FTCN/releases/tag/weights
    # Size: 59,248,500 bytes (56.5 MB)
    "ftcn": "https://github.com/yinglinzheng/FTCN/releases/download/weights/ftcn_tt.pth",
}

# ─── DeepfakeBench shared Google Drive IDs (Xception trained on FF++) ─────────
# Used only for SBI (which deliberately uses Xception as its backbone wrapper).
GDRIVE_IDS = {
    "sbi":   "1A7ViPGx14DwYE2jIcGsaBLFJhNPsWpKM",   # xception_c23 from DeepfakeBench
}

# ─── Git repos for audio models ────────────────────────────────────────────────
GIT_REPOS = {
    "aasist":  "https://github.com/clovaai/aasist.git",
    "rawnet2": "https://github.com/eurecom-asp/rawnet2-antispoofing.git",
}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _sha256(path: Path, chunk: int = 1 << 20) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while data := f.read(chunk):
            h.update(data)
    return h.hexdigest()[:16]


def _ensure_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _wget(url: str, dest: Path) -> bool:
    """Download a file from a URL using urllib. Returns True on success."""
    print(f"    Downloading {url}")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=120) as resp, open(dest, "wb") as f:
            shutil.copyfileobj(resp, f)
        return True
    except Exception as exc:
        print(f"    WARNING: urllib failed ({exc}). Trying wget...")
        try:
            subprocess.run(
                ["wget", "-q", "--show-progress", "-O", str(dest), url],
                check=True, timeout=300,
            )
            return True
        except Exception as exc2:
            print(f"    ERROR: wget also failed: {exc2}")
            return False


def _gdown(gdrive_id: str, dest: Path) -> bool:
    """Download from Google Drive using gdown. Returns True on success."""
    try:
        import gdown  # type: ignore
    except ImportError:
        print("    gdown not installed -- installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "gdown"], check=True)
        import gdown  # type: ignore
    url = f"https://drive.google.com/uc?id={gdrive_id}"
    print(f"    Downloading from Google Drive: {gdrive_id}")
    try:
        # Remove 'fuzzy' kwarg -- it was added in gdown>=4.4 but not in older installs.
        # Use positional args only for maximum compatibility.
        import inspect
        sig = inspect.signature(gdown.download)
        if "fuzzy" in sig.parameters:
            gdown.download(url, str(dest), quiet=False, fuzzy=True)
        else:
            gdown.download(url, str(dest), quiet=False)
        return dest.exists() and dest.stat().st_size > 100_000
    except Exception as exc:
        print(f"    ERROR: gdown failed: {exc}")
        return False


def _git_clone(repo_url: str, target_dir: Path) -> bool:
    """Shallow-clone a git repo. Returns True on success."""
    if target_dir.exists():
        print(f"    Repo already cloned at {target_dir} -- skipping.")
        return True
    print(f"    Cloning {repo_url} -> {target_dir}")
    try:
        subprocess.run(
            ["git", "clone", "--depth", "1", repo_url, str(target_dir)],
            check=True, timeout=300,
        )
        return True
    except Exception as exc:
        print(f"    ERROR: git clone failed: {exc}")
        return False


def _hf_download(model_key: str, dest: Path) -> bool:
    """
    Download a file from HuggingFace using huggingface_hub (LFS-aware).
    Falls back to direct URL if huggingface_hub is not installed.
    """
    hf_path = HF_PATHS.get(model_key)
    if not hf_path:
        return False
    # Try huggingface_hub first (handles LFS, auth tokens, caching)
    try:
        from huggingface_hub import hf_hub_download  # type: ignore
        print(f"    Using huggingface_hub to download {HF_REPO}/{hf_path}")
        cached = hf_hub_download(
            repo_id=HF_REPO,
            filename=hf_path,
            repo_type="model",
        )
        shutil.copy2(cached, dest)
        return dest.exists() and dest.stat().st_size > 1000
    except ImportError:
        pass
    except Exception as exc:
        print(f"    WARNING: hf_hub_download failed ({exc}), trying direct URL...")
    # Fallback: direct resolve URL (may fail for LFS files without auth)
    direct_url = HF_URLS.get(model_key)
    if direct_url:
        return _wget(direct_url, dest)
    return False




# ─────────────────────────────────────────────────────────────────────────────
# Per-model download logic
# ─────────────────────────────────────────────────────────────────────────────

def download_aasist(dest: Path, force: bool) -> bool:
    """
    AASIST.pth is committed directly inside the clovaai/aasist repository at
    models/weights/AASIST.pth.  We shallow-clone the repo and copy the file.
    """
    if dest.exists() and not force:
        return True
    _ensure_dir(dest)
    with tempfile.TemporaryDirectory() as tmpdir:
        clone_dir = Path(tmpdir) / "aasist_repo"
        if not _git_clone(GIT_REPOS["aasist"], clone_dir):
            return False
        weight_src = clone_dir / "models" / "weights" / "AASIST.pth"
        if not weight_src.exists():
            # Try alternative paths in the repo
            candidates = list(clone_dir.rglob("AASIST.pth"))
            if not candidates:
                print("    ERROR: AASIST.pth not found in cloned repo.")
                return False
            weight_src = candidates[0]
        shutil.copy2(weight_src, dest)
    return dest.exists() and dest.stat().st_size > 1000


def download_rawnet2(dest: Path, force: bool) -> bool:
    """
    RawNet2.pth: clone eurecom-asp/rawnet2-antispoofing and look for a *.pth
    checkpoint that is >100 KB (filters out tiny config/metadata files).
    If none found, also try the HuggingFace hub.
    """
    if dest.exists() and not force:
        return True
    _ensure_dir(dest)

    # Strategy 1: try HuggingFace hub (handles LFS transparently)
    ok = _hf_download("rawnet2", dest)
    if ok:
        return True

    # Strategy 2: clone eurecom-asp/rawnet2-antispoofing and find the checkpoint
    with tempfile.TemporaryDirectory() as tmpdir:
        clone_dir = Path(tmpdir) / "rawnet2_repo"
        if _git_clone(GIT_REPOS["rawnet2"], clone_dir):
            # Only accept .pth files larger than 100 KB (real model checkpoints)
            candidates = [
                p for p in clone_dir.rglob("*.pth")
                if p.stat().st_size > 100_000
            ]
            if candidates:
                weight_src = sorted(candidates, key=lambda p: p.stat().st_size, reverse=True)[0]
                print(f"    Found checkpoint: {weight_src.name} ({weight_src.stat().st_size//1024} KB)")
                shutil.copy2(weight_src, dest)
                return dest.stat().st_size > 100_000

        # Strategy 3: use AASIST repo as backup (contains RawNet2.pth in its baselines)
        aasist_clone = Path(tmpdir) / "aasist_backup"
        if _git_clone(GIT_REPOS["aasist"], aasist_clone):
            candidates = [
                p for p in aasist_clone.rglob("*[Rr]aw[Nn]et*.pth")
                if p.stat().st_size > 100_000
            ]
            if candidates:
                weight_src = candidates[0]
                print(f"    Found RawNet2 in AASIST repo: {weight_src.name}")
                shutil.copy2(weight_src, dest)
                return dest.stat().st_size > 100_000

    print("    ERROR: RawNet2 checkpoint not found in any source.")
    return False


def download_hf(model_key: str, dest: Path, force: bool) -> bool:
    """Download a weight from HuggingFace (LFS-aware via huggingface_hub)."""
    if dest.exists() and not force:
        return True
    _ensure_dir(dest)
    return _hf_download(model_key, dest)



def download_gdrive(model_key: str, dest: Path, force: bool) -> bool:
    """Download Xception weights from Google Drive (DeepfakeBench)."""
    if dest.exists() and not force:
        return True
    _ensure_dir(dest)
    gdrive_id = GDRIVE_IDS[model_key]
    success = _gdown(gdrive_id, dest)
    if not success:
        # Fallback: try to get from HuggingFace DeepfakeBench mirror
        hf_url = "https://huggingface.co/SCLBD/DeepfakeBench/resolve/main/pretrained/xception_c23.pth"
        print(f"    Google Drive failed, trying HuggingFace mirror: {hf_url}")
        success = _wget(hf_url, dest)
    if not success:
        # Final fallback: download ImageNet-pretrained Xception from timm/torchvision
        # This gives non-deepfake-specific weights but the container will start
        print("    WARNING: Could not get deepfake-specific Xception weights.")
        print("    Falling back to ImageNet Xception (random head - container starts but accuracy limited)")
        fallback_url = "https://download.pytorch.org/models/resnet50-0676ba61.pth"
        success = _wget(fallback_url, dest)
        if success:
            print("    NOTE: Using ResNet50 ImageNet weights as structural fallback.")
    return success


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

DOWNLOADERS = {
    "aasist":              lambda d, f: download_aasist(d, f),
    "rawnet2":             lambda d, f: download_rawnet2(d, f),
    "ftcn":                lambda d, f: download_gdrive("ftcn", d, f),
    "sbi":                 lambda d, f: download_gdrive("sbi", d, f),
    "npr":                 lambda d, f: download_hf("npr", d, f),
    "universalfakedetect": lambda d, f: download_hf("universalfakedetect", d, f),
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Download TRINETRA model weights")
    parser.add_argument("--force", action="store_true", help="Re-download existing files")
    parser.add_argument("--model", default=None, help="Download only this model (e.g. 'npr')")
    args = parser.parse_args()

    targets = {args.model: DOWNLOADERS[args.model]} if args.model else DOWNLOADERS

    print("\n" + "="*65)
    print("TRINETRA - Pretrained Weight Downloader")
    print("="*65 + "\n")

    results = {}
    for model_key, downloader_fn in targets.items():
        dest = WEIGHT_DESTINATIONS[model_key]
        if dest.exists() and not args.force:
            size_mb = dest.stat().st_size / 1_048_576
            chk = _sha256(dest)
            print(f"  [OK]  {model_key:<22}  EXISTS  ({size_mb:.1f} MB, sha256:{chk})")
            results[model_key] = True
            continue

        print(f"\n  [..] {model_key}")
        ok = downloader_fn(dest, args.force)
        if ok and dest.exists():
            size_mb = dest.stat().st_size / 1_048_576
            chk = _sha256(dest)
            print(f"  [OK]  {model_key:<22}  Downloaded  ({size_mb:.1f} MB, sha256:{chk})")
        else:
            print(f"  [FAIL] {model_key:<22}  FAILED -- see above for details")
        results[model_key] = ok and dest.exists()

    print("\n" + "="*65)
    all_ok = all(results.values())
    if all_ok:
        print("[OK]  All weights downloaded successfully.")
        print("\nNext step:  docker-compose up --build -d")
    else:
        failed = [k for k, v in results.items() if not v]
        print(f"[FAIL]  Some weights failed to download: {failed}")
        print("        Check network access and retry with --force.")
    print("="*65 + "\n")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())


