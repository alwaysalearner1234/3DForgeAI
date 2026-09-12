/**
 * 3DForge AI - API Client
 * Toggles between mock mode and real FastAPI backend (http://localhost:8000)
 */

import {
    mockGenerate,
    mockGetStatus,
    mockGetResult,
    mockGetHealth,
} from "./mock";

// Set to false when connecting to Lidiya's running FastAPI backend
export const USE_MOCK = false;

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

/**
 * Starts 3D generation from text prompt or image file
 * @param {string | FormData} payload
 */
export async function generate3D(payload) {
    if (USE_MOCK) {
        console.log("[Frontend API] [MOCK MODE] generate3D called with:", payload);
        return mockGenerate(payload);
    }

    try {
        console.log("[Frontend API] Generation request initiated with payload:",
            payload instanceof FormData ? "FormData (Image Upload)" : { prompt: payload }
        );

        let response;
        if (payload instanceof FormData) {
            // Image upload mode (multipart/form-data)
            response = await fetch(`${API_BASE_URL}/generate`, {
                method: "POST",
                body: payload,
            });
        } else {
            // Text prompt mode (application/json)
            response = await fetch(`${API_BASE_URL}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: payload }),
            });
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || errData.error || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        console.log("[Frontend API] Generation response received:", data);
        return data;
    } catch (error) {
        console.error("[Frontend API] generate3D error:", error);
        throw error;
    }
}

/**
 * Polls job status
 * @param {string} jobId
 */
export async function getJobStatus(jobId) {
    if (USE_MOCK) {
        return mockGetStatus(jobId);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch status: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(`[Frontend API] Polling status for ${jobId}: ${data.status} (${data.progress}%) - ${data.stage}`);
        return data;
    } catch (error) {
        console.error("[Frontend API] getJobStatus error:", error);
        throw error;
    }
}

/**
 * Fetches final model URL and quality metadata
 * @param {string} jobId
 */
export async function getJobResult(jobId) {
    if (USE_MOCK) {
        return mockGetResult(jobId);
    }

    try {
        console.log(`[Frontend API] Fetching result for job_id: ${jobId}`);
        const response = await fetch(`${API_BASE_URL}/result/${jobId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch result: ${response.statusText}`);
        }

        const data = await response.json();

        // Normalize URLs
        if (data.asset_url && data.asset_url.startsWith("/")) {
            data.asset_url = `${API_BASE_URL}${data.asset_url}`;
        }
        if (data.model_url && data.model_url.startsWith("/")) {
            data.model_url = `${API_BASE_URL}${data.model_url}`;
        }
        if (!data.asset_url && data.model_url) {
            data.asset_url = data.model_url;
        }

        console.log(`[Frontend API] Job ${jobId} Result loaded successfully:`, {
            asset_url: data.asset_url,
            format: data.format,
            prompt: data.prompt,
            metrics: data.metrics
        });

        return data;
    } catch (error) {
        console.error("[Frontend API] getJobResult error:", error);
        throw error;
    }
}

/**
 * Verifies backend availability
 */
export async function checkBackendHealth() {
    if (USE_MOCK) {
        return mockGetHealth();
    }

    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
}