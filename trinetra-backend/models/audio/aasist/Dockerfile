# TRINETRA — AASIST Audio Anti-Spoofing Container
FROM python:3.10-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        libsndfile1 libsndfile1-dev ffmpeg libgl1 git wget curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Clone AASIST repo (inference code + config + pretrained weights)
ARG SKIP_REPO_CLONE=0
RUN if [ "$SKIP_REPO_CLONE" = "0" ]; then \
        git clone --depth 1 https://github.com/clovaai/aasist.git /app/aasist_repo \
        && echo "AASIST repo cloned."; \
    fi

COPY models/audio/aasist/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY sdk/                        /app/sdk/
COPY models/audio/aasist/        /app/models/audio/aasist/

RUN mkdir -p /app/weights
# Weights are shipped inside the AASIST repo's 'models/weights/' directory.
# Copy them to the standard location after clone.
RUN if [ -f /app/aasist_repo/models/weights/AASIST.pth ]; then \
        cp /app/aasist_repo/models/weights/AASIST.pth /app/weights/AASIST.pth; \
    fi

ENV AASIST_REPO_ROOT=/app/aasist_repo

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

EXPOSE 8001
CMD ["uvicorn", "models.audio.aasist.wrapper:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]
