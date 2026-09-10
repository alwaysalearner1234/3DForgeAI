import threading
import uuid
from datetime import datetime
from typing import Dict, List, Optional
from backend.models.schemas import JobRecord, JobStatusEnum


class JobManager:
    """Thread-safe in-memory job state manager for asynchronous 3D generation jobs."""

    def __init__(self):
        self._jobs: Dict[str, JobRecord] = {}
        self._lock = threading.Lock()

    def generate_job_id(self) -> str:
        """Generate a clean unique job identifier."""
        return f"job_{uuid.uuid4().hex[:12]}"

    def create_job(
        self,
        prompt: Optional[str] = None,
        image_filename: Optional[str] = None
    ) -> JobRecord:
        """Create a new job in queued state."""
        job_id = self.generate_job_id()
        record = JobRecord(
            job_id=job_id,
            status=JobStatusEnum.QUEUED,
            stage="queued",
            progress=0,
            prompt=prompt,
            image_filename=image_filename,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        with self._lock:
            self._jobs[job_id] = record
        return record

    def get_job(self, job_id: str) -> Optional[JobRecord]:
        """Fetch a job record by ID."""
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                # Return a copy to avoid mutation outside lock
                return job.model_copy()
            return None

    def update_job(
        self,
        job_id: str,
        status: Optional[JobStatusEnum] = None,
        stage: Optional[str] = None,
        progress: Optional[int] = None,
        tripo_task_id: Optional[str] = None,
        model_file_path: Optional[str] = None,
        model_url: Optional[str] = None,
        error: Optional[str] = None,
    ) -> Optional[JobRecord]:
        """Update job fields thread-safely."""
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return None

            if status is not None:
                job.status = status
            if stage is not None:
                job.stage = stage
            if progress is not None:
                job.progress = max(0, min(100, progress))
            if tripo_task_id is not None:
                job.tripo_task_id = tripo_task_id
            if model_file_path is not None:
                job.model_file_path = model_file_path
            if model_url is not None:
                job.model_url = model_url
            if error is not None:
                job.error = error

            job.updated_at = datetime.utcnow()
            return job.model_copy()

    def list_jobs(self) -> List[JobRecord]:
        """List all tracked jobs."""
        with self._lock:
            return [job.model_copy() for job in self._jobs.values()]


# Global singleton instance for in-memory job management
jobs = JobManager()
