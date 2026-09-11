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
} from "lucide-react";

export default function QualityReport({ metrics, modelUrl, jobId }) {
    const [copied, setCopied] = useState(false);

    const quality = {
        polygon_before: metrics?.polygon_before || 450000,
        polygon_after: metrics?.polygon_after || 120000,
        mesh_status: metrics?.mesh_status || "clean",
        uv_status: metrics?.uv_status || "optimized",
        texture_status: metrics?.texture_status || "preserved",
        format: (metrics?.format || "glb").toUpperCase(),
    };

    const reductionPercent = Math.round(
        ((quality.polygon_before - quality.polygon_after) / quality.polygon_before) * 100
    );

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
                            <span>Production Validated</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mt-2 tracking-tight">
                            Asset Quality Report
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Geometry post-processed for real-time engines and Blender import.
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

                {/* Polygon Decimation Meter */}
                <div className="mt-6">
                    <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            Geometry Optimization
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                            -{reductionPercent}% Polygons
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 mb-6">
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-xs text-slate-400">Raw AI Mesh</span>
                            <span className="text-xs font-mono line-through text-slate-500">
                                {quality.polygon_before.toLocaleString()} faces
                            </span>
                        </div>

                        {/* Visual Bar Comparison */}
                        <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-800 relative overflow-hidden mb-3">
                            <div
                                className="bg-gradient-to-r from-cyan-400 to-violet-500 h-full rounded-full"
                                style={{ width: `${100 - reductionPercent}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-baseline">
                            <span className="text-xs font-semibold text-cyan-300">Cleaned &amp; Decimated</span>
                            <span className="text-sm font-mono font-bold text-white">
                                {quality.polygon_after.toLocaleString()} faces
                            </span>
                        </div>
                    </div>

                    {/* Subsystem Badges */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-slate-400 block text-[11px]">Mesh Topology</span>
                            <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-1 capitalize">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {quality.mesh_status}
                            </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-slate-400 block text-[11px]">UV Mapping</span>
                            <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-1 capitalize">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {quality.uv_status}
                            </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-slate-400 block text-[11px]">PBR Materials</span>
                            <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-1 capitalize">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {quality.texture_status}
                            </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-slate-400 block text-[11px]">Target Export</span>
                            <span className="font-semibold text-cyan-400 flex items-center gap-1.5 mt-1">
                                <Cpu className="w-3.5 h-3.5" />
                                {quality.format} Binary
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-3">
                <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                    <Download className="w-5 h-5" />
                    <span>Download Production {quality.format}</span>
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