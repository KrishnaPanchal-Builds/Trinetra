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
ARG SKIP_WEIGHT_DOWNLOAD=0
RUN if [ "$SKIP_WEIGHT_DOWNLOAD" = "0" ]; then \
        wget -q -O /app/weights/sbi_xception.pth \
            "https://github.com/SCLBD/DeepfakeBench/releases/download/v1.0.0/sbi.pth" \
        && echo "SBI weights downloaded." \
        || echo "WARNING: SBI weights unavailable — dev mode."; \
    fi

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8004/health || exit 1

EXPOSE 8004
CMD ["uvicorn", "models.video.sbi.wrapper:app", "--host", "0.0.0.0", "--port", "8004", "--workers", "1"]
