# TRINETRA: Multimodal Digital-Evidence Triage Infrastructure

*Version 2.0 — updated with architectural enhancements informed by the open-source DeepSafe deepfake-detection platform*

---

## 1. Problem Statement & Strategic Drivers

### Problem Statement PS-4: Universal Cross-Modal Deepfake Detection Platform

**The Core Challenge**

Conventional deepfake verification systems rely on binary classification architectures that output a single probability score indicating whether media is synthetic. This paradigm fails in enterprise environments due to severe model generalization degradation when encountering out-of-distribution manipulation techniques.

Modern generative media attacks rarely involve whole-image or full-video replacements. Threat vectors prioritize localized, multi-vector alterations — cloning a brief audio segment over authentic video footage, adjusting lip synchronization, swapping a face in a still profile photo, or altering embedded document metadata. When platforms receive thousands of concurrent uploads per second, running heavy monolithic AI models synchronously causes server crashes and timeouts.

**Strategic Drivers ("Why Now?")**

- **2026 IT Rules Amendment:** Regulatory mandates enforce a strict 3-hour (180-minute) content takedown window for flagged deepfakes. Missing this window revokes a platform's "Safe Harbour" protection under Section 79 of the IT Act, exposing platform executives to direct legal liability.
- **Escalation of Synthetic Fraud:** Commercial availability of generative voice and video tools has driven a 60% surge in synthetic media creation tools, contributing to a tenfold increase in deepfake-related financial fraud and impersonation attacks.
- **Standardization Maturity:** Cryptographic provenance standards like C2PA Content Credentials, alongside public benchmarks such as DeepfakeBench-MM (Mega-MMDF dataset), provide the infrastructure required to calibrate multi-layer cross-modal verification engines.

---

## 2. Executive Solution & Value Proposition

### The Solution

TRINETRA is an enterprise-grade, asynchronous B2B Digital-Evidence Triage Infrastructure delivered as a Headless API. Rather than classifying media through a monolithic black-box score, TRINETRA constructs a structured **Evidence Graph** derived from four independent verification layers, fused through a trained scoring model rather than hand-written rules:

```
[ Incoming Media Upload ]
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Cryptographic Provenance (C2PA Manifest Check)      │
└──────────────────────────┬────────────────────────────────────┘
                           │ (If Unsigned)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Forensic Modality Isolation (Audio, Video & Image AI)│
└──────────────────────────┬────────────────────────────────────┘
                           │ (Parallel Streams, per modality present)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Cross-Modal Consistency (Phoneme-Viseme Alignment)  │
└──────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Uploader Declaration Cross-Checking                 │
└──────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Fusion Layer: Trained Stacking Meta-Learner                  │
└──────────────────────────┬────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Output: Authenticity Evidence Score (AES) + Legal PDF Audit  │
└─────────────────────────────────────────────────────────────┘
```

**What changed from v1:** Layer 2 now explicitly covers static images (not just video frames), and a distinct **Fusion Layer** has been elevated out of the cross-modal check into its own trained component — see Section 7.

### Core Value Proposition

The platform generates an Authenticity Evidence Score (AES) paired explicitly with model confidence bounds (e.g., `AES: 31/100 — High Risk; Model Confidence: High`). It pairs this score with an automated, legally defensible PDF audit report containing temporal anomaly timestamps, spectral evidence, and — new in v2 — a **per-model result breakdown**, allowing platform trust, safety, and legal teams to act within statutory takedown windows without trusting a single opaque number.

---

## 3. Target Audience & Beneficiaries

TRINETRA is built exclusively as a B2B Infrastructure API. The general public does not interact directly with the portal; instead, tech platform engineering teams integrate the API layer into their upload pipelines.

| Beneficiary Category | Industry Examples | Specific Operational Pain Point | How TRINETRA Solves It |
|---|---|---|---|
| Social Media & Short Video | ShareChat, Moj, Chingari, Instagram India | Millions of hourly video/image uploads; risk losing Safe Harbour under 3-hour takedown rules. | Asynchronously scans uploads in seconds; pushes webhooks to auto-block high-risk deepfakes instantly. |
| Matrimony & Dating Apps | Shaadi.com, Bumble, Tinder | Profile impersonation, cloned voice prompts, identity forgery, and **AI-generated fake profile photos**. | Verifies video profile uploads, audio prompts, and **static profile images** during registration. |
| FinTech & Video KYC | Identity Verification Providers, Banking Apps | Facial re-enactment attacks, synthetic voice spoofing, and **forged ID document photos** during onboarding. | Provides micro-second liveness, spectral analysis, and **document image forensics** during onboarding. |
| Digital Newsrooms & Media | Dailyhunt, Inshorts, Regional Outlets | Unverified citizen journalism videos and images leading to defamation or misinformation liability. | Generates immutable, audit-ready evidence PDF packages verifying asset authenticity prior to broadcast. |

---

## 4. Architectural Features Derived from Prior Art

To ensure enterprise feasibility, TRINETRA incorporates core architectural design choices from three distinct sources: two government-backed research initiatives (for forensic rigor) and one production-grade open-source platform (for engineering extensibility).

**Derived from 'Saakshya' (IIT Jodhpur & IIT Madras)**
- *Multi-Agent / Multi-Layer Framework:* Rather than relying on a single AI model, TRINETRA adopts Saakshya's philosophy of specialized verification agents operating across distinct inspection domains (provenance, visual artifacts, audio spectral anomalies, image artifacts, and contextual declarations).
- *Contextual Verification:* Cross-references physical evidence against contextual metadata (e.g., checking if audio matches visual movement rather than evaluating streams in isolation).

**Derived from 'AI Vishleshak' (IIT Mandi & HP Directorate of Forensic Services)**
- *Forensic Admissibility & Audit Reports:* Incorporates AI Vishleshak's focus on forensic evidence generation by outputting downloadable, tamper-proof PDF audit logs containing timestamped anomaly frames, spectral heatmaps, and per-model attribution suitable for legal review.
- *Uncertainty Calibration:* Avoids binary classification errors by implementing explicit confidence intervals, preventing false positives on out-of-distribution media.

**Derived from 'DeepSafe' (open-source ensemble deepfake platform)**
- *Plug-in Model Contract:* Every forensic model — regardless of modality — exposes the same two endpoints (`GET /health`, `POST /predict`), letting new detectors be added via a config entry rather than a gateway rewrite.
- *Trained Ensemble Fusion:* Instead of hand-written aggregation rules, model outputs feed a trained stacking meta-learner that is benchmarked and periodically retrained.
- *Benchmark-Gated Retraining:* Model updates are validated against a maintained multi-modal benchmark before deployment, directly countering the generalization-decay problem described in PS-4.

**The Commercial Differentiation**

While Saakshya and AI Vishleshak serve as deep forensic tools designed for law enforcement and government regulators with multi-minute analysis timelines, and DeepSafe is architected as a single-node synchronous ensemble for direct end-user testing, TRINETRA is built for **commercial scale** — utilizing asynchronous task queuing, a plug-in model registry, and a trained fusion layer to handle millions of high-throughput consumer uploads within seconds, without sacrificing the auditability that legal teams require.

---

## 5. Pre-Trained Models, Open-Source Tools, & Integration Plan

To achieve production readiness without reinventing baseline AI architectures, TRINETRA orchestrates proven, open-source models inside isolated containers, each conforming to a shared plug-in contract.

```
                  ┌────────────────────────────────────────────┐
                  │           FastAPI Service Gateway           │
                  └────────────────────┬───────────────────────┘
                                       │
                       ┌───────────────┼────────────────┐
                       ▼               ▼                ▼
        ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
        │ Docker Container 1 │ │ Docker Container 2 │ │ Docker Container 3 │
        │ (Audio Forensics)  │ │ (Video Forensics)  │ │ (Image Forensics)  │  ◄── NEW
        │ • AASIST           │ │ • FTCN              │ │ • NPR              │
        │ • RawNet3          │ │ • SBI / MesoNet     │ │ • UniversalFakeDetect (CLIP-based) │
        │ • PyTorch + librosa│ │ • PyTorch + OpenCV  │ │ • PyTorch + CLIP    │
        └──────────┬──────────┘ └──────────┬──────────┘ └──────────┬──────────┘
                   │                       │                       │
                   └───────────────────────┼───────────────────────┘
                                           ▼
                  ┌────────────────────────────────────────────┐
                  │   Model Registry & Health-Check Gate        │  ◄── NEW
                  │   • Standard GET /health, POST /predict     │
                  │   • Single config file lists active models  │
                  └────────────────────┬───────────────────────┘
                                       ▼
                  ┌────────────────────────────────────────────┐
                  │       C2PA Rust SDK (c2pa-rs)                │
                  │   • Cryptographic Manifest Parsing           │
                  └────────────────────┬───────────────────────┘
                                       ▼
                  ┌────────────────────────────────────────────┐
                  │      Fusion Layer: Stacking Meta-Learner     │  ◄── NEW (see Section 7)
                  └────────────────────┬───────────────────────┘
                                       ▼
                  ┌────────────────────────────────────────────┐
                  │           ReportLab Engine                   │
                  │   • Automated PDF Evidence Generation        │
                  └────────────────────────────────────────────┘
```

### Pre-Trained Models & Libraries

**Audio Anti-Spoofing:**
- **AASIST** (Audio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention Networks): Analyzes speech spectrograms to detect voice cloning, synthetic acoustic voids, and phase inconsistencies.
- **RawNet3:** Processes raw end-to-end audio waveforms directly, bypassing spectrogram conversion to accelerate screening throughput.

**Visual & Video Anomaly Detection:**
- **FTCN** (Frequency-Temporal Convolutional Network): Identifies temporal inconsistencies, flickering, and frame-to-frame boundary discrepancies across video sequences.
- **SBI** (Self-Blended Images): Detects synthetic face-swapping and blending boundary artifacts along jawlines and eyes.
- **DeepfakeBench Ecosystem:** Provides standardized pre-trained weights for baseline architectures including MesoNet and XceptionNet.

**Static Image Detection — NEW:**
- **NPR** (Neural Pattern Recognition): Catches subtle, generator-specific pixel-level artifacts left behind by GAN/diffusion upsampling.
- **UniversalFakeDetect:** A CLIP-based detector trained to generalize across unseen generators rather than overfitting to one — the single best mitigation for the out-of-distribution generalization problem named in PS-4.

**Metadata & Provenance Tools:**
- **c2pa-rs** (C2PA Rust SDK / c2patool): Extracts cryptographic manifests and signatures embedded by generative tools (e.g., Midjourney, ElevenLabs).
- **FFmpeg & OpenCV:** Handles spatial demuxing, video frame extraction (at 3 fps sampling), and audio channel isolation (`.wav` extraction).
- **ReportLab:** Constructs structured PDF evidence documents containing temporal anomaly timelines, evidence graph visuals, and per-model attribution tables.

### Model Registry & Plug-in SDK — NEW

Each forensic model, regardless of modality, is wrapped in a thin SDK layer that standardizes:
- `GET /health` — liveness/readiness check, polled by the gateway before job dispatch
- `POST /predict` — accepts a decoded media segment, returns a probability + class

New detectors (e.g., a next-generation voice-cloning model, or a detector tuned for a newly released video generator) are added by implementing a single `predict()` method and registering the container in one central config file — the Celery orchestration layer and Fusion Engine require no changes. This keeps TRINETRA's detection capability upgradeable at the same pace new generative attacks appear, without a re-architecture each time.

**Model weight versioning:** All deployed weights are mirrored in a versioned, checksummed registry (e.g., an internal artifact store or HuggingFace-style mirror). Every AES score and PDF audit report references the exact weight-version hash used to produce it — this is required for legal admissibility, since a report produced today must remain reproducible and explainable if challenged in court months later.

### Integration Strategy (Docker Isolation)

To resolve dependency conflicts across frameworks (e.g., varying PyTorch or CUDA version requirements), each model domain runs within its own Docker microservice container. The API Gateway routes separated audio tracks, extracted video frames, or standalone images to the relevant container independently, gated by the health-check step described above.

---

## 6. End-to-End System Architecture

To process heavy video files without risking HTTP connection timeouts or server crashes, TRINETRA uses an Asynchronous Task Queue Architecture.

```
[ Client App ] ──► (POST /scan-media) ──► [ FastAPI Gateway ] ──► [ Redis Task Queue ]
      ▲                                         │                         │
      │                                 (0.1s Immediate 202)              │
      │                                                                   ▼
[ Client Webhook ] ◄── (JSON Payload + PDF) ◄── [ MongoDB Atlas ] ◄── [ Celery GPU Workers ]
                                                     (Audit Log)        (Inference Cluster)
```

### Stack Components

- **API & Gateway Layer:** Python FastAPI (high-performance asynchronous HTTP handling).
- **Message Broker:** Redis (in-memory task queuing to buffer high-concurrency requests).
- **Asynchronous Processing Engine:** Celery Workers hooked to GPU instances (NVIDIA CUDA).
- **Containerization:** Docker & Docker Compose (isolating PyTorch, OpenCV, CLIP, and C2PA environments).
- **Database & Persistence:** MongoDB Atlas (logs task IDs, AES scores, per-model results, anomaly timestamps, model weight versions, and PDF URLs; raw media files are purged post-analysis to maintain DPDP Act privacy compliance).
- **Client Frontend & Dashboard:** Next.js, React, Tailwind CSS (for API key management, usage monitoring, and manual triage viewing).

### Health-Check Gate — NEW

Before a Celery worker dispatches a task to a model container, it verifies that container's `GET /health` status. Unhealthy containers are routed around rather than causing a hard task failure — the Fusion Layer is informed which modalities were actually evaluated, and the confidence bound is adjusted downward accordingly. This graceful-degradation behavior is critical for reliably hitting the 180-minute statutory SLA even during partial infrastructure outages.

---

## 7. Fusion Layer & Scoring Methodology — NEW SECTION

TRINETRA's central claim is that it avoids monolithic black-box classification. To make that true at the *aggregation* level and not just the *individual model* level, the Fusion Layer is a trained component, not a set of hand-written rules.

### Feature Vector

For each submitted asset, the Fusion Layer assembles a feature vector from whichever of the following are available for the modalities present:

- AASIST spectro-temporal anomaly score
- RawNet3 raw-waveform anomaly score
- FTCN temporal-inconsistency score
- SBI blending-artifact score
- NPR pixel-artifact score (image)
- UniversalFakeDetect generalization score (image)
- Phoneme-viseme alignment delta (cross-modal)
- Uploader declaration mismatch flag
- C2PA manifest presence flag

### Fusion Strategy

Rather than a single fixed rule, the Fusion Layer supports three interchangeable strategies, evaluated and benchmarked against each other:

| Method | How it works | When used |
|---|---|---|
| Voting | Majority vote across available model outputs | Fast fallback when only 1–2 modalities are present |
| Averaging | Mean of available model probability scores | Baseline / sanity-check comparison |
| **Stacking (primary)** | A trained meta-learner (candidate pool: Logistic Regression, Random Forest, Gradient Boosting, SVM, KNN, Naive Bayes, XGBoost, LightGBM) is trained on the feature vector; the best-performing candidate by cross-validated accuracy is deployed | Production default |

The stacking meta-learner's own out-of-fold prediction variance in the relevant region of feature space is used to derive the **Model Confidence** bound reported alongside the AES (e.g., `High` / `Medium` / `Low`) — giving that field an actual statistical basis rather than a qualitative label.

### Benchmark-Gated Retraining Pipeline

1. **Health-check** every active model container.
2. **Run inference** across a maintained, multi-modal benchmark dataset — built on DeepfakeBench-MM / Mega-MMDF and continuously extended with samples from newly released generators (e.g., Sora, Gen-2, Moonvalley, LaVie, ModelScope for video; HiFiGAN, MelGAN, WaveGlow, Tacotron, ASVspoof attacks for audio; DALL·E, Midjourney, Stable Diffusion, Flux, Imagen for images).
3. **Retrain** the stacking meta-learner against fresh benchmark results.
4. **Canary-deploy** the best-performing candidate; roll back automatically if held-out accuracy regresses.

This loop is scheduled to run on a fixed cadence and triggered ad hoc whenever a new generator family is added to the benchmark — this is the direct, concrete answer to PS-4's "generalization degradation" problem, rather than a one-time model calibration that decays over time.

### Per-Model Transparency

Every fused AES is delivered alongside the individual model scores that produced it (see the updated webhook payload in Section 8). This means a legal or trust & safety reviewer can see *which specific detector* flagged an asset and why, rather than trusting a single fused number — TRINETRA practices the "no black box" principle at the ensemble layer, not only at the individual-model layer.

---

## 8. Step-by-Step Working Workflow

```
[00:00.0s] Ingestion ──► [00:00.1s] Fast-Return ──► [00:02.0s] C2PA Tier 1 ──► [00:04.0s] Demuxing
                                                                                   │
[00:18.0s] Webhook Callback ◄── [00:15.0s] Fusion Layer ◄── [00:10.0s] Parallel Modality AI
```

1. **Ingestion & Instant Receipt (0.0s – 0.1s):** The client's server sends a media payload via `POST /api/v1/scan-media`. The FastAPI gateway validates the API key, drops the file into temporary storage, pushes a job ticket into Redis, and returns a `202 Accepted` response with a unique `task_id` in under 100 milliseconds.

2. **Tier 1 Cryptographic Fast-Fail (0.1s – 2.0s):** A Celery worker picks up the task. The `c2pa-rs` library parses the file headers. If an official AI watermark (e.g., a C2PA manifest from a generative tool) is detected, processing halts immediately. The asset is assigned an AES of 99/100 (Synthetic), saving GPU compute.

3. **Modality Demuxing, Health Check & Queuing (2.0s – 4.0s):** If no metadata is present, the gateway determines which modalities are present (audio, video, and/or static image), verifies the health of the corresponding model containers, and dispatches accordingly. FFmpeg isolates the audio channel into a `.wav` file and samples video frames at 3 frames per second (fps); static images are passed directly to the Image Forensics container.

4. **Parallel AI Inference (4.0s – 12.0s):**
   - *Audio track:* passed to AASIST and RawNet3 to evaluate spectro-temporal anomalies and voice cloning artifacts.
   - *Video frames:* passed to FTCN/SBI to analyze facial bounding boxes and temporal continuity.
   - *Static images:* passed to NPR and UniversalFakeDetect to evaluate pixel-level and generator-agnostic artifacts.

5. **Cross-Modal Synchronization & Declaration Check (12.0s – 15.0s):** The Fusion Layer compares spoken phonemes against visual lip movements (visemes). If audio exhibits high synthetic probability while visual frames appear real, it flags an "Audio-Dubbed Deepfake." The engine cross-references this against the uploader's declaration string (e.g., "Original Footage") to check for misrepresentation.

6. **Fusion & Scoring (15.0s):** The trained stacking meta-learner combines all available modality scores plus the cross-modal and declaration signals into a single AES with a statistically-grounded confidence bound.

7. **Report Generation & Webhook Delivery (15.0s – 18.0s):** ReportLab generates an audit PDF, now including a per-model attribution table and the model weight-version hashes used. The result payload is fired directly to the client platform's registered webhook URL:

```json
{
  "task_id": "trk_982347110_x",
  "authenticity_evidence_score": 31,
  "risk_level": "HIGH_RISK",
  "confidence_interval": "HIGH",
  "primary_anomaly": "SYNTHETIC_AUDIO_DUBBING",
  "anomaly_timestamps": [
    { "start": "00:31", "end": "00:39" }
  ],
  "modalities_scanned": ["audio", "video"],
  "model_results": {
    "aasist": { "probability": 0.94, "class": "synthetic" },
    "rawnet3": { "probability": 0.88, "class": "synthetic" },
    "ftcn": { "probability": 0.12, "class": "authentic" },
    "sbi": { "probability": 0.09, "class": "authentic" },
    "phoneme_viseme_alignment_delta": 0.71
  },
  "fusion_method_used": "stacking",
  "model_weight_versions": {
    "aasist": "v3.2.1-a9f31c",
    "rawnet3": "v2.0.0-77e21b",
    "ftcn": "v1.4.0-1c88de",
    "sbi": "v1.1.2-30af5e"
  },
  "c2pa_manifest_present": false,
  "uploader_declaration_mismatch": true,
  "action_recommendation": "AUTO_HOLD_FOR_HUMAN_TRIAGE",
  "audit_pdf_report_url": "https://api.trinetra.ai/reports/trk_982347110_x.pdf"
}
```

### Handling Massive Simultaneous Traffic

If a client platform has 50,000 users uploading videos at the exact same time, a standard synchronous API will freeze, timeout, and crash the server. TRINETRA's Asynchronous Task Queue Architecture is best visualized as a large fast-food kitchen:

- **Step 1 — The API Gateway (Front Desk):** When the client's app sends 10,000 videos to `POST /api/v1/scan-media`, the FastAPI gateway does not process them inline. It instantly saves the files to temporary cloud storage (e.g., AWS S3) and replies in 0.1 seconds with a `202 Accepted` status and a unique `task_id`. This frees the connection immediately, letting the API accept the next 10,000 requests without crashing.
- **Step 2 — The Redis Queue (Ticket Rail):** FastAPI drops the task references into Redis, an extremely fast in-memory waiting line that safely holds thousands of tasks in order.
- **Step 3 — Celery Workers & Docker (The GPU Kitchen):** A fleet of background workers, managed by Celery and running inside isolated, health-checked Docker containers on GPUs, constantly pull from the Redis queue. Each worker splits the media by modality and routes it to the appropriate forensic container(s). Because workers operate independently of the front-facing API, they scale dynamically — if traffic spikes, the cloud provider spins up additional GPU workers to drain the queue faster.
- **Step 4 — The Webhook Callback (Delivery):** Once the Fusion Layer produces the final AES, TRINETRA doesn't wait for the client to poll. The server fires an HTTP POST (webhook) directly to the client's registered URL with the JSON score, per-model breakdown, and audit PDF link — all within roughly 15–18 seconds of the user hitting "upload."

---

## 9. B2B Platform Integration Method

Integration requires minimal effort from client engineering teams.

**1. API Key Authentication**
Client platforms generate a secure bearer token inside the TRINETRA Next.js Developer Portal.

**2. File Submission Endpoint**
When a user uploads content, the client backend forwards the media stream to TRINETRA:

```
POST https://api.trinetra.ai/v1/scan-media
Headers: Authorization: Bearer <API_KEY>
Body: multipart/form-data containing file and uploader_declaration
```

**3. Asynchronous Webhook Listener**
The client backend registers a callback route (e.g., `https://client-platform.com/api/deepfake-webhook`). Upon analysis completion, TRINETRA posts the structured JSON payload (Section 8) to this route, triggering auto-takedown or moderation flags inside the client's system.

---

## 10. UI/UX Features for the Developer Portal

Since TRINETRA's customers are engineering and legal teams, the UI must be highly technical, transparent, and self-serve.

- **The Sandbox / Playground:** Before committing, developers want to test the AI. The site includes a drag-and-drop UI where they can upload a 10-second video, audio clip, or image and instantly see the API's JSON response — including the new per-model breakdown — and the generated PDF report.
- **API Key & Webhook Management:** An interface where users generate `Test_Keys` (free, heavily rate-limited) and `Live_Keys`, plus a simple input field to register their webhook URL for receiving automated alerts.
- **The "Triage Dashboard":** Client legal teams log in to visually review flagged content — a historical list of all High-Risk media, linking directly to the visual timeline, per-model attribution, and PDF audit logs. (Backing store follows a simple JWT-auth + history-log pattern for fast, reliable implementation.)
- **Real-Time Metering & Spend Limits:** A billing tab with live charts of API calls made today, plus a "Hard Cap" toggle: *"Stop processing if my bill hits $500 this month."*

### The Developer User Flow

1. **Discovery:** Lands on the Homepage, reads the API documentation, sees the value proposition.
2. **Validation (The Sandbox):** Tests the AI right on the website without writing any code or creating an account.
3. **Onboarding:** Creates an account and logs into the DevHub Dashboard.
4. **Configuration:** Generates a set of API keys and registers their webhook URL.
5. **Contracting & Billing:** Selects a subscription tier or buys prepaid processing tokens.
6. **Monitoring:** Uses the dashboard to track API usage, view flagged deepfakes, and manage billing limits.

---

## 11. UI/UX Component Breakdown

**A. The Landing Page (The Hook)**
- Hero Section: a bold headline such as *"Automated IT Rule Compliance API for UGC Platforms."*
- Live Code Snippet: a dark-mode block showing a 5-line Python/cURL snippet for sending media to the API.
- Feature Grid: highlighting the multi-layer architecture (now including image forensics), webhook delivery, and automated PDF audit generation.

**B. The Sandbox / Playground (The Proof)**
- The UI: a drag-and-drop upload zone on the left, dual-panel response window on the right.
- How it works: the user uploads a sample file. The Next.js frontend sends it to the FastAPI backend; a loading animation plays; within seconds the right panel populates with the raw JSON response (including the `authenticity_evidence_score` and per-model breakdown) and an embedded PDF viewer showing the generated audit report.
- Why it matters: it proves the API actually works before a client spends a dime.

**C. API Key & Webhook Management (The Engine Room)**
- API Keys UI: a button labeled `+ Generate New Key`, producing a cryptographic string (e.g., `sk_live_982347...`) included in HTTP headers on every request; the FastAPI gateway checks this against MongoDB to authenticate and meter usage.
- Webhook Management UI: a text input labeled *Callback URL*. Since processing takes 10–18 seconds, clients can't wait on a loading screen — TRINETRA POSTs the final result to this URL once ready.

**D. The Triage Dashboard (The Command Center)**
- Usage Graphs: "Scans Today" vs. "Scans Remaining."
- Incident Log: a searchable data table listing all processed media, with high-risk deepfakes highlighted in red. Clicking a row opens a slide-out panel with the video timeline, specific anomaly timestamps, the per-model score breakdown, and a button to download the PDF audit.

---

## 12. Business Model Integration into the UI

- **The "Prepaid Token" UI:** A checkout page where clients buy "Scan Credits," shown as a gas-gauge meter: *"You have 4,500 scans remaining."*
- **The Tier Selection Panel:** Three clean pricing cards (Starter, Growth, Enterprise) detailing included monthly scan volumes.
- **The "Hard Cap" Security Toggle:** The most important UI element for B2B trust — a toggle labeled *Enable Overdraft Protection* with a slider: *"Stop accepting API requests when my monthly bill reaches: [$500]."* If the client's app gets spammed and hits this limit, the backend automatically rejects further requests with a `402 Payment Required` error, protecting both the client from bill shock and TRINETRA's servers from unpaid GPU strain.

---

## 13. Hidden Business Pitfalls & Mitigations

**Pitfall: Legal Liability & SLAs**

*The Problem:* TRINETRA is designed to help platforms hit the 3-hour MeitY takedown window. If infrastructure goes down for several hours, a client misses the window, faces regulatory exposure, and may attempt to pass that liability back to TRINETRA.

*The Fix:* The Terms of Service must explicitly state that TRINETRA is a "Decision Support Tool," not a legal guarantor, and cap liability to the amount the customer paid in the last 12 months. The per-model transparency and weight-version tracking introduced in v2 (Sections 5, 7, 8) also strengthen TRINETRA's own defensibility — every score is reproducible and explainable after the fact.

**Pitfall: Data Privacy & DPDP Compliance**

*The Problem:* TRINETRA receives highly sensitive biometric data (faces and voices) from third-party platforms. Under India's DPDP Act, a breach exposing this data carries heavy penalties.

*The Fix:* A Zero-Retention Pipeline — the API processes files in RAM; once the AES and PDF report are generated, the raw media file is instantly and permanently deleted. Only metadata (time, IP, file hash, score, model weight versions) is retained for the audit log.

---

## 14. Design Decisions Informed by Prior Art

TRINETRA's architecture deliberately combines ideas from three different sources rather than adopting any single one wholesale:

| Source | What was adopted | What was deliberately *not* adopted |
|---|---|---|
| Saakshya (IIT Jodhpur/Madras) | Multi-agent, multi-layer verification philosophy; contextual cross-referencing | Multi-minute analysis timeline (too slow for the 180-minute SLA at consumer scale) |
| AI Vishleshak (IIT Mandi/HP Forensics) | Forensic-grade, tamper-proof PDF audit generation; uncertainty calibration | Government/law-enforcement-only access model |
| DeepSafe (open-source ensemble platform) | Plug-in model contract (`/health`, `/predict`); trained stacking-ensemble fusion; benchmark-gated retraining pipeline; per-model result transparency; weight-mirroring for resilience | Synchronous single-gateway request path — TRINETRA keeps its Redis/Celery asynchronous, webhook-driven architecture as the backbone, since DeepSafe's design targets single-file interactive testing rather than millions of concurrent B2B uploads |

---

## 15. Summary of Enhancements (v1 → v2)

- Added a third forensic modality: **static image detection** (NPR + UniversalFakeDetect), closing a gap for profile-photo and document-image abuse.
- Replaced ad hoc fusion logic with a **trained stacking meta-learner**, giving the "Model Confidence" field an actual statistical basis.
- Introduced a **benchmark-gated retraining pipeline** to continuously counter generalization decay as new generators emerge.
- Standardized all forensic models around a **plug-in `/health` + `/predict` contract** and a central model registry, making new detectors addable without touching the orchestration layer.
- Added a **health-check gate** before task dispatch, enabling graceful degradation instead of hard failures during partial outages.
- Extended the webhook payload and PDF audit report with a **per-model result breakdown** and **model weight-version hashes**, reinforcing both the "no black box" positioning and legal reproducibility.
- Documented a **model weight versioning/mirroring** practice for audit-trail resilience.
