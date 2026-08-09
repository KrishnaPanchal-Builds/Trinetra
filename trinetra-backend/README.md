# TRINETRA Backend

This repository contains the TRINETRA backend API and model integration layer.

## Architecture

The TRINETRA backend uses an asynchronous architecture to handle compute-intensive deepfake detection models:
1. **FastAPI Gateway**: Handles HTTP requests, API key authentication, tier rate-limiting (Redis), and media upload.
2. **Celery Workers**: Background workers that perform actual file analysis.
3. **Model Containers**: Isolated microservices running inference code for different deepfake detection models (Audio: AASIST, RawNet2; Video: FTCN, SBI; Image: NPR, UniversalFakeDetect).
4. **MongoDB**: Stores task states, historical scan results, and API keys.
5. **Redis**: Message broker for Celery and in-memory store for rate-limiting token buckets.

## Getting Started (Local Development)

### Prerequisites
- Docker and Docker Compose
- Minimum 16GB RAM (due to multiple model containers)

### 1. Build and Start Services
From the root directory (`trinetra-backend`), run:
```bash
docker-compose up --build -d
```
This will start:
- FastAPI Gateway (`http://localhost:8000`)
- Celery Worker
- Redis (`localhost:6379`)
- MongoDB (`localhost:27017`)
- 6 Model Containers (on ports 8001-8006)

### 2. Verify Health
Run the health check script to ensure all services are up and model containers are responsive:
```bash
python scripts/health_check.py
```

### 3. Seed API Keys
The API requires authentication. Seed test and live API keys into the local MongoDB instance:
```bash
python scripts/seed_keys.py
```
This script will output valid `Bearer` tokens that you can use for testing.

## Handoff Package for Frontend Team

The `handoff_package/` directory contains:
- `postman_collection.json`: Import this into Postman or Insomnia to explore all available endpoints (Scan, Status, History, Keys, Webhooks, Health).
- `sample_webhook_payload.json`: An example of the final JSON payload emitted by the async pipeline.

### API Contract (OpenAPI/Swagger)
Once the gateway is running, the interactive OpenAPI documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

The frontend team can build the Sandbox, Dashboard, and Key Management UI completely against these specifications.
