import logging
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from backend.models.schemas import JobStatusEnum, ResultResponse
from backend.services.jobs import jobs
from backend.services.storage import storage

logger = logging.getLogger("3dforge.result")

router = APIRouter(prefix="", tags=["Result"])


@router.get(
    "/result/{job_id}",
    response_model=ResultResponse,
    summary="Get Generated 3D Model Result",
    description="""
    Retrieve the raw generated 3D model path/URL once Tripo generation has completed.
    Also leaves room for topology and mesh metrics from Atharv's post-processing pipeline.
    """
)
def get_job_result(job_id: str) -> ResultResponse:
    job = jobs.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job '{job_id}' was not found."
        )

    if job.status == JobStatusEnum.FAILED:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Job '{job_id}' failed: {job.error or 'Unknown generation failure'}"
        )

    if job.status != JobStatusEnum.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Job '{job_id}' is still in progress (current status: '{job.status}', progress: {job.progress}%)."
        )

    asset_url = job.model_url or storage.get_model_url(job.job_id, "model.glb")
    logger.info(f"[GET /result/{job_id}] Returning asset_url: '{asset_url}', prompt='{job.prompt}', metrics={job.metrics}")

    return ResultResponse(
        job_id=job.job_id,
        status=job.status,
        asset_url=asset_url,
        model_url=asset_url,
        format="glb",
        prompt=job.prompt,
        source_image=job.image_filename,
        metrics=job.metrics or {}
    )


@router.get(
    "/download/{job_id}",
    summary="Download Raw GLB Model",
    description="Direct binary download of the generated raw GLB model for Atharv's pipeline or local 3D tools."
)
def download_job_model(job_id: str) -> FileResponse:
    job = jobs.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job '{job_id}' was not found."
        )

    model_path = storage.get_model_path(job_id, "model.glb")
    if not model_path or not model_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Generated model file for job '{job_id}' does not exist on disk."
        )

    return FileResponse(
        path=model_path,
        media_type="model/gltf-binary",
        filename=f"{job_id}_raw.glb"
    )
