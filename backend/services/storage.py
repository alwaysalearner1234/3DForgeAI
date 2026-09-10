import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional
from backend.config.settings import get_settings


class BaseStorage(ABC):
    """Abstract interface for file and asset storage."""

    @abstractmethod
    def save_upload(self, file_bytes: bytes, filename: str) -> str:
        """Save an uploaded image and return stored filename or path."""
        pass

    @abstractmethod
    def save_generated_model(self, job_id: str, model_bytes: bytes, filename: str = "model.glb") -> Path:
        """Save raw generated 3D model."""
        pass

    @abstractmethod
    def get_model_path(self, job_id: str, filename: str = "model.glb") -> Optional[Path]:
        """Get local filesystem path to the model if it exists."""
        pass

    @abstractmethod
    def get_model_url(self, job_id: str, filename: str = "model.glb") -> str:
        """Get accessible URL or path for Manoj's frontend or Atharv's pipeline."""
        pass


class LocalStorage(BaseStorage):
    """Local filesystem storage implementation for MVP."""

    def __init__(self):
        self.settings = get_settings()
        self.settings.init_directories()

    def save_upload(self, file_bytes: bytes, filename: str) -> str:
        """Saves an uploaded reference image to the uploads directory."""
        dest = self.settings.UPLOADS_DIR / filename
        with open(dest, "wb") as f:
            f.write(file_bytes)
        return filename

    def save_generated_model(self, job_id: str, model_bytes: bytes, filename: str = "model.glb") -> Path:
        """Saves a downloaded raw GLB from Tripo to generated/{job_id}/."""
        job_dir = self.settings.GENERATED_DIR / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        model_path = job_dir / filename
        with open(model_path, "wb") as f:
            f.write(model_bytes)
        return model_path

    def get_model_path(self, job_id: str, filename: str = "model.glb") -> Optional[Path]:
        """Returns the local file path to the model if it exists."""
        model_path = self.settings.GENERATED_DIR / job_id / filename
        if model_path.exists():
            return model_path
        return None

    def get_model_url(self, job_id: str, filename: str = "model.glb") -> str:
        """Returns the static file URL served by FastAPI for frontend inspection."""
        return f"/files/generated/{job_id}/{filename}"

    def get_upload_path(self, filename: str) -> Optional[Path]:
        """Returns the local file path to an upload."""
        upload_path = self.settings.UPLOADS_DIR / filename
        if upload_path.exists():
            return upload_path
        return None


# Future Firebase Storage implementation skeleton for production deployment
class FirebaseStorage(BaseStorage):
    """Skeleton for Firebase Cloud Storage."""

    def __init__(self, bucket_name: Optional[str] = None):
        self.bucket_name = bucket_name or get_settings().FIREBASE_STORAGE_BUCKET

    def save_upload(self, file_bytes: bytes, filename: str) -> str:
        raise NotImplementedError("Firebase Storage plug-in can be configured with credentials.")

    def save_generated_model(self, job_id: str, model_bytes: bytes, filename: str = "model.glb") -> Path:
        raise NotImplementedError("Firebase Storage plug-in can be configured with credentials.")

    def get_model_path(self, job_id: str, filename: str = "model.glb") -> Optional[Path]:
        return None

    def get_model_url(self, job_id: str, filename: str = "model.glb") -> str:
        return f"https://firebasestorage.googleapis.com/v0/b/{self.bucket_name}/o/generated%2F{job_id}%2F{filename}?alt=media"


# Default singleton instance
storage = LocalStorage()
