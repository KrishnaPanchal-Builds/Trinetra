# TRINETRA — FTCN Video Deepfake Detection Container
FROM python:3.10-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1 libglib2.0-0 ffmpeg git wget curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Clone FTCN repo for native model (optional; fallback to XceptionNet if absent)
ARG SKIP_REPO_CLONE=0
RUN if [ "$SKIP_REPO_CLONE" = "0" ]; then \
        git clone --depth 1 https://github.com/yinglinzheng/FTCN.git /app/ftcn_repo \
        && echo "FTCN repo cloned." \
        || echo "WARNING: FTCN repo clone failed. Will use XceptionNet fallback."; \
    fi

COPY models/video/ftcn/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sdk/                        /app/sdk/
COPY models/video/ftcn/          /app/models/video/ftcn/

RUN mkdir -p /app/weights
# ── Weight download ────────────────────────────────────────────────────────
# FTCN uses an Xception backbone (XceptionFallback in wrapper.py).
# We use DeepfakeBench's Xception c23 weights (trained on FaceForensics++).
# Strategy:
#   1. gdown from DeepfakeBench Google Drive (official).
#   2. HuggingFace SCLBD mirror.
#   3. ResNet50 ImageNet weights as structural fallback (container starts, accuracy limited).
ARG SKIP_WEIGHT_DOWNLOAD=0
RUN if [ "$SKIP_WEIGHT_DOWNLOAD" = "0" ]; then \
        pip install --no-cache-dir gdown \
        && echo "Downloading FTCN/Xception weights from DeepfakeBench..." \
        && ( gdown --fuzzy \
                "https://drive.google.com/uc?id=1A7ViPGx14DwYE2jIcGsaBLFJhNPsWpKM" \
                -O /app/weights/ftcn.pth \
             && echo "FTCN weights downloaded (Google Drive)." ) \
        || ( echo "Trying HuggingFace SCLBD mirror..." \
             && wget -q --show-progress -O /app/weights/ftcn.pth \
                "https://huggingface.co/SCLBD/DeepfakeBench/resolve/main/pretrained/xception_c23.pth" \
             && echo "FTCN weights downloaded (HuggingFace)." ) \
        || ( echo "WARNING: Could not get deepfake-trained Xception. Using ImageNet ResNet50 fallback..." \
             && wget -q -O /app/weights/ftcn.pth \
                "https://download.pytorch.org/models/resnet50-0676ba61.pth" \
             && echo "FTCN structural fallback weights downloaded." ) \
        || echo "WARNING: FTCN weights unavailable — container starts in dev mode."; \
    fi

ENV FTCN_REPO_ROOT=/app/ftcn_repo

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8003/health || exit 1

EXPOSE 8003
CMD ["uvicorn", "models.video.ftcn.wrapper:app", "--host", "0.0.0.0", "--port", "8003", "--workers", "1"]
