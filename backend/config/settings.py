from functools import lru_cache
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "3DForge AI - Generation Engine"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "*"
    ]

    # Tripo API
    TRIPO_API_KEY: Optional[str] = None
    TRIPO_BASE_URL: str = "https://api.tripo3d.ai/v2/openapi"
    TRIPO_POLL_INTERVAL_SEC: float = 2.0
    TRIPO_MAX_POLL_RETRIES: int = 180  # Up to 6 minutes for 3D model generation

    # Mock mode fallback (enables testing without API keys)
    ALLOW_MOCK_FALLBACK: bool = True

    # Storage paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    UPLOADS_DIR: Path = BASE_DIR / "uploads"
    GENERATED_DIR: Path = BASE_DIR / "generated"
    PROCESSED_DIR: Path = BASE_DIR / "processed"

    # Future Cloud Storage
    FIREBASE_STORAGE_BUCKET: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def init_directories(self) -> None:
        """Ensure uploads, generated, and processed directories exist."""
        self.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        self.GENERATED_DIR.mkdir(parents=True, exist_ok=True)
        self.PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    settings.init_directories()
    return settings
