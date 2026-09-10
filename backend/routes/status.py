from fastapi import APIRouter, HTTPException, status
from backend.models.schemas import StatusResponse
from backend.services.jobs import jobs

router = APIRouter(prefix="", tags=["Status"])


@router.get(
    "/status/{job_id}",
    response_model=StatusResponse,
    summary="Get Generation Status",
    description="Query current generation progress, active stage, and completion status for a given job_id."
)
def get_job_status(job_id: str) -> StatusResponse:
    job = jobs.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job '{job_id}' was not found."
        )

    return StatusResponse(
        job_id=job.job_id,
        status=job.status,
        stage=job.stage,
        progress=job.progress,
        error=job.error,
    )
