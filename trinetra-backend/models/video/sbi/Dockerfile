# TRINETRA — SBI Video/Face-Swap Detection Container
FROM python:3.10-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1 libglib2.0-0 ffmpeg git wget curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY models/video/sbi/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sdk/                       /app/sdk/
COPY models/video/sbi/          /app/models/video/sbi/

RUN mkdir -p /app/weights
# ── Weight download ────────────────────────────────────────────────────────
# NOTE: The original SBI repo (mapooon/SelfBlendedImages) uses EfficientNet-B4
# and is research-only (commercial license required from author).
# DECISION: We use DeepfakeBench's Xception c23 weights instead, which match
# the XceptionSBI architecture in wrapper.py and avoid the license issue.
# Strategy:
#   1. gdown from DeepfakeBench Google Drive (Xception c23, trained on FF++).
#   2. HuggingFace SCLBD mirror.
#   3. ResNet50 ImageNet structural fallback.
ARG SKIP_WEIGHT_DOWNLOAD=0
RUN if [ "$SKIP_WEIGHT_DOWNLOAD" = "0" ]; then \
        pip install --no-cache-dir gdown \
        && echo "Downloading SBI/Xception weights from DeepfakeBench..." \
        && ( gdown --fuzzy \
                "https://drive.google.com/uc?id=1A7ViPGx14DwYE2jIcGsaBLFJhNPsWpKM" \
                -O /app/weights/sbi_xception.pth \
             && echo "SBI weights downloaded (Google Drive)." ) \
        || ( echo "Trying HuggingFace SCLBD mirror..." \
             && wget -q --show-progress -O /app/weights/sbi_xception.pth \
                "https://huggingface.co/SCLBD/DeepfakeBench/resolve/main/pretrained/xception_c23.pth" \
             && echo "SBI weights downloaded (HuggingFace)." ) \
        || ( echo "WARNING: Using ResNet50 ImageNet structural fallback..." \
             && wget -q -O /app/weights/sbi_xception.pth \
                "https://download.pytorch.org/models/resnet50-0676ba61.pth" \
             && echo "SBI structural fallback weights downloaded." ) \
        || echo "WARNING: SBI weights unavailable — container starts in dev mode."; \
    fi

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8004/health || exit 1

EXPOSE 8004
CMD ["uvicorn", "models.video.sbi.wrapper:app", "--host", "0.0.0.0", "--port", "8004", "--workers", "1"]
