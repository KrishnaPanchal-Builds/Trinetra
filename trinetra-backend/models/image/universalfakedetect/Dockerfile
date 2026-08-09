# TRINETRA — UniversalFakeDetect Container
FROM python:3.10-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1 libglib2.0-0 git wget curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Clone UFD repo for reference (weights download uses the repo's links)
ARG SKIP_REPO_CLONE=0
RUN if [ "$SKIP_REPO_CLONE" = "0" ]; then \
        git clone --depth 1 https://github.com/WisconsinAIVision/UniversalFakeDetect.git /app/ufd_repo \
        && echo "UFD repo cloned." \
        || echo "WARNING: UFD repo clone failed."; \
    fi

COPY models/image/universalfakedetect/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sdk/                                   /app/sdk/
COPY models/image/universalfakedetect/      /app/models/image/universalfakedetect/

RUN mkdir -p /app/weights
# ── Weight download ────────────────────────────────────────────────────────
# UFD classifier head weights are at HuggingFace siddharthksah/deepsafe-weights.
# The file is fc_weights.pth (linear classifier trained on CLIP ViT-L/14 features).
# We save it as UniversalFakeDetect.pth to match model_registry.json expectations.
ARG SKIP_WEIGHT_DOWNLOAD=0
RUN if [ "$SKIP_WEIGHT_DOWNLOAD" = "0" ]; then \
        echo "Downloading UniversalFakeDetect fc_weights from HuggingFace..." \
        && wget -q --show-progress -O /app/weights/UniversalFakeDetect.pth \
            "https://huggingface.co/siddharthksah/deepsafe-weights/resolve/main/universalfakedetect/fc_weights.pth" \
        && echo "UFD weights downloaded." \
        || echo "WARNING: UFD weights unavailable — container starts with random linear head."; \
    fi

ENV UFD_REPO_ROOT=/app/ufd_repo

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8006/health || exit 1

EXPOSE 8006
CMD ["uvicorn", "models.image.universalfakedetect.wrapper:app", "--host", "0.0.0.0", "--port", "8006", "--workers", "1"]
