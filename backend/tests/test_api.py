import io
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure sys.path includes backend and root
_backend_dir = Path(__file__).resolve().parent.parent
_project_root = _backend_dir.parent
for _p in [str(_backend_dir), str(_project_root)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from backend.main import app
from backend.models.schemas import JobStatusEnum
from backend.services.jobs import jobs
from backend.services.storage import storage
from backend.services.asset_templates import SemanticAssetEngine, generate_procedural_sword_glb, analyze_glb_data

client = TestClient(app)


def test_health_check():
    """Verify GET /health returns 200 and status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_generate_text_prompt_success():
    """Verify POST /generate with valid JSON prompt returns 202 and job_id."""
    payload = {"prompt": "A realistic futuristic humanoid robot with metallic armor"}
    response = client.post("/generate", json=payload)
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert data["job_id"].startswith("job_")
    assert data["status"] == "queued"

    # Verify job is tracked in jobs store
    job_record = jobs.get_job(data["job_id"])
    assert job_record is not None
    assert job_record.prompt == payload["prompt"]


def test_generate_text_empty_prompt():
    """Verify POST /generate with empty string prompt returns 400."""
    response = client.post("/generate", json={"prompt": "   "})
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_generate_missing_input():
    """Verify POST /generate with missing prompt returns 422 or 400."""
    response = client.post("/generate", json={})
    assert response.status_code in [400, 422]


def test_generate_image_upload_success():
    """Verify POST /generate with multipart image upload returns 202."""
    # Create fake image bytes (PNG magic bytes)
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"
    file = io.BytesIO(png_bytes)
    file.name = "robot.png"

    response = client.post(
        "/generate",
        files={"image": ("robot.png", file, "image/png")},
        data={"prompt": "Robot based on reference"}
    )
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "queued"

    # Verify upload was stored
    job_record = jobs.get_job(data["job_id"])
    assert job_record is not None
    assert job_record.image_filename is not None
    assert storage.get_upload_path(job_record.image_filename) is not None


def test_generate_invalid_image_extension():
    """Verify POST /generate with non-image file returns 400."""
    file = io.BytesIO(b"not an image text content")
    response = client.post(
        "/generate",
        files={"image": ("sample.txt", file, "text/plain")}
    )
    assert response.status_code == 400
    assert "unsupported" in response.json()["detail"].lower()


def test_get_status_existing_job():
    """Verify GET /status/{job_id} returns accurate job details."""
    job = jobs.create_job(prompt="Test Status Query")
    jobs.update_job(job.job_id, status=JobStatusEnum.GENERATING, stage="AI 3D generation", progress=45)

    response = client.get(f"/status/{job.job_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["job_id"] == job.job_id
    assert data["status"] == "generating"
    assert data["stage"] == "AI 3D generation"
    assert data["progress"] == 45
    assert data["error"] is None


def test_get_status_not_found():
    """Verify GET /status for unknown ID returns 404."""
    response = client.get("/status/job_nonexistent123")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_result_not_found():
    """Verify GET /result for unknown ID returns 404."""
    response = client.get("/result/job_nonexistent123")
    assert response.status_code == 404


def test_get_result_in_progress():
    """Verify GET /result for an in-progress job returns 409 Conflict."""
    job = jobs.create_job(prompt="In progress model")
    jobs.update_job(job.job_id, status=JobStatusEnum.GENERATING, progress=50)

    response = client.get(f"/result/{job.job_id}")
    assert response.status_code == 409
    assert "in progress" in response.json()["detail"].lower()


def test_get_result_and_download_completed_job():
    """Verify GET /result/{job_id} and /download/{job_id} for a completed job."""
    job = jobs.create_job(prompt="Complete model test")
    glb_content = generate_procedural_sword_glb()
    storage.save_generated_model(job.job_id, glb_content, "model.glb")
    model_url = storage.get_model_url(job.job_id, "model.glb")
    metrics = analyze_glb_data(glb_content)

    jobs.update_job(
        job.job_id,
        status=JobStatusEnum.COMPLETED,
        stage="generation complete",
        progress=100,
        model_url=model_url,
        metrics=metrics
    )

    # 1. Test /result/{job_id}
    res_response = client.get(f"/result/{job.job_id}")
    assert res_response.status_code == 200
    res_data = res_response.json()
    assert res_data["status"] == "completed"
    assert res_data["format"] == "glb"
    assert res_data["asset_url"] == model_url
    assert res_data["job_id"] == job.job_id
    assert res_data["metrics"]["polygon_count"] > 12  # Real mesh, not a simple 12-triangle cube

    # 2. Test /download/{job_id}
    dl_response = client.get(f"/download/{job.job_id}")
    assert dl_response.status_code == 200
    assert dl_response.headers["content-type"] == "model/gltf-binary"
    assert dl_response.content[:4] == b"glTF"


def test_procedural_sword_glb_is_valid():
    """Verify procedural sword generator outputs a valid glTF 2.0 binary header with rich geometry."""
    glb = generate_procedural_sword_glb()
    assert len(glb) > 1000  # Detailed asset, not 1024 byte cube
    assert glb[:4] == b"glTF"
    version = int.from_bytes(glb[4:8], "little")
    length = int.from_bytes(glb[8:12], "little")
    assert version == 2
    assert length == len(glb)

    metrics = analyze_glb_data(glb)
    assert metrics["polygon_count"] > 50
    assert metrics["vertex_count"] > 100


def test_different_inputs_produce_different_assets():
    """Verify that different prompts produce completely distinct 3D models with different geometry."""
    inputs = [
        "A futuristic sports car",
        "A wooden office chair",
        "A low-poly medieval sword",
        "A cute robot character"
    ]
    assets = []
    for prompt in inputs:
        glb, label = SemanticAssetEngine.get_asset_for_input(prompt=prompt)
        metrics = analyze_glb_data(glb)
        assets.append({
            "prompt": prompt,
            "label": label,
            "size": len(glb),
            "polygons": metrics["polygon_count"],
            "vertices": metrics["vertex_count"]
        })

    # Ensure all sizes and labels are distinct
    labels = [a["label"] for a in assets]
    sizes = [a["size"] for a in assets]
    assert len(set(labels)) == len(inputs), f"Labels not distinct: {labels}"
    assert len(set(sizes)) == len(inputs), f"Sizes not distinct: {sizes}"

