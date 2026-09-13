"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ModelViewer from "../../components/ModelViewer";
import { Loader2, AlertTriangle, ArrowLeft, Sparkles, RefreshCw, Tag } from "lucide-react";
import QualityReport from "../../components/QualityReport";
import { getJobResult } from "../../lib/api";

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
                console.log(`[ResultPage] Requesting job result for: ${jobId}`);
                const data = await getJobResult(jobId);

                if (data.status === "failed") {
                    throw new Error(data.error || "3D generation failed during processing.");
                }

                const resolvedUrl = data.asset_url || data.model_url;
                if (!resolvedUrl) {
                    throw new Error("Backend reported success but returned no asset_url.");
                }

                console.log(`[ResultPage] Successfully received model asset URL: ${resolvedUrl}`);
                setResultData(data);
            } catch (err) {
                console.error("[ResultPage] Failed to load result:", err);
                setError(err.message || "3D generation failed.");
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
                <p className="text-sm text-slate-300 font-medium font-mono">
                    Retrieving 3D asset &amp; geometry analysis...
                </p>
            </div>
        );
    }

    if (error || !resultData) {
        return (
            <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">3D generation failed</h2>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                    {error || "An unexpected error occurred while generating the 3D model."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                    <button
                        onClick={() => router.push("/generate")}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry Generation</span>
                    </button>
                    <button
                        onClick={() => router.push("/generate")}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors border border-slate-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </button>
                </div>
            </div>
        );
    }

    const activeAssetUrl = resultData.asset_url || resultData.model_url;

    return (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col">
            {/* Top Navigation & Metadata Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <button
                    onClick={() => router.push("/generate")}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Generate New Model</span>
                </button>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {resultData.prompt && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-300 max-w-md truncate">
                            <Tag className="w-3 h-3 flex-shrink-0 text-cyan-400" />
                            <span className="truncate">&quot;{resultData.prompt}&quot;</span>
                        </div>
                    )}
                    {resultData.source_image && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-violet-300">
                            <span>Image: {resultData.source_image}</span>
                        </div>
                    )}
                    <span className="font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/60">
                        Job: {jobId}
                    </span>
                </div>
            </div>

            {/* Two-Column Responsive Layout: 60% Left Viewer / 40% Right Info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-stretch">
                {/* Left Column — 3D Viewer */}
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[50vh] lg:h-auto min-h-[400px] lg:min-h-[600px]">
                    <ModelViewer modelUrl={activeAssetUrl} />
                </div>

                {/* Right Column — Asset Quality Panel */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
                    <QualityReport
                        metrics={resultData.metrics}
                        modelUrl={activeAssetUrl}
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