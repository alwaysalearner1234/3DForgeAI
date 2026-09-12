"use client";

import { useState } from "react";
import Link from "next/link";
import {
    CheckCircle2,
    TrendingDown,
    Download,
    Sparkles,
    Layers,
    Copy,
    Check,
    Cpu,
    ShieldCheck,
    AlertCircle,
    Info
} from "lucide-react";

export default function QualityReport({ metrics, modelUrl, jobId }) {
    const [copied, setCopied] = useState(false);

    // Check if real metrics exist
    const hasRealMetrics =
        metrics &&
        (typeof metrics.polygon_count === "number" || typeof metrics.polygon_after === "number");

    const faceCount = hasRealMetrics
        ? (metrics.polygon_count ?? metrics.polygon_after)
        : null;

    const vertexCount = hasRealMetrics ? metrics.vertex_count : null;
    const fileSizeKb = hasRealMetrics ? metrics.file_size_kb : null;
    const polygonBefore = hasRealMetrics ? metrics.polygon_before : null;
    const reductionPercent = hasRealMetrics ? (metrics.reduction_percent ?? 0) : null;
    const assetLabel = metrics?.asset_label || null;

    const meshStatus = metrics?.mesh_status || (hasRealMetrics ? "Clean" : "Analysis unavailable");
    const uvStatus = metrics?.uv_status || (hasRealMetrics ? "Optimized" : "Analysis unavailable");
    const textureStatus = metrics?.texture_status || (hasRealMetrics ? "Preserved" : "Analysis unavailable");
    const format = (metrics?.format || "glb").toUpperCase();

    const handleCopyJobId = () => {
        if (jobId) {
            navigator.clipboard.writeText(jobId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (!modelUrl) return;
        const a = document.createElement("a");
        a.href = modelUrl;
        a.download = `3DForge-${jobId || "asset"}.glb`;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{hasRealMetrics ? "Production Validated" : "Mesh Ready"}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mt-2 tracking-tight">
                            Asset Quality Report
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {assetLabel ? `Asset: ${assetLabel} • ` : ""}
                            Geometric topology evaluated for real-time 3D rendering.
                        </p>
                    </div>

                    {jobId && (
                        <button
                            onClick={handleCopyJobId}
                            title="Copy Job ID"
                            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            <span className="hidden sm:inline">{jobId.substring(0, 9)}</span>
                        </button>
                    )}
                </div>

                {/* Geometry Section */}
                <div className="mt-6">
                    <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            Geometry Topology
                        </span>
                        {hasRealMetrics && reductionPercent > 0 ? (
                            <span className="font-mono text-emerald-400 font-bold">
                                -{reductionPercent}% Polygons
                            </span>
                        ) : null}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 mb-6">
                        {hasRealMetrics ? (
                            <>
                                {polygonBefore && polygonBefore > faceCount && (
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-xs text-slate-400">Raw Geometry</span>
                                        <span className="text-xs font-mono line-through text-slate-500">
                                            {polygonBefore.toLocaleString()} faces
                                        </span>
                                    </div>
                                )}

                                {/* Real Polygon Count Display */}
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xs font-semibold text-cyan-300">
                                        Validated Mesh Polygons
                                    </span>
                                    <span className="text-sm font-mono font-bold text-white">
                                        {faceCount.toLocaleString()} faces
                                    </span>
                                </div>

                                {vertexCount != null && (
                                    <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-slate-800/60">
                                        <span className="text-xs text-slate-400">Total Vertices</span>
                                        <span className="text-xs font-mono text-slate-300">
                                            {vertexCount.toLocaleString()} vertices
                                        </span>
                                    </div>
                                )}

                                {fileSizeKb != null && (
                                    <div className="flex justify-between items-baseline mt-1.5">
                                        <span className="text-xs text-slate-400">Asset File Size</span>
                                        <span className="text-xs font-mono text-slate-300">
                                            {fileSizeKb} KB
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-2 text-center">
                                <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-medium">
                                    <Info className="w-4 h-4" />
                                    <span>Analysis unavailable</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Mesh topology metrics could not be computed for this asset.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Subsystem Badges */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-slate-400 block text-[11px]">Mesh Topology</span>
                            <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-1 capitalize">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {meshStatus}
                            </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-slate-400 block text-[11px]">UV Mapping</span>
                            <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-1 capitalize">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {uvStatus}
                            </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-slate-400 block text-[11px]">PBR Materials</span>
                            <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-1 capitalize">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {textureStatus}
                            </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-slate-400 block text-[11px]">Target Export</span>
                            <span className="font-semibold text-cyan-400 flex items-center gap-1.5 mt-1">
                                <Cpu className="w-3.5 h-3.5" />
                                {format} Binary
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-3">
                <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                    <Download className="w-5 h-5" />
                    <span>Download Production {format}</span>
                </button>

                <Link
                    href="/generate"
                    className="w-full py-3.5 px-6 rounded-xl font-medium text-sm text-center border border-slate-800 bg-slate-950/70 hover:bg-slate-800/80 text-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Generate Another Asset</span>
                </Link>
            </div>
        </div>
    );
}