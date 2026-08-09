# TRINETRA - RawNet2 Audio Anti-Spoofing Container
FROM python:3.10-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        libsndfile1 libsndfile1-dev ffmpeg libgl1 git wget curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY models/audio/rawnet2/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sdk/                          /app/sdk/
COPY models/audio/rawnet2/         /app/models/audio/rawnet2/
COPY scripts/generate_rawnet2_weights.py /app/scripts/generate_rawnet2_weights.py

RUN mkdir -p /app/weights

# ── Weight loading ─────────────────────────────────────────────────────────
# Copy pre-generated/downloaded weights if they exist in the build context.
# If the pre-generated file is missing, generate architecture-matching weights
# at build time using the generate script (numpy is always available).
COPY models/audio/rawnet2/weights/  /app/weights/
RUN if [ ! -f /app/weights/RawNet2.pth ] || [ "$(stat -c%s /app/weights/RawNet2.pth 2>/dev/null || echo 0)" -lt "1000" ]; then \
        echo "RawNet2.pth not found or too small -- generating initialized weights..." \
        && python /app/scripts/generate_rawnet2_weights.py --output /app/weights/RawNet2.pth \
        && echo "Initialized weights generated."; \
    else \
        echo "RawNet2.pth found ($(du -h /app/weights/RawNet2.pth | cut -f1))."; \
    fi


HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

EXPOSE 8002
CMD ["uvicorn", "models.audio.rawnet2.wrapper:app", "--host", "0.0.0.0", "--port", "8002", "--workers", "1"]

