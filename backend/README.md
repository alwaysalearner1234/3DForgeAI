# 3DForge AI — Backend (Lidiya's Service)

> **User Input → FastAPI Backend → Tripo API → Raw 3D Model**

This repository contains the backend generation engine for **3DForge AI**. It coordinates text prompts and image uploads, manages asynchronous 3D generation with the Tripo API, tracks live job states, and stages raw `.glb` assets for downstream processing and frontend viewing.

---

## Architecture & Team Interface

```
                    ┌────────────────────────┐
                    │ Manoj (Next.js/Three)  │
                    └───────────┬────────────┘
                                │
   POST /generate               │  GET /status/{job_id}
   (text prompt or image)       │  GET /result/{job_id}
                                ▼
         ┌──────────────────────────────────────────────┐
         │       Lidiya's FastAPI Engine                │
         │                                              │
         │  1. Receives input & creates queued job      │
         │  2. Asynchronously communicates with Tripo   │
         │  3. Polls task progress & updates state      │
         │  4. Downloads raw GLB from Tripo CDN         │
         │  5. Stores in backend/generated/{job_id}/    │
         └──────────────────────┬───────────────────────┘
                                │
                                │ Raw GLB Asset Hand-off
                                ▼
         ┌──────────────────────────────────────────────┐
         │     Atharv's 3D Processing Pipeline          │
         │  (Geometry, Textures, UV, Mesh Optimization) │
         └──────────────────────────────────────────────┘
```

### Team Handoff Specifications

#### 1. Interface for Manoj (Next.js / Three.js Frontend)
* **Base URL**: `http://localhost:8000` (CORS enabled for `localhost:3000`, `localhost:3001`, `localhost:5173`, etc.)
* **Interactive Docs / Swagger**: `http://localhost:8000/docs`
* **Workflow**:
  1. Call `POST /generate` with either JSON `{ "prompt": "..." }` or multipart `image` file.
  2. Receive `{ "job_id": "job_...", "status": "queued" }`.
  3. Poll `GET /status/{job_id}` every 1–2 seconds to update UI progress bar (0% to 100%).
  4. When `status === "completed"`, call `GET /result/{job_id}` to retrieve `model_url` (e.g. `/files/generated/{job_id}/model.glb`) for loading directly into Three.js.

#### 2. Interface for Atharv (Python 3D Processing Pipeline)
* Raw generated assets are stored directly on the filesystem at:
  ```
  backend/generated/{job_id}/model.glb
  ```
* Once status reaches `completed`, Atharv's pipeline can read the file directly or via `GET /download/{job_id}`.
* The `metrics` dictionary in `GET /result/{job_id}` is ready to receive Atharv's post-processing analytics (polygon count, topology quality, UV stats, etc.).

---

## Directory Structure

```
backend/
├── main.py                # FastAPI app, CORS, static file mounts, health check
├── routes/
│   ├── __init__.py
│   ├── generate.py        # POST /generate (supports JSON text prompt & multipart image)
│   ├── status.py          # GET /status/{job_id}
│   └── result.py          # GET /result/{job_id} & GET /download/{job_id}
├── services/
│   ├── __init__.py
│   ├── tripo.py           # Tripo API client (task creation, polling, GLB download, mock fallback)
│   ├── storage.py         # Modular storage (uploads, generated models, pluggable Firebase)
│   └── jobs.py            # Thread-safe in-memory job manager (queued, generating, completed, failed)
├── models/
│   ├── __init__.py
│   └── schemas.py         # Pydantic request/response validation schemas
├── config/
│   ├── __init__.py
│   └── settings.py        # Settings management with pydantic-settings
├── uploads/               # Stored reference image uploads
├── generated/             # Stored raw Tripo GLB models ready for Atharv
├── processed/             # Reserved directory for post-processing outputs
├── tests/
│   ├── __init__.py
│   └── test_api.py        # Pytest test suite covering all endpoints and validations
├── requirements.txt       # Python dependencies
├── .env.example           # Environment variable template
└── README.md              # Full documentation and setup guide
```

---

## Quickstart

### 1. Installation

Python 3.9+ is recommended. Install required packages:

```bash
pip install -r backend/requirements.txt
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```ini
# Optional: Set your real Tripo API key from https://platform.tripo3d.ai/
TRIPO_API_KEY=your_actual_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Allow offline / mock generation fallback if TRIPO_API_KEY is not set
ALLOW_MOCK_FALLBACK=True
```

> **Hackathon Ready**: If `TRIPO_API_KEY` is blank and `ALLOW_MOCK_FALLBACK=True`, the backend automatically generates valid, real GLB assets and simulates realistic async progress updates. This allows the entire team to develop and demo offline immediately!

### 3. Run the Server

From the repository root:

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

Or from inside `backend/`:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Interactive API documentation will be available at:
* Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
* Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## API Endpoints Reference

### 1. Health Check
* **Endpoint**: `GET /health`
* **Response (200 OK)**:
  ```json
  {
    "status": "ok"
  }
  ```

---

### 2. Create Generation Job
* **Endpoint**: `POST /generate`
* **Status**: `202 Accepted`

#### A. Text Prompt Input (JSON)
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A realistic futuristic humanoid robot with metallic armor"}'
```

#### B. Image Upload Input (Multipart Form)
```bash
curl -X POST http://localhost:8000/generate \
  -F "image=@robot.jpg" \
  -F "prompt=Futuristic robot from reference image"
```

* **Response (202 Accepted)**:
  ```json
  {
    "job_id": "job_a1b2c3d4e5f6",
    "status": "queued"
  }
  ```

* **Error Responses**:
  * `400 Bad Request`: Empty prompt or missing both prompt and image.
  * `400 Bad Request`: Unsupported file type (allowed: `.jpg`, `.jpeg`, `.png`, `.webp`).
  * `415 Unsupported Media Type`: Unsupported Content-Type header.

---

### 3. Check Job Status
* **Endpoint**: `GET /status/{job_id}`
* **Response (200 OK)**:
  ```json
  {
    "job_id": "job_a1b2c3d4e5f6",
    "status": "generating",
    "stage": "AI 3D generation",
    "progress": 55,
    "error": null
  }
  ```

* **When Completed**:
  ```json
  {
    "job_id": "job_a1b2c3d4e5f6",
    "status": "completed",
    "stage": "generation complete",
    "progress": 100,
    "error": null
  }
  ```

* **When Failed**:
  ```json
  {
    "job_id": "job_a1b2c3d4e5f6",
    "status": "failed",
    "stage": "AI 3D generation",
    "progress": 0,
    "error": "Tripo API task failed: Insufficient credits"
  }
  ```

---

### 4. Retrieve Generated 3D Result
* **Endpoint**: `GET /result/{job_id}`
* **Response (200 OK)**:
  ```json
  {
    "status": "completed",
    "model_url": "/files/generated/job_a1b2c3d4e5f6/model.glb",
    "format": "glb",
    "metrics": {}
  }
  ```

* **Error Responses**:
  * `404 Not Found`: Job does not exist.
  * `409 Conflict`: Job is still in progress (e.g. generating).
  * `422 Unprocessable Entity`: Job failed during generation.

---

### 5. Download Raw GLB Binary
* **Endpoint**: `GET /download/{job_id}`
* **Response (200 OK)**:
  Direct binary stream (`model/gltf-binary`) containing the generated `.glb` asset.

---

## Running the Automated Tests

Run the full pytest suite:

```bash
python -m pytest backend/tests/test_api.py -v
```

This tests:
* Server health check
* Text generation and input validation
* Image upload handling and format validation
* Status polling lifecycle
* Result retrieval and binary GLB downloading
* Mock GLB generator binary integrity (glTF 2.0 header compliance)
