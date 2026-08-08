# TRINETRA — RawNet2 Audio Anti-Spoofing Container
FROM python:3.10-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        libsndfile1 libsndfile1-dev ffmpeg libgl1 git wget curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY models/audio/rawnet2/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sdk/                          /app/sdk/
COPY models/audio/rawnet2/         /app/models/audio/rawnet2/

RUN mkdir -p /app/weights
# RawNet2 weights are in the AASIST repo or downloadable from the RawNet repo.
# Download attempt at build time; fallback to dev mode if unavailable.
ARG SKIP_WEIGHT_DOWNLOAD=0
RUN if [ "$SKIP_WEIGHT_DOWNLOAD" = "0" ]; then \
        wget -q -O /app/weights/RawNet2.pth \
            "https://github.com/Jungjee/RawNet/raw/master/models/pretrained/RawNet2.pth" \
        && echo "RawNet2 weights downloaded." \
        || echo "WARNING: RawNet2 weights unavailable — dev mode."; \
    fi

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

EXPOSE 8002
CMD ["uvicorn", "models.audio.rawnet2.wrapper:app", "--host", "0.0.0.0", "--port", "8002", "--workers", "1"]
