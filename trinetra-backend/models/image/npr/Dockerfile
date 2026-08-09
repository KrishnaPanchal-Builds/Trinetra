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

# ── Weight download ────────────────────────────────────────────────────────
# NPR.pth is hosted on HuggingFace (siddharthksah/deepsafe-weights).
# The GitHub release URL does not exist; the HuggingFace URL is authoritative.
# If SKIP_WEIGHT_DOWNLOAD=1 (dev/CI), skip this step.
ARG SKIP_WEIGHT_DOWNLOAD=0
RUN if [ "$SKIP_WEIGHT_DOWNLOAD" = "0" ]; then \
        echo "Downloading NPR weights from HuggingFace..." \
        && wget -q --show-progress -O /app/weights/npr.pth \
            "https://huggingface.co/siddharthksah/deepsafe-weights/resolve/main/NPR.pth" \
        && echo "NPR weights downloaded (HuggingFace)." \
        || ( echo "WARNING: HuggingFace download failed. Trying secondary source..." \
             && wget -q -O /app/weights/npr.pth \
                "https://huggingface.co/datasets/siddharthksah/deepsafe-weights/resolve/main/NPR.pth" \
             && echo "NPR weights downloaded (secondary)." \
             || echo "WARNING: could not download NPR weights — container starts in dev mode." ); \
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
