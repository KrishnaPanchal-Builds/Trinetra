# --------------------------------------------------------------------------
# TRINETRA — NPR (Image Deepfake Detector) Container
# --------------------------------------------------------------------------
# Build context: trinetra-backend/models/image/npr/
# --------------------------------------------------------------------------

FROM python:3.10-slim

# System packages: libGL for OpenCV (used by PIL), wget for weight download
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        wget \
        curl \
        git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Python dependencies ──────────────────────────────────────────────────
# Pin versions to avoid silent API changes between builds.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application code ──────────────────────────────────────────────────────
# Copy shared SDK first (changes rarely → better layer caching)
COPY sdk/                  /app/sdk/

# Copy this model's source
COPY models/image/npr/     /app/models/image/npr/

# Create weights directory; actual weights are mounted or downloaded at
# runtime via the download script below.
RUN mkdir -p /app/weights

# ── Weight download (optional — runs only if weights/ is empty) ────────────
# The NPR repo ships weights as a GitHub release asset.
# Download at build time so the image is self-contained.
# If SKIP_WEIGHT_DOWNLOAD=1 is set (e.g., in dev/CI), skip this step.
ARG SKIP_WEIGHT_DOWNLOAD=0
RUN if [ "$SKIP_WEIGHT_DOWNLOAD" = "0" ]; then \
        wget -q -O /app/weights/npr.pth \
            "https://github.com/chuangchuangtan/NPR-DeepfakeDetection/releases/download/v1.0/NPR.pth" \
        && echo "NPR weights downloaded." \
        || echo "WARNING: could not download NPR weights — dev mode will use random weights."; \
    fi

# ── Healthcheck ───────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8005/health || exit 1

# ── Launch ────────────────────────────────────────────────────────────────
EXPOSE 8005
CMD ["uvicorn", "models.image.npr.wrapper:app", \
     "--host", "0.0.0.0", \
     "--port", "8005", \
     "--workers", "1"]
