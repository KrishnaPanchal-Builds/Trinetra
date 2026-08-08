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
# FTCN weights via DeepfakeBench releases or FTCN repo releases
ARG SKIP_WEIGHT_DOWNLOAD=0
RUN if [ "$SKIP_WEIGHT_DOWNLOAD" = "0" ]; then \
        wget -q -O /app/weights/ftcn.pth \
            "https://github.com/SCLBD/DeepfakeBench/releases/download/v1.0.0/ftcn.pth" \
        && echo "FTCN weights downloaded." \
        || echo "WARNING: FTCN weights unavailable — dev mode."; \
    fi

ENV FTCN_REPO_ROOT=/app/ftcn_repo

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8003/health || exit 1

EXPOSE 8003
CMD ["uvicorn", "models.video.ftcn.wrapper:app", "--host", "0.0.0.0", "--port", "8003", "--workers", "1"]
