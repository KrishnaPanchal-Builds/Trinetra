# TRINETRA - FTCN Video Deepfake Detection Container
FROM python:3.10-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1 libglib2.0-0 ffmpeg git wget curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Clone FTCN repo for native model (required for the native inference path)
ARG SKIP_REPO_CLONE=0
RUN if [ "$SKIP_REPO_CLONE" = "0" ]; then \
        git clone --depth 1 https://github.com/yinglinzheng/FTCN.git /app/ftcn_repo \
        && echo "FTCN repo cloned."; \
    fi

COPY models/video/ftcn/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sdk/                        /app/sdk/
COPY models/video/ftcn/          /app/models/video/ftcn/

# ── Weight download ────────────────────────────────────────────────────────
# Native FTCN+TT weights from the official GitHub release (no Google Drive / gdown needed).
# Single asset: ftcn_tt.pth (56.5 MB) at
#   https://github.com/yinglinzheng/FTCN/releases/download/weights/ftcn_tt.pth
#
# The native FTCN loader expects the checkpoint at:
#   {FTCN_REPO_ROOT}/checkpoints/ftcn_tt.pth
# We also copy it to /app/weights/ftcn.pth so the wrapper can find it at the
# standard WEIGHTS_PATH location for the Xception fallback path (kept as backup).
RUN mkdir -p /app/weights /app/ftcn_repo/checkpoints

ARG SKIP_WEIGHT_DOWNLOAD=0
RUN if [ "$SKIP_WEIGHT_DOWNLOAD" = "0" ]; then \
        echo "Downloading native FTCN+TT weights from GitHub release..." \
        && wget -q --show-progress \
            -O /app/ftcn_repo/checkpoints/ftcn_tt.pth \
            "https://github.com/yinglinzheng/FTCN/releases/download/weights/ftcn_tt.pth" \
        && cp /app/ftcn_repo/checkpoints/ftcn_tt.pth /app/weights/ftcn.pth \
        && echo "FTCN native weights downloaded ($(du -h /app/ftcn_repo/checkpoints/ftcn_tt.pth | cut -f1))."; \
    fi

ENV FTCN_REPO_ROOT=/app/ftcn_repo

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:8003/health || exit 1

EXPOSE 8003
CMD ["uvicorn", "models.video.ftcn.wrapper:app", "--host", "0.0.0.0", "--port", "8003", "--workers", "1"]
