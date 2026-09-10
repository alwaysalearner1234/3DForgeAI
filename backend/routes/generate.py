import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, UploadFile, status
from fastapi.responses import JSONResponse

from backend.models.schemas import JobResponse, JobStatusEnum, TextGenerateRequest
from backend.services.jobs import jobs
from backend.services.storage import storage
from backend.services.tripo import tripo_service

router = APIRouter(prefix="", tags=["Generation"])

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post(
    "/generate",
    response_model=JobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Create a 3D Generation Job",
    description="""
    Submit either:
    1. **JSON text prompt**: `{"prompt": "A futuristic robot with metallic armor"}`
    2. **Image file upload** via `multipart/form-data`: field `image` with an optional `prompt` field.

    Returns immediately with a `job_id` and initial status `queued`.
    Poll `GET /status/{job_id}` to track generation progress.
    """
)
async def generate_3d_asset(
    request: Request,
    background_tasks: BackgroundTasks,
) -> JobResponse:
    content_type = request.headers.get("content-type", "").lower()
    prompt: Optional[str] = None
    image_path: Optional[Path] = None
    saved_filename: Optional[str] = None

    if "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Malformed JSON body."
            )
        try:
            req_model = TextGenerateRequest(**body)
            prompt = req_model.prompt.strip()
            if not prompt:
                raise ValueError("The 'prompt' field must not be empty.")
        except Exception as err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Validation error: {err}"
            )

    elif "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        prompt_val = form.get("prompt")
        if prompt_val and isinstance(prompt_val, str) and prompt_val.strip():
            prompt = prompt_val.strip()

        file_obj = form.get("image")
        if file_obj and hasattr(file_obj, "filename") and file_obj.filename:
            filename = file_obj.filename
            ext = os.path.splitext(filename)[1].lower()
            if ext not in ALLOWED_IMAGE_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unsupported image extension '{ext}'. Allowed: {sorted(list(ALLOWED_IMAGE_EXTENSIONS))}"
                )

            file_bytes = await file_obj.read()
            if len(file_bytes) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uploaded image file is empty."
                )
            if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uploaded image exceeds maximum size of 10MB."
                )

            unique_filename = f"upload_{uuid.uuid4().hex[:8]}_{filename}"
            storage.save_upload(file_bytes, unique_filename)
            saved_filename = unique_filename
            image_path = storage.get_upload_path(unique_filename)
    else:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Content-Type must be 'application/json' or 'multipart/form-data'."
        )

    if not prompt and not image_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a non-empty text 'prompt' or an 'image' file must be provided."
        )

    # Create job in queued state
    job = jobs.create_job(prompt=prompt, image_filename=saved_filename)

    # Spawn background worker to coordinate with Tripo
    background_tasks.add_task(
        tripo_service.run_generation_pipeline,
        job_id=job.job_id,
        prompt=prompt,
        image_path=image_path
    )

    return JobResponse(job_id=job.job_id, status=job.status)
