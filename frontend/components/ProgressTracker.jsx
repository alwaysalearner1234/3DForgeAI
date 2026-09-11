"use client";

import { motion } from "framer-motion";
import { Check, Loader2, Circle, AlertTriangle, RefreshCw } from "lucide-react";

export default function ProgressTracker({ statusData, onRetry }) {
    const currentStatus = statusData?.status || "queued";
    const stageDescription = statusData?.stage || "Processing asset...";
    const progressPercent = statusData?.progress ?? 10;
    const isFailed = currentStatus === "failed";

    const pipelineStages = [
        {
            id: "input",
            label: "Input received",
            desc: "Prompt sanitized and queued for synthesis",
            isComplete: () => true,
            isActive: () => false,
        },
        {
            id: "generating",
            label: "AI generating...",
            desc: "Tripo 3D neural engine synthesizes initial mesh",
            isComplete: () =>
                ["processing", "optimizing", "validating", "completed"].includes(currentStatus),
            isActive: () => ["queued", "generating"].includes(currentStatus),
        },
        {
            id: "optimizing",
            label: "Optimizing mesh...",
            desc: "Decimating polygon count (450K → 120K) and removing non-manifold edges",
            isComplete: () => ["validating", "completed"].includes(currentStatus),
            isActive: () => ["processing", "optimizing"].includes(currentStatus),
        },
        {
            id: "uv",
            label: "Processing UVs...",
            desc: "Generating unwrapped coordinate islands and texture projection",
            isComplete: () => ["validating", "completed"].includes(currentStatus),
            isActive: () => currentStatus === "optimizing",
        },
        {
            id: "preparing",
            label: "Preparing final model...",
            desc: "Validating geometry watertightness and packaging production GLB",
            isComplete: () => currentStatus === "completed",
            isActive: () => currentStatus === "validating",
        },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 relative overflow-hidden"
            >
                {/* Top Glow Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-400 to-violet-500" />

                {isFailed ? (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
                        <p className="text-sm text-slate-400 mb-6">
                            {statusData?.error || "An error occurred during the 3D generation pipeline. Please try again."}
                        </p>
                        <button
                            onClick={onRetry}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Try Again</span>
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Header */}
                        <div className="mb-6">
                            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                                Pipeline In Progress
                            </span>
                            <h3 className="text-xl font-bold text-white mt-1">
                                Synthesizing Production Asset
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">{stageDescription}</p>
                        </div>

                        {/* Overall Progress Bar */}
                        <div className="w-full bg-slate-950 rounded-full h-2.5 p-0.5 border border-slate-800 mb-8">
                            <div
                                className="bg-gradient-to-r from-cyan-400 to-violet-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(5, progressPercent)}%` }}
                            />
                        </div>

                        {/* Vertical Stage Tracker */}
                        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                            {pipelineStages.map((stage) => {
                                const complete = stage.isComplete();
                                const active = stage.isActive();

                                return (
                                    <div key={stage.id} className="relative flex items-start gap-4">
                                        {/* Status Node Icon */}
                                        <div
                                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors ${complete
                                                    ? "bg-emerald-500 text-slate-950"
                                                    : active
                                                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400 animate-pulse"
                                                        : "bg-slate-950 text-slate-600 border border-slate-800"
                                                }`}
                                        >
                                            {complete ? (
                                                <Check className="w-4 h-4 stroke-[3]" />
                                            ) : active ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                            ) : (
                                                <Circle className="w-2.5 h-2.5 fill-current" />
                                            )}
                                        </div>

                                        {/* Step Details */}
                                        <div>
                                            <h4
                                                className={`text-sm font-semibold transition-colors ${complete
                                                        ? "text-emerald-400"
                                                        : active
                                                            ? "text-cyan-300 font-bold"
                                                            : "text-slate-500"
                                                    }`}
                                            >
                                                {stage.label}
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                                {stage.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                            <span>Polling status every 3s</span>
                            <span className="font-mono text-cyan-400">{progressPercent}% complete</span>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}