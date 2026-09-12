from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class JobStatusEnum(str, Enum):
    QUEUED = "queued"
    GENERATING = "generating"
    PROCESSING = "processing"
    OPTIMIZING = "optimizing"
    VALIDATING = "validating"
    COMPLETED = "completed"
    FAILED = "failed"


class TextGenerateRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Text description of the 3D model to generate",
        examples=["A realistic futuristic humanoid robot with metallic armor, glowing blue panels, and mechanical joints."]
    )


class JobResponse(BaseModel):
    job_id: str = Field(..., description="Unique job identifier")
    status: JobStatusEnum = Field(..., description="Current job status")

    model_config = {
        "json_schema_extra": {
            "example": {
                "job_id": "job_a1b2c3d4",
                "status": "queued"
            }
        }
    }


class StatusResponse(BaseModel):
    job_id: str = Field(..., description="Unique job identifier")
    status: JobStatusEnum = Field(..., description="Current job status")
    stage: str = Field(..., description="Description of the active pipeline stage")
    progress: int = Field(..., ge=0, le=100, description="Progress percentage (0-100)")
    error: Optional[str] = Field(None, description="Error message if the job failed")

    model_config = {
        "json_schema_extra": {
            "example": {
                "job_id": "job_a1b2c3d4",
                "status": "generating",
                "stage": "AI 3D generation",
                "progress": 40,
                "error": None
            }
        }
    }


class ResultResponse(BaseModel):
    job_id: str = Field("", description="Unique job identifier")
    status: JobStatusEnum = Field(..., description="Status of the generation job")
    asset_url: str = Field(..., description="Relative or absolute URL to download/view the generated 3D model")
    model_url: str = Field(..., description="Alias for asset_url for backward compatibility")
    format: str = Field("glb", description="3D model format (e.g. glb, gltf, obj)")
    prompt: Optional[str] = Field(None, description="Prompt used for generation")
    source_image: Optional[str] = Field(None, description="Original uploaded image name")
    metrics: Dict[str, Any] = Field(
        default_factory=dict,
        description="Mesh and topology metrics computed from the generated 3D asset"
    )

    model_config = {
        "protected_namespaces": (),
        "json_schema_extra": {
            "example": {
                "job_id": "job_a1b2c3d4",
                "status": "completed",
                "asset_url": "/files/generated/job_a1b2c3d4/model.glb",
                "model_url": "/files/generated/job_a1b2c3d4/model.glb",
                "format": "glb",
                "prompt": "A futuristic sports car",
                "source_image": None,
                "metrics": {
                    "polygon_count": 84200,
                    "vertex_count": 48100,
                    "file_size_kb": 1642.1
                }
            }
        }
    }


class HealthResponse(BaseModel):
    status: str = Field("ok", description="Backend health status")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "ok"
            }
        }
    }


class JobRecord(BaseModel):
    """Internal model for tracking in-memory job state."""
    job_id: str
    status: JobStatusEnum = JobStatusEnum.QUEUED
    stage: str = "queued"
    progress: int = 0
    prompt: Optional[str] = None
    image_filename: Optional[str] = None
    tripo_task_id: Optional[str] = None
    model_file_path: Optional[str] = None
    model_url: Optional[str] = None
    error: Optional[str] = None
    metrics: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "protected_namespaces": ()
    }

