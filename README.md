# 3DForge AI

> **From a simple idea to a production-ready 3D asset — automatically.**

3DForge AI is an AI-powered 3D asset generation and preparation platform that transforms a **text prompt or reference image into a usable 3D asset**.

The platform combines AI-based 3D generation with an automated processing pipeline to reduce the time and technical expertise required to create high-quality 3D assets.

The backend provides the API infrastructure responsible for receiving user input, communicating with the 3D generation service, managing generation jobs, handling model files, and delivering generated assets to the downstream processing pipeline.

---

## Overview

Traditional 3D asset creation can require multiple specialized steps, including modeling, texturing, UV mapping, optimization, and preparation for professional workflows.

3DForge AI simplifies the initial creation process by allowing users to start with either a natural-language description or a reference image.

The system follows this general workflow:

```text
Text Prompt / Reference Image
            ↓
       FastAPI Backend
            ↓
        Tripo API
            ↓
       Raw 3D Model
            ↓
   Automated Processing
            ↓
      Optimized Asset
            ↓
      Interactive Preview
            ↓
        Export / Use
```

The backend manages the generation stage and provides a clean interface between the user-facing application, AI generation service, and downstream 3D processing systems.

---

## Key Features

* Text-to-3D generation
* Image-to-3D generation
* Tripo API integration
* Asynchronous generation jobs
* Generation status tracking
* Raw 3D model retrieval
* GLB/GLTF support
* File upload and management
* Local and cloud-ready storage architecture
* Structured API responses
* Error handling and validation
* Automatic API documentation

---

## Architecture

```text
                         USER
                           │
                           ▼
                ┌─────────────────────┐
                │   Web Application   │
                └──────────┬──────────┘
                           │
                    Text / Image
                           │
                           ▼
                ┌─────────────────────┐
                │   FastAPI Backend   │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │      Tripo API      │
                └──────────┬──────────┘
                           │
                           ▼
                    Raw 3D Model
                           │
                           ▼
                ┌─────────────────────┐
                │ Processing Pipeline │
                └──────────┬──────────┘
                           │
                           ▼
                   Processed GLB
                           │
                           ▼
                ┌─────────────────────┐
                │   3D Viewer / App   │
                └─────────────────────┘
```

---

## Technology Stack

| Technology       | Purpose                    |
| ---------------- | -------------------------- |
| Python           | Backend development        |
| FastAPI          | REST API framework         |
| Tripo API        | AI-powered 3D generation   |
| Pydantic         | Data validation            |
| HTTPX            | External API communication |
| Uvicorn          | Application server         |
| Firebase Storage | Optional cloud storage     |
| python-dotenv    | Environment configuration  |

The broader 3DForge AI platform uses Next.js, React, Tailwind CSS, Three.js, Blender Python API, trimesh, and PyMeshLab for the application and processing stages.

---

# Project Structure

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
├── generated/
├── processed/
│
├── tests/
│   ├── test_health.py
│   ├── test_generate.py
│   ├── test_status.py
│   └── test_result.py
│
├── requirements.txt
├── .env.example
└── README.md
```

---

# System Workflow

## 1. User Input

The system accepts one of two input types:

### Text

```text
A realistic futuristic humanoid robot with metallic
armor, glowing panels and mechanical joints.
```

### Image

A user can upload a reference image representing the desired object.

---

## 2. Generation Request

The application sends the input to the backend through:

```http
POST /generate
```

The backend creates a unique generation job and returns a job ID.

Example:

```json
{
  "job_id": "abc123",
  "status": "queued"
}
```

---

## 3. AI Generation

The backend communicates with the Tripo API to generate the initial 3D representation.

The generation architecture is intentionally modular so that additional 3D generation providers can be integrated in the future.

For the MVP, Tripo is the selected generation provider.

---

## 4. Job Tracking

Because 3D generation may take time, generation is handled asynchronously.

A job progresses through states such as:

```text
queued
   ↓
generating
   ↓
completed
```

Additional processing states can be used by the complete platform:

```text
processing
   ↓
optimizing
   ↓
validating
   ↓
completed
```

---

## 5. Model Retrieval

Once generation is complete, the generated model is retrieved and stored.

The primary MVP output is:

```text
GLB
```

Additional formats such as GLTF and OBJ may be supported where applicable.

---

# API Reference

## Health Check

### `GET /health`

Returns the current API status.

### Response

```json
{
  "status": "ok"
}
```

---

# Generate 3D Model

### `POST /generate`

Creates a new 3D generation job.

### Text Request

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

The endpoint also supports multipart image uploads.

```text
Content-Type: multipart/form-data

image = robot.jpg
```

The image is stored and submitted to the generation service.

---

# Generation Status

### `GET /status/{job_id}`

Returns the current status of a generation job.

### Response

```json
{
  "job_id": "abc123",
  "status": "generating",
  "stage": "AI 3D generation",
  "progress": 65
}
```

When generation is complete:

```json
{
  "job_id": "abc123",
  "status": "completed",
  "stage": "generation complete",
  "progress": 100
}
```

If generation fails:

```json
{
  "job_id": "abc123",
  "status": "failed",
  "stage": "AI 3D generation",
  "progress": 0,
  "error": "Generation failed"
}
```

---

# Retrieve Result

### `GET /result/{job_id}`

Returns the generated model information.

### Response

```json
{
  "status": "completed",
  "model_url": "/generated/abc123/model.glb",
  "format": "glb"
}
```

The response structure can be extended to include processing and quality metrics once the downstream pipeline is integrated.

---

# File Management

The application uses three primary storage locations:

```text
uploads/
```

Stores user-provided reference images.

```text
generated/
```

Stores raw AI-generated models.

```text
processed/
```

Stores models after downstream processing.

For the hackathon MVP, local storage can be used to reduce infrastructure complexity. Firebase Storage can be introduced when persistent cloud storage is required.

---

# Environment Configuration

Create a `.env` file:

```env
TRIPO_API_KEY=your_tripo_api_key
FIREBASE_STORAGE_BUCKET=your_bucket_name
```

A `.env.example` file should be included in the repository:

```env
TRIPO_API_KEY=
FIREBASE_STORAGE_BUCKET=
```

### Security

Never commit real credentials to version control.

Add the following to `.gitignore`:

```text
.env
venv/
__pycache__/
*.pyc
```

---

# Installation

## Prerequisites

Make sure the following are installed:

* Python 3.10+
* pip
* Git

---

## Clone the Repository

```bash
git clone <repository-url>
cd 3DForge-AI/backend
```

---

## Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment

Create `.env` and add the required API credentials.

```env
TRIPO_API_KEY=your_tripo_api_key
```

---

# Running the Application

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

Alternative documentation:

```text
http://localhost:8000/redoc
```

---

# API Usage

## Create a Generation Job

```bash
curl -X POST "http://localhost:8000/generate" \
-H "Content-Type: application/json" \
-d "{\"prompt\":\"A realistic futuristic robot\"}"
```

Example response:

```json
{
  "job_id": "abc123",
  "status": "queued"
}
```

---

## Check Generation Status

```bash
curl "http://localhost:8000/status/abc123"
```

---

## Retrieve the Generated Model

```bash
curl "http://localhost:8000/result/abc123"
```

---

# Integration Flow

The backend exposes a simple interface for the rest of the platform:

```text
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
Raw GLB
```

The raw GLB can then enter the automated 3D processing pipeline.

---

# Error Handling

The API validates requests and handles common failures including:

* Missing prompt
* Missing image
* Invalid image format
* Invalid API credentials
* Tripo API errors
* Generation timeouts
* Failed generation jobs
* Invalid job IDs
* Missing model files
* Storage failures

Example:

```json
{
  "error": "Job not found"
}
```

HTTP status codes should accurately represent the type of failure.

---

# Testing

Run the test suite using:

```bash
pytest
```

Tests should cover:

* Health check
* Request validation
* Text generation
* Image upload
* Job creation
* Status retrieval
* Result retrieval
* Invalid job IDs
* Error handling

External Tripo API requests should be mocked during automated testing.

---

# Development Principles

### Modular Architecture

External service integrations should remain isolated from API routes.

For example:

```text
routes/generate.py
        ↓
services/tripo.py
        ↓
Tripo API
```

This makes the system easier to maintain and allows the generation provider to be replaced in the future.

### Clear API Contracts

The following interfaces should remain stable:

```text
POST /generate
GET /status/{job_id}
GET /result/{job_id}
```

The frontend and processing pipeline should rely on these defined interfaces.

### Secure Configuration

API keys and credentials must always be provided through environment variables.

### MVP First

The initial implementation should prioritize a reliable end-to-end generation flow rather than unnecessary infrastructure.

---

# MVP Scope

The backend MVP includes:

* Text input
* Image input
* Tripo generation
* FastAPI server
* Generation jobs
* Status tracking
* Result retrieval
* Raw GLB output
* File handling
* Storage
* Error handling
* API documentation

These align with the project's defined MVP requirements.

---

# Out of Scope

The following are not required for the initial MVP:

* Training a custom 3D foundation model
* Advanced AI retopology
* Automatic character rigging
* Natural-language texture editing
* Style transformation
* Automatic LOD generation
* Unity integration
* Unreal Engine integration
* Godot integration
* Collaboration features
* Marketplace functionality
* Complex user accounts
* Full asset library

These are considered future development areas rather than core MVP requirements.

---

# Future Development

Potential improvements include:

* Redis-based background job processing
* Persistent database integration
* Firebase/cloud storage
* Additional 3D generation providers
* Meshy integration
* WebSocket-based real-time progress
* Authentication
* Generation history
* Cloud deployment
* Retry and recovery mechanisms
* Scalable worker architecture

---

# End-to-End Platform

The complete 3DForge AI system is designed around:

```text
                    USER
                     │
                     ▼
              Text / Image
                     │
                     ▼
             AI 3D Generation
                     │
                     ▼
                Raw GLB
                     │
                     ▼
           Automated Processing
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
      Mesh          UV         Textures
     Cleanup     Processing    Processing
        │            │            │
        └────────────┼────────────┘
                     ▼
             Quality Validation
                     │
                     ▼
              Processed GLB
                     │
                     ▼
             Interactive Viewer
                     │
                     ▼
             Production Export
```

---

# Project Goal

3DForge AI aims to reduce the time and technical expertise required to create usable 3D assets for applications such as:

* Gaming
* VR/AR
* Simulation
* Product visualization
* Animation
* Digital design
* Interactive applications

The core concept is to bridge the gap between **generative AI and practical 3D production workflows**.

---

# Core Value Proposition

> **We don't just generate a 3D model — we automate the journey from AI-generated geometry to production-ready assets.**

---

# Project Status

**Project:** 3DForge AI
**Platform:** AI-powered 3D asset generation and preparation
**Primary MVP Output:** GLB
**Generation Provider:** Tripo
**Backend:** FastAPI + Python
**Status:** Hackathon MVP

---

## License

Add the project's chosen license here before publishing the repository.

---

## Acknowledgements

3DForge AI builds upon modern AI and open-source 3D technologies to simplify the transition from generated 3D content to usable digital assets.
