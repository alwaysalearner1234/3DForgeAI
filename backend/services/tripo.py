import asyncio
import json
import logging
import struct
from pathlib import Path
from typing import Any, Dict, Optional
import httpx

from backend.config.settings import get_settings
from backend.models.schemas import JobStatusEnum
from backend.services.jobs import jobs
from backend.services.storage import storage

logger = logging.getLogger("3dforge.tripo")


def generate_mock_glb() -> bytes:
    """
    Generates a 100% valid, self-contained binary glTF (GLB) file representing
    a 3D cube/prism. This serves as a reliable mock asset for offline development,
    unit testing, and hackathon demos when an external API key is not present.
    """
    # 8 vertices of a unit cube
    positions = [
        -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,  # Front
        -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,  # Back
        -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,  # Top
        -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,  # Bottom
         0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,   0.5, -0.5,  0.5,  # Right
        -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5   # Left
    ]
    # Triangle indices (12 triangles, 36 indices)
    indices = [
         0,  1,  2,   0,  2,  3,
         4,  5,  6,   4,  6,  7,
         8,  9, 10,   8, 10, 11,
        12, 13, 14,  12, 14, 15,
        16, 17, 18,  16, 18, 19,
        20, 21, 22,  20, 22, 23
    ]

    indices_bytes = struct.pack(f"<{len(indices)}H", *indices)
    positions_bytes = struct.pack(f"<{len(positions)}f", *positions)

    # Pad indices bytes to 4-byte boundary
    pad_indices = (4 - (len(indices_bytes) % 4)) % 4
    indices_bytes += b"\x00" * pad_indices

    bin_data = indices_bytes + positions_bytes
    pad_bin = (4 - (len(bin_data) % 4)) % 4
    bin_data += b"\x00" * pad_bin

    gltf_dict = {
        "asset": {"version": "2.0", "generator": "3DForge-AI-MockProvider"},
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": "3DForge_RawAsset"}],
        "meshes": [{
            "primitives": [{
                "attributes": {"POSITION": 1},
                "indices": 0,
                "mode": 4
            }],
            "name": "RawMesh"
        }],
        "buffers": [{"byteLength": len(bin_data)}],
        "bufferViews": [
            {
                "buffer": 0,
                "byteOffset": 0,
                "byteLength": len(indices_bytes),
                "target": 34963  # ELEMENT_ARRAY_BUFFER
            },
            {
                "buffer": 0,
                "byteOffset": len(indices_bytes),
                "byteLength": len(positions_bytes),
                "target": 34962  # ARRAY_BUFFER
            }
        ],
        "accessors": [
            {
                "bufferView": 0,
                "byteOffset": 0,
                "componentType": 5123,  # UNSIGNED_SHORT
                "count": len(indices),
                "type": "SCALAR",
                "max": [23],
                "min": [0]
            },
            {
                "bufferView": 1,
                "byteOffset": 0,
                "componentType": 5126,  # FLOAT
                "count": len(positions) // 3,
                "type": "VEC3",
                "max": [0.5, 0.5, 0.5],
                "min": [-0.5, -0.5, -0.5]
            }
        ]
    }

    json_str = json.dumps(gltf_dict, separators=(",", ":"))
    json_bytes = json_str.encode("utf-8")
    pad_json = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b" " * pad_json

    total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_data)

    glb = bytearray()
    # GLB Header
    glb.extend(b"glTF")
    glb.extend(struct.pack("<I", 2))
    glb.extend(struct.pack("<I", total_length))

    # Chunk 0: JSON
    glb.extend(struct.pack("<I", len(json_bytes)))
    glb.extend(b"JSON")
    glb.extend(json_bytes)

    # Chunk 1: BIN
    glb.extend(struct.pack("<I", len(bin_data)))
    glb.extend(b"BIN\x00")
    glb.extend(bin_data)

    return bytes(glb)


class TripoService:
    """
    Client for the official Tripo 3D Generation API.
    Handles authentication, text-to-model and image-to-model task creation,
    asynchronous progress polling, and asset retrieval.
    """

    def __init__(self):
        self.settings = get_settings()

    @property
    def api_key(self) -> Optional[str]:
        return self.settings.TRIPO_API_KEY

    @property
    def is_mock_enabled(self) -> bool:
        """Determines if the service should fallback to mock generation."""
        return not bool(self.api_key) and self.settings.ALLOW_MOCK_FALLBACK

    def _get_headers(self) -> Dict[str, str]:
        if not self.api_key:
            raise ValueError("TRIPO_API_KEY is not configured.")
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def run_generation_pipeline(
        self,
        job_id: str,
        prompt: Optional[str] = None,
        image_path: Optional[Path] = None
    ) -> None:
        """
        Background worker that coordinates task submission, polling,
        asset download, and local storage.
        """
        try:
            if self.is_mock_enabled:
                logger.info(f"Using mock 3D generator for job {job_id} (No API key provided)")
                await self._run_mock_generation(job_id, prompt or "image reference")
                return

            if not self.api_key:
                raise ValueError(
                    "Tripo API key is not configured. Please set TRIPO_API_KEY in backend/.env "
                    "or enable ALLOW_MOCK_FALLBACK=True."
                )

            # Update status to generating
            jobs.update_job(
                job_id,
                status=JobStatusEnum.GENERATING,
                stage="AI 3D generation",
                progress=10
            )

            # Step 1: Submit task to Tripo
            task_id = await self._create_task(job_id, prompt=prompt, image_path=image_path)
            jobs.update_job(
                job_id,
                tripo_task_id=task_id,
                stage="AI 3D generation",
                progress=25
            )

            # Step 2: Poll task status until complete or failed
            model_url = await self._poll_task_completion(job_id, task_id)

            # Step 3: Download resulting GLB
            jobs.update_job(
                job_id,
                stage="downloading raw 3D asset",
                progress=90
            )
            saved_path, public_url = await self._download_and_store_model(job_id, model_url)

            # Step 4: Mark job complete and ready for Atharv's processing
            jobs.update_job(
                job_id,
                status=JobStatusEnum.COMPLETED,
                stage="generation complete",
                progress=100,
                model_file_path=str(saved_path),
                model_url=public_url
            )
            logger.info(f"Job {job_id} completed successfully. Model saved to {saved_path}")

        except Exception as exc:
            logger.error(f"Generation pipeline failed for job {job_id}: {exc}", exc_info=True)
            jobs.update_job(
                job_id,
                status=JobStatusEnum.FAILED,
                stage="AI 3D generation",
                progress=0,
                error=str(exc)
            )

    async def _create_task(
        self,
        job_id: str,
        prompt: Optional[str] = None,
        image_path: Optional[Path] = None
    ) -> str:
        """Submits either a text prompt or image file to Tripo API."""
        async with httpx.AsyncClient(timeout=60.0) as client:
            if image_path:
                # 1. Upload image to Tripo
                jobs.update_job(job_id, stage="uploading reference image", progress=15)
                upload_url = f"{self.settings.TRIPO_BASE_URL}/upload"
                with open(image_path, "rb") as f:
                    file_content = f.read()

                ext = image_path.suffix.lstrip(".").lower()
                mime_type = "image/png" if ext == "png" else "image/jpeg"
                files = {"file": (image_path.name, file_content, mime_type)}
                headers = {"Authorization": f"Bearer {self.api_key}"}

                resp = await client.post(upload_url, headers=headers, files=files)
                if resp.status_code != 200:
                    raise RuntimeError(f"Failed to upload image to Tripo: {resp.status_code} - {resp.text}")

                upload_data = resp.json()
                image_token = upload_data.get("data", {}).get("image_token")
                if not image_token:
                    raise RuntimeError(f"Tripo did not return an image token: {upload_data}")

                # 2. Create image_to_model task
                task_url = f"{self.settings.TRIPO_BASE_URL}/task"
                payload = {
                    "type": "image_to_model",
                    "file": {
                        "type": ext if ext in ["jpg", "jpeg", "png"] else "jpg",
                        "file_token": image_token
                    }
                }
            else:
                # Text to model task
                task_url = f"{self.settings.TRIPO_BASE_URL}/task"
                payload = {
                    "type": "text_to_model",
                    "prompt": prompt
                }

            task_resp = await client.post(task_url, headers=self._get_headers(), json=payload)
            if task_resp.status_code != 200:
                raise RuntimeError(f"Tripo task creation failed: {task_resp.status_code} - {task_resp.text}")

            res_json = task_resp.json()
            if res_json.get("code") != 0:
                raise RuntimeError(f"Tripo API error: {res_json.get('message', 'Unknown error')}")

            task_id = res_json.get("data", {}).get("task_id")
            if not task_id:
                raise RuntimeError("No task_id found in Tripo API response")

            return task_id

    async def _poll_task_completion(self, job_id: str, task_id: str) -> str:
        """Polls Tripo task status until finished and returns GLB download URL."""
        status_url = f"{self.settings.TRIPO_BASE_URL}/task/{task_id}"
        headers = self._get_headers()

        async with httpx.AsyncClient(timeout=30.0) as client:
            for _ in range(self.settings.TRIPO_MAX_POLL_RETRIES):
                await asyncio.sleep(self.settings.TRIPO_POLL_INTERVAL_SEC)
                resp = await client.get(status_url, headers=headers)
                if resp.status_code != 200:
                    logger.warning(f"Failed to poll Tripo status: {resp.status_code}")
                    continue

                data = resp.json().get("data", {})
                status = data.get("status")
                tripo_progress = data.get("progress", 0)

                # Map Tripo progress (0-100) to our overall generation stage (25% to 85%)
                calculated_progress = 25 + int(tripo_progress * 0.6)
                jobs.update_job(
                    job_id,
                    status=JobStatusEnum.GENERATING,
                    stage="AI 3D generation",
                    progress=calculated_progress
                )

                if status == "success":
                    output = data.get("output", {})
                    # Tripo output model URL (GLB)
                    model_url = output.get("model") or output.get("pbr_model")
                    if not model_url:
                        raise RuntimeError("Tripo reported success but no model URL was returned.")
                    return model_url

                if status in ["failed", "cancelled"]:
                    error_msg = data.get("message") or f"Tripo generation {status}"
                    raise RuntimeError(error_msg)

            raise TimeoutError("Tripo 3D generation timed out.")

    async def _download_and_store_model(self, job_id: str, model_url: str) -> tuple[Path, str]:
        """Downloads the GLB file from Tripo CDN and saves to local storage."""
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.get(model_url)
            if resp.status_code != 200:
                raise RuntimeError(f"Failed to download generated GLB model from Tripo CDN: {resp.status_code}")
            model_bytes = resp.content

        saved_path = storage.save_generated_model(job_id, model_bytes, filename="model.glb")
        public_url = storage.get_model_url(job_id, filename="model.glb")
        return saved_path, public_url

    async def _run_mock_generation(self, job_id: str, prompt_or_name: str) -> None:
        """Simulates realistic asynchronous 3D generation for testing and demo purposes."""
        logger.info(f"Starting mock 3D model generation for: '{prompt_or_name}'")

        # Step 1: Queued -> Generating
        await asyncio.sleep(1.0)
        jobs.update_job(
            job_id,
            status=JobStatusEnum.GENERATING,
            stage="AI 3D generation",
            progress=30
        )

        # Step 2: In-progress
        await asyncio.sleep(1.5)
        jobs.update_job(
            job_id,
            status=JobStatusEnum.GENERATING,
            stage="AI 3D generation",
            progress=65
        )

        # Step 3: Downloading / saving
        await asyncio.sleep(1.0)
        jobs.update_job(
            job_id,
            stage="saving raw 3D model",
            progress=90
        )

        # Create valid mock GLB asset
        glb_bytes = generate_mock_glb()
        saved_path = storage.save_generated_model(job_id, glb_bytes, filename="model.glb")
        public_url = storage.get_model_url(job_id, filename="model.glb")

        # Step 4: Complete
        jobs.update_job(
            job_id,
            status=JobStatusEnum.COMPLETED,
            stage="generation complete",
            progress=100,
            model_file_path=str(saved_path),
            model_url=public_url
        )


tripo_service = TripoService()
