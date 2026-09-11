/**
 * Mock Simulation Engine for 3DForge AI
 * Simulates Tripo 3D generation and Blender/PyMeshLab post-processing.
 */

// Track start times for active mock jobs to simulate 10-second processing
const mockJobStore = new Map();

/**
 * Creates a simulated job
 */
export async function mockGenerate(input) {
    // Simulate 1s network latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const jobId = "mock-" + Math.random().toString(36).substring(2, 9);
    mockJobStore.set(jobId, {
        startTime: Date.now(),
        input: typeof input === "string" ? input : "Image Upload",
    });

    return {
        job_id: jobId,
        status: "queued",
    };
}

/**
 * Simulates the 5-stage processing pipeline over ~10 seconds
 */
export async function mockGetStatus(jobId) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const job = mockJobStore.get(jobId);
    const elapsed = job ? (Date.now() - job.startTime) / 1000 : 10;

    if (elapsed < 2) {
        return {
            job_id: jobId,
            status: "queued",
            stage: "Queued in generation cluster",
            progress: 15,
        };
    } else if (elapsed < 4.5) {
        return {
            job_id: jobId,
            status: "generating",
            stage: "AI 3D generation (Tripo engine)",
            progress: 42,
        };
    } else if (elapsed < 7) {
        return {
            job_id: jobId,
            status: "processing",
            stage: "Mesh cleanup & duplicate vertex removal",
            progress: 68,
        };
    } else if (elapsed < 9) {
        return {
            job_id: jobId,
            status: "optimizing",
            stage: "Polygon reduction & UV optimization",
            progress: 88,
        };
    } else if (elapsed < 10.5) {
        return {
            job_id: jobId,
            status: "validating",
            stage: "Validating geometry & packaging GLB",
            progress: 96,
        };
    } else {
        return {
            job_id: jobId,
            status: "completed",
            stage: "Generation complete",
            progress: 100,
        };
    }
}

/**
 * Returns the final GLB asset and quality metrics
 */
export async function mockGetResult(jobId) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
        status: "completed",
        // Public battle-tested GLB model for testing Three.js rendering
        model_url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
        format: "glb",
        metrics: {
            polygon_before: 450000,
            polygon_after: 120000,
            mesh_status: "clean",
            uv_status: "optimized",
            texture_status: "preserved",
        },
    };
}

/**
 * Simulates backend health status
 */
export async function mockGetHealth() {
    return { status: "ok" };
}