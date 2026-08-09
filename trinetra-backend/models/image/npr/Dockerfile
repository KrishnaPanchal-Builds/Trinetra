# --------------------------------------------------------------------------
# TRINETRA - NPR (Image Deepfake Detector) Container
# --------------------------------------------------------------------------
# Build context root: trinetra-backend/
# --------------------------------------------------------------------------

FROM python:3.10-slim

# System packages: libGL for OpenCV/PIL, wget for weight download
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        wget \
        curl \
        git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Python dependencies ──────────────────────────────────────────────────
# IMPORTANT: build context root is trinetra-backend/ so the path must be
# relative to that root, not just "requirements.txt".
COPY models/image/npr/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application code ──────────────────────────────────────────────────────
COPY sdk/                  /app/sdk/
COPY models/image/npr/     /app/models/image/npr/

RUN mkdir -p /app/weights

# ── Weight download ────────────────────────────────────────────────────────
# NPR weights (ResNet-50 fine-tuned on GAN upsampling artifacts).
#
# The siddharthksah/deepsafe-weights HuggingFace repo does NOT contain NPR.pth.
# Verified file tree: no npr/ folder, no NPR.pth at any path.
#
# Source: chuangchuangtan/NPR-DeepfakeDetection Google Drive
# (no official direct download URL — weights are distributed via the paper's GDrive).
# We copy the pre-downloaded weights from the build context instead.
# If not present, the container falls back to random weights (dev mode).
COPY models/image/npr/weights/ /app/weights/

RUN if [ -f /app/weights/npr.pth ] && [ "$(stat -c%s /app/weights/npr.pth)" -gt "10000" ]; then \
        echo "NPR weights found ($(du -h /app/weights/npr.pth | cut -f1))."; \
    else \
        echo "WARNING: NPR weights not found or too small. Container starts in dev mode (random weights)."; \
        echo "To fix: obtain npr.pth from chuangchuangtan/NPR-DeepfakeDetection and place in models/image/npr/weights/"; \
    fi

# ── Healthcheck ───────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8005/health || exit 1

# ── Launch ────────────────────────────────────────────────────────────────
EXPOSE 8005
CMD ["uvicorn", "models.image.npr.wrapper:app", \
     "--host", "0.0.0.0", \
     "--port", "8005", \
     "--workers", "1"]
