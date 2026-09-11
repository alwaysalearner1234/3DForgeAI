"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import QualityReport from "../../components/QualityReport";
import { getJobResult } from "../../lib/api";

// Dynamically import ModelViewer with SSR disabled for WebGL stability
const ModelViewer = dynamic(() => import("../../components/ModelViewer"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[400px] lg:min-h-[580px] bg-slate-950/80 flex flex-col items-center justify-center border border-slate-800 rounded-3xl gap-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Initializing 3D Canvas...</span>
        </div>
    ),
});

function ResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const jobId = searchParams.get("job_id");

    const [loading, setLoading] = useState(true);
    const [resultData, setResultData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!jobId) {
            setError("No job_id provided in URL parameters.");
            setLoading(false);
            return;
        }

        async function loadResult() {
            try {
                setLoading(true);
                const data = await getJobResult(jobId);
                if (data.status === "failed") {
                    throw new Error(data.error || "Generation job failed.");
                }
                setResultData(data);
            } catch (err) {
                console.error("Failed to load result:", err);
                setError(err.message || "Could not retrieve 3D asset result.");
            } finally {
                setLoading(false);
            }
        }

        loadResult();
    }, [jobId]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                <p className="text-sm text-slate-300 font-medium">
                    Retrieving 3D model &amp; inspection data...
                </p>
            </div>
        );
    }

    if (error || !resultData) {
        return (
            <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Asset Not Found</h2>
                <p className="text-sm text-slate-400 mb-6">{error}</p>
                <button
                    onClick={() => router.push("/generate")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Generate</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col">
            {/* Top Breadcrumb */}
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={() => router.push("/generate")}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Generate New Model</span>
                </button>
                <span className="text-xs font-mono text-slate-500">
                    Job ID: {jobId}
                </span>
            </div>

            {/* Two-Column Responsive Layout: 60% Left Viewer / 40% Right Info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-stretch">
                {/* Left Column — 3D Viewer */}
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[50vh] lg:h-auto min-h-[400px] lg:min-h-[600px]">
                    <ModelViewer modelUrl={resultData.model_url} />
                </div>

                {/* Right Column — Asset Quality Panel */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
                    <QualityReport
                        metrics={resultData.metrics}
                        modelUrl={resultData.model_url}
                        jobId={jobId}
                    />
                </div>
            </div>
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense
            fallback={
                <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                </div>
            }
        >
            <ResultContent />
        </Suspense>
    );
}