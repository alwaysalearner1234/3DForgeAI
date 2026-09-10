import logging
import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure both project root and backend dir are in sys.path for direct uvicorn execution
_backend_dir = Path(__file__).resolve().parent
_project_root = _backend_dir.parent
for _p in [str(_backend_dir), str(_project_root)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config.settings import get_settings
from backend.models.schemas import HealthResponse
from backend.routes import generate_router, result_router, status_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("3dforge.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    settings.init_directories()
    logger.info("==================================================")
    logger.info("3DForge AI - Generation Engine (Lidiya's Backend)")
    logger.info(f"Storage Base: {settings.BASE_DIR}")
    logger.info(f"Tripo API Configured: {'Yes' if settings.TRIPO_API_KEY else 'No (Mock fallback enabled)'}")
    logger.info("==================================================")
    yield
    logger.info("Shutting down 3DForge AI generation backend.")


settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
# 3DForge AI - Generation Backend
**Lidiya's Component: User Input → FastAPI Backend → Tripo API → Raw 3D Model**

This service coordinates:
* Text prompts and image uploads from **Manoj's Next.js Frontend**.
* Asynchronous 3D generation with the **Tripo 3D API**.
* Raw GLB asset downloading and staging for **Atharv's 3D Processing Pipeline**.
* Real-time generation job status polling (`/status/{job_id}`) and model access (`/result/{job_id}`).
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration for Manoj's Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local storage directories for direct file inspection and Three.js loading
app.mount("/files/generated", StaticFiles(directory=str(settings.GENERATED_DIR)), name="generated_files")
app.mount("/files/uploads", StaticFiles(directory=str(settings.UPLOADS_DIR)), name="upload_files")
app.mount("/files/processed", StaticFiles(directory=str(settings.PROCESSED_DIR)), name="processed_files")

# Health check endpoint
@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health Check",
    description="Returns backend operational status."
)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


# Include feature routers
app.include_router(generate_router)
app.include_router(status_router)
app.include_router(result_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
