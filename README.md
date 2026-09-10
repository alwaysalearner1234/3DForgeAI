# 3DForge AI — AI Generation & Backend

> **From a simple idea to a production-ready 3D asset — automatically.**

3DForge AI is an AI-powered 3D asset generation and preparation platform that transforms a **text prompt or reference image** into a usable 3D asset.

This repository contains **Lidiya's backend module**, responsible for the first stage of the 3DForge AI pipeline:

```text
Text Prompt / Reference Image
            ↓
       FastAPI Backend
            ↓
         Tripo API
            ↓
       Raw 3D Model
            ↓
    3D Processing Pipeline
```

The backend receives user input, creates and manages generation jobs, communicates with the Tripo 3D generation API, retrieves the generated model, and makes the raw model available to the next stage of the pipeline.

---

# 📌 Table of Contents

* [About 3DForge AI](#-about-3dforge-ai)
* [Lidiya's Responsibility](#-lidiyas-responsibility)
* [Features](#-features)
* [Architecture](#-architecture)
* [Technology Stack](#-technology-stack)
* [Project Structure](#-project-structure)
* [How the Backend Works](#-how-the-backend-works)
* [API Endpoints](#-api-endpoints)
* [Job Management](#-job-management)
* [Tripo Integration](#-tripo-integration)
* [File Storage](#-file-storage)
* [Environment Variables](#-environment-variables)
* [Installation](#-installation)
* [Running the Backend](#-running-the-backend)
* [API Usage](#-api-usage)
* [Frontend Integration](#-frontend-integration)
* [Team Integration](#-team-integration)
* [Error Handling](#-error-handling)
* [Testing](#-testing)
* [Security](#-security)
* [MVP Scope](#-mvp-scope)
* [Future Improvements](#-future-improvements)
* [Development Guidelines](#-development-guidelines)

---

# 🚀 About 3DForge AI

Traditional 3D asset creation requires several technical steps such as modeling, sculpting, texturing, UV mapping, optimization, and preparation for professional workflows.

3DForge AI aims to simplify this process.

A user can provide:

* A text description
* A reference image

The system generates an initial 3D model and then passes it through a post-processing pipeline to make the asset more usable.

The complete project pipeline is:

```text
TEXT / IMAGE
     ↓
AI 3D GENERATION
     ↓
RAW 3D MODEL
     ↓
MESH CLEANUP
     ↓
MESH OPTIMIZATION
     ↓
UV PROCESSING
     ↓
TEXTURE PROCESSING
     ↓
QUALITY VALIDATION
     ↓
PROCESSED GLB
     ↓
THREE.JS VIEWER
     ↓
DOWNLOAD / BLENDER
```

This backend is responsible only for the **AI generation and backend portion**.

---

# 👩‍💻 Lidiya's Responsibility

Lidiya owns:

```text
INPUT
  ↓
FASTAPI
  ↓
TRIPO
  ↓
RAW GLB
```

The responsibilities include:

* FastAPI backend
* Text input endpoint
* Image input endpoint
* Tripo integration
* Generation job creation
* Job status management
* Result retrieval
* File handling
* Model storage
* Error handling
* API documentation

These responsibilities correspond to Person 1 in the team plan.

---

# ✨ Features

## Text-to-3D

Users can submit a text prompt such as:

```text
A realistic futuristic humanoid robot with metallic armor,
glowing panels and mechanical joints.
```

The backend sends the prompt to Tripo and retrieves the generated 3D model.

---

## Image-to-3D

Users can upload a reference image.

Example:

```text
robot.jpg
```

The backend sends the image to Tripo for 3D generation.

---

## Asynchronous Generation

3D generation can take time.

Instead of keeping the frontend waiting for one large request, the backend creates a job.

```text
POST /generate
       ↓
    job_id
       ↓
GET /status/{job_id}
       ↓
   Generation
       ↓
GET /result/{job_id}
```

---

## Job Tracking

Jobs can have statuses such as:

```text
queued
generating
processing
optimizing
validating
completed
failed
```

The backend provides progress information where available.

---

## Raw 3D Model Retrieval

Once Tripo finishes generation, the backend retrieves the generated model.

The primary MVP output is:

```text
GLB
```

Optional formats may include:

```text
GLTF
OBJ
```

The generated raw model is then passed to the 3D processing pipeline.

---

# 🏗️ Architecture

```text
                    USER
                     │
                     │
              Text / Image
                     │
                     ▼
        ┌──────────────────────┐
        │    Next.js Frontend  │
        │       Manoj          │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │    FastAPI Backend   │
        │       Lidiya         │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │      Tripo API       │
        └──────────┬───────────┘
                   │
                   ▼
              Raw GLB
                   │
                   ▼
        ┌──────────────────────┐
        │ 3D Processing        │
        │ Pipeline             │
        │       Atharv         │
        └──────────┬───────────┘
                   │
                   ▼
             Processed GLB
                   │
                   ▼
        ┌──────────────────────┐
        │ Three.js Viewer      │
        │       Manoj          │
        └──────────────────────┘
```

---

# 🛠️ Technology Stack

| Technology       | Purpose                     |
| ---------------- | --------------------------- |
| Python           | Backend programming         |
| FastAPI          | REST API                    |
| Tripo API        | AI 3D generation            |
| Pydantic         | Request/response validation |
| HTTPX            | API communication           |
| Uvicorn          | Development server          |
| Firebase Storage | Optional persistent storage |
| dotenv           | Environment configuration   |

The overall project stack also uses Next.js/React, Tailwind CSS, Three.js, trimesh, PyMeshLab and Blender Python, but those belong to other parts of the team architecture.

---

# 📁 Project Structure

```text
backend/
│
├── main.py
│
├── routes/
│   ├── generate.py
│   ├── status.py
│   └── result.py
│
├── services/
│   ├── tripo.py
│   ├── storage.py
│   └── jobs.py
│
├── models/
│   └── schemas.py
│
├── config/
│   └── settings.py
│
├── uploads/
│
├── generated/
│
├── processed/
│
├── tests/
│   ├── test_health.py
│   ├── test_generate.py
│   ├── test_status.py
│   └── test_result.py
│
├── requirements.txt
├── .env
├── .env.example
└── README.md
```

---

# 🔄 How the Backend Works

## Step 1 — User Input

The user provides either:

```text
Text Prompt
```

or:

```text
Reference Image
```

---

## Step 2 — Create Generation Job

The frontend sends:

```text
POST /generate
```

The backend creates a unique job ID.

Example:

```json
{
  "job_id": "abc123",
  "status": "queued"
}
```

---

## Step 3 — Send Request to Tripo

The backend sends the user's input to the Tripo API.

```text
FastAPI
   ↓
Tripo
   ↓
3D Generation
```

---

## Step 4 — Track Generation

The backend checks the Tripo generation status and updates the internal job.

Example:

```json
{
  "job_id": "abc123",
  "status": "generating",
  "stage": "AI 3D generation",
  "progress": 65
}
```

---

## Step 5 — Retrieve Model

When generation finishes, the backend retrieves the generated model.

```text
Tripo
 ↓
GLB / GLTF
 ↓
Backend Storage
```

---

## Step 6 — Return Result

The frontend can request:

```text
GET /result/{job_id}
```

The backend returns the raw model URL.

---

# 🔌 API Endpoints

## `GET /health`

Checks whether the backend is running.

### Response

```json
{
  "status": "ok"
}
```

---

# `POST /generate`

Creates a new 3D generation job.

## Text Request

```json
{
  "prompt": "A futuristic humanoid robot with metallic armor"
}
```

### Response

```json
{
  "job_id": "abc123",
  "status": "queued"
}
```

---

## Image Request

Use multipart form data:

```text
image = robot.jpg
```

The backend stores the image and starts the generation job.

---

# `GET /status/{job_id}`

Returns the current generation status.

### Example

```json
{
  "job_id": "abc123",
  "status": "generating",
  "stage": "AI 3D generation",
  "progress": 65
}
```

---

# `GET /result/{job_id}`

Returns the generated model.

### Example

```json
{
  "status": "completed",
  "model_url": "/generated/abc123/model.glb",
  "format": "glb"
}
```

The result structure can later include processing metrics supplied by Atharv.

---

# 📊 Job Management

Each generation receives a unique ID.

Example:

```text
abc123
```

A job can move through:

```text
queued
   ↓
generating
   ↓
completed
```

or:

```text
queued
   ↓
generating
   ↓
failed
```

The architecture also supports later stages:

```text
processing
optimizing
validating
```

These can be updated by the downstream processing pipeline.

The project plan specifically recommends asynchronous job management because 3D generation can take time.

---

# 🤖 Tripo Integration

Tripo is used as the initial AI 3D generation provider.

The project uses an existing 3D generation API instead of attempting to train a complete 3D foundation model from scratch.

All Tripo-specific logic should remain inside:

```text
services/tripo.py
```

This keeps the backend modular.

Future providers such as Meshy can be added without rewriting the entire application.

---

# 📦 File Storage

For the MVP, local storage can be used.

```text
uploads/
```

Contains uploaded reference images.

```text
generated/
```

Contains raw AI-generated models.

```text
processed/
```

Reserved for processed models from the downstream pipeline.

The team plan allows temporary storage initially to reduce hackathon complexity, with Firebase Storage available when persistent storage is needed.

---

# 🔐 Environment Variables

Create:

```text
.env
```

Example:

```env
TRIPO_API_KEY=your_api_key_here
FIREBASE_STORAGE_BUCKET=your_bucket_name
```

Create `.env.example`:

```env
TRIPO_API_KEY=
FIREBASE_STORAGE_BUCKET=
```

Never commit the actual `.env` file.

---

# 💻 Installation

## 1. Clone the Repository

```bash
git clone <repository-url>
cd 3DForge-AI/backend
```

---

## 2. Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Configure Environment

Create:

```text
.env
```

Add:

```env
TRIPO_API_KEY=your_api_key
```

---

# ▶️ Running the Backend

Start FastAPI:

```bash
uvicorn main:app --reload
```

The server will be available at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

---

# 🧪 API Usage Example

## Create Generation

```bash
curl -X POST "http://localhost:8000/generate" \
-H "Content-Type: application/json" \
-d "{\"prompt\":\"A realistic futuristic robot\"}"
```

Response:

```json
{
  "job_id": "abc123",
  "status": "queued"
}
```

---

## Check Status

```bash
curl "http://localhost:8000/status/abc123"
```

Response:

```json
{
  "job_id": "abc123",
  "status": "generating",
  "stage": "AI 3D generation",
  "progress": 65
}
```

---

## Get Result

```bash
curl "http://localhost:8000/result/abc123"
```

Response:

```json
{
  "status": "completed",
  "model_url": "/generated/abc123/model.glb",
  "format": "glb"
}
```

---

# 🔗 Frontend Integration

Manoj's frontend communicates with this backend through the following flow:

```text
User
 ↓
Generate Button
 ↓
POST /generate
 ↓
job_id
 ↓
GET /status/{job_id}
 ↓
Generation Complete
 ↓
GET /result/{job_id}
 ↓
Raw / Processed Model
```

The frontend should never need to communicate directly with the Tripo API.

The Tripo API key remains on the backend.

---

# 🤝 Team Integration

The three modules connect as follows.

## Lidiya — Backend

```text
Input
 ↓
FastAPI
 ↓
Tripo
 ↓
Raw GLB
```

## Atharv — Processing

```text
Raw GLB
 ↓
Mesh Analysis
 ↓
Mesh Cleanup
 ↓
Mesh Optimization
 ↓
UV Processing
 ↓
Texture Processing
 ↓
Quality Validation
 ↓
Final GLB
```

## Manoj — Frontend

```text
Final GLB
 ↓
Three.js
 ↓
Interactive Viewer
 ↓
Quality Report
 ↓
Download
```

This responsibility split is defined in the team's final architecture.

---

# 🔁 Shared API Contract

Before integrating all three modules, the team should agree on:

* API request format
* API response format
* Job status format
* Model file format
* Quality metrics format
* Error format

The shared model format for the MVP is:

```text
GLB
```

The backend should preserve a stable interface so the other modules can be developed independently.

---

# ⚠️ Error Handling

The backend should handle:

### Invalid Input

```text
400 Bad Request
```

Example:

```json
{
  "error": "Prompt or image is required"
}
```

### Invalid Job

```text
404 Not Found
```

Example:

```json
{
  "error": "Job not found"
}
```

### Tripo Failure

```text
502 Bad Gateway
```

Example:

```json
{
  "error": "3D generation service failed"
}
```

### Internal Failure

```text
500 Internal Server Error
```

Do not expose API keys or sensitive internal information.

---

# 🧪 Testing

Run:

```bash
pytest
```

Test:

* Health endpoint
* Text generation validation
* Image upload validation
* Job creation
* Job status
* Invalid job ID
* Result retrieval
* Error handling

Tripo API calls should be mocked during automated tests.

---

# 🔒 Security

Important rules:

* Never hardcode API keys.
* Never commit `.env`.
* Validate uploaded files.
* Restrict accepted image types.
* Limit upload sizes.
* Keep Tripo credentials server-side.
* Sanitize file names.
* Return safe error messages.

---

# 🎯 MVP Scope

The backend MVP must successfully support:

* [x] FastAPI server
* [x] Text input
* [x] Image input
* [x] Tripo integration
* [x] Job creation
* [x] Job status
* [x] Result endpoint
* [x] Raw GLB retrieval
* [x] File handling
* [x] Error handling
* [x] API documentation

These correspond to the Person 1 deliverables in the team plan.

---

# 🚫 Out of Scope for Lidiya

Do **not** implement these in this module:

* Three.js viewer
* Next.js UI
* Tailwind UI
* Mesh cleanup
* Mesh optimization
* UV generation
* Texture optimization
* Blender processing
* Quality validation logic
* Character rigging
* Unity integration
* Unreal integration
* Godot integration

These belong to other parts of the project or future scope.

---

# 🚀 Future Improvements

Possible backend improvements include:

* Redis-based job queue
* Persistent database
* Firebase Storage
* Cloud storage
* Authentication
* Generation history
* Multiple AI providers
* Meshy integration
* Retry mechanisms
* Background workers
* Cloud deployment
* WebSocket-based status updates

The architecture should remain modular enough to support these improvements.

---

# 🧑‍💻 Development Guidelines

## Keep Services Separate

Tripo logic belongs in:

```text
services/tripo.py
```

Storage logic belongs in:

```text
services/storage.py
```

Job management belongs in:

```text
services/jobs.py
```

API routes should remain lightweight.

---

## Keep API Contracts Stable

Do not randomly change:

```text
POST /generate
GET /status/{job_id}
GET /result/{job_id}
```

without informing the frontend and processing team.

---

## Keep the MVP Simple

The primary goal is:

```text
TEXT / IMAGE
     ↓
FASTAPI
     ↓
TRIPO
     ↓
RAW GLB
```

Everything else should support this core flow.

---

# 🏆 Final Demo Flow

The complete hackathon demo should look like:

```text
1. User opens 3DForge AI
              ↓
2. Enters:
   "A realistic futuristic humanoid robot"
              ↓
3. Clicks Generate
              ↓
4. Frontend calls POST /generate
              ↓
5. Backend creates job
              ↓
6. Backend sends request to Tripo
              ↓
7. Tripo generates 3D model
              ↓
8. Backend retrieves raw GLB
              ↓
9. Raw GLB goes to processing pipeline
              ↓
10. Processed GLB returns to frontend
              ↓
11. Three.js displays model
              ↓
12. Quality report is shown
              ↓
13. User downloads GLB
              ↓
14. Model can be opened in Blender
```

---

# 💡 Core USP

3DForge AI is not just another text-to-3D generator.

The core idea is:

> **We don't just generate a 3D model — we automate the journey from AI-generated geometry to production-ready assets.**

The backend is the first critical step in that journey:

```text
Simple Idea
     ↓
AI Generation
     ↓
Raw 3D Model
     ↓
Processing
     ↓
Production-Ready Asset
```

---

# 👥 Team

### Lidiya

**AI Generation + Backend**

Python · FastAPI · Tripo · Storage

### Atharv

**3D Processing Pipeline**

Blender Python · trimesh · PyMeshLab

### Manoj

**Frontend + 3D Viewer**

Next.js · React · Tailwind CSS · Three.js

---

# 📄 Project Status

**Project:** 3DForge AI
**Module:** AI Generation + Backend
**Primary Output:** Raw GLB
**Status:** Hackathon MVP

---

## ⭐ 3DForge AI

**From a simple idea to a production-ready 3D asset — automatically.**
