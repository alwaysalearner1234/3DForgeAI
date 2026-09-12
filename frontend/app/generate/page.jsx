"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Type, Image as ImageIcon, Sparkles, AlertCircle, Wand2, Lightbulb } from "lucide-react";
import FileUpload from "../../components/FileUpload";
import GenerateButton from "../../components/GenerateButton";
import ProgressTracker from "../../components/ProgressTracker";
import { generate3D, getJobStatus } from "../../lib/api";

const PRESET_PROMPTS = [
    "A futuristic humanoid combat robot with carbon armor and cyan core reactor",
    "A detailed cyberpunk reconnaissance drone with quad-rotors and optics",
    "An ancient runic obsidian broadsword with glowing etched runes",
    "A sci-fi tactical astronaut helmet with gold reflective visor"
];

export default function GeneratePage() {
    const router = useRouter();
    const [mode, setMode] = useState("text");
    const [prompt, setPrompt] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusData, setStatusData] = useState(null);
    const [error, setError] = useState("");

    const isButtonDisabled = mode === "text" ? !prompt.trim() : !imageFile;

    const handleStartGeneration = useCallback(async () => {
        if (isButtonDisabled || isSubmitting) return;

        setError("");
        setIsSubmitting(true);
        setStatusData({ status: "queued", stage: "Submitting request to cluster...", progress: 8 });

        try {
            let payload;
            if (mode === "text") {
                payload = prompt.trim();
                console.log(`[GeneratePage] Starting text generation with prompt: "${payload}"`);
            } else {
                payload = new FormData();
                payload.append("image", imageFile);
                console.log(`[GeneratePage] Starting image generation with file: "${imageFile.name}" (${imageFile.size} bytes)`);
            }

            const genResponse = await generate3D(payload);
            const jobId = genResponse.job_id;
            console.log(`[GeneratePage] Received Job ID from backend: ${jobId}`);

            if (!jobId) {
                throw new Error("No job_id returned by generation engine.");
            }

            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await getJobStatus(jobId);
                    console.log(`[GeneratePage] Job ${jobId} status: ${statusRes.status} (${statusRes.progress}%) - ${statusRes.stage}`);
                    setStatusData(statusRes);

                    if (statusRes.status === "completed") {
                        clearInterval(pollInterval);
                        console.log(`[GeneratePage] Job ${jobId} completed. Redirecting to /result?job_id=${jobId}`);
                        setTimeout(() => {
                            router.push(`/result?job_id=${jobId}`);
                        }, 500);
                    } else if (statusRes.status === "failed") {
                        clearInterval(pollInterval);
                        console.error(`[GeneratePage] Job ${jobId} failed:`, statusRes.error);
                        setError(statusRes.error || "Generation pipeline failed.");
                    }
                } catch (pollError) {
                    console.error("[GeneratePage] Polling error:", pollError);
                }
            }, 1500);
        } catch (err) {
            console.error("[GeneratePage] Generation submission error:", err);
            setError(err.message || "Failed to initiate generation pipeline.");
            setIsSubmitting(false);
            setStatusData(null);
        }
    }, [isButtonDisabled, isSubmitting, mode, prompt, imageFile, router]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleStartGeneration();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleStartGeneration]);

    return (
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-semibold mb-4 backdrop-blur-md">
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Automated 3D Asset Synthesis</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                    Generate 3D Asset
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-400">
                    Transform text descriptions or reference imagery into production-ready 3D geometry with automated topology decimation.
                </p>
            </div>

            {/* Input Mode Selector */}
            <div className="bg-slate-900/70 border border-slate-800/80 p-1.5 rounded-2xl flex max-w-md mx-auto mb-8 shadow-lg">
                <button
                    type="button"
                    onClick={() => setMode("text")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${mode === "text"
                            ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                >
                    <Type className="w-4 h-4" />
                    <span>Text Prompt</span>
                </button>

                <button
                    type="button"
                    onClick={() => setMode("image")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all ${mode === "image"
                            ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    <span>Image Reference</span>
                </button>
            </div>

            {/* Glassmorphism Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                {mode === "text" ? (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label
                                htmlFor="prompt"
                                className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                            >
                                Prompt Input
                            </label>
                            <span className="text-xs font-mono text-slate-500">{prompt.length} chars</span>
                        </div>

                        <textarea
                            id="prompt"
                            rows={5}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your 3D model (e.g., A realistic futuristic humanoid robot with metallic armor, glowing panels and mechanical joints...)"
                            className="w-full rounded-2xl bg-slate-950/90 border border-slate-800/90 p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none shadow-inner"
                        />

                        {/* Quick Inspiration Chips */}
                        <div className="mt-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2.5 font-medium">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                <span>Try one-click prompt templates:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_PROMPTS.map((sample, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setPrompt(sample)}
                                        className="text-[11px] text-slate-400 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 px-3 py-1.5 rounded-lg transition-all text-left"
                                    >
                                        + {sample.substring(0, 36)}...
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Reference Image
                        </label>
                        <FileUpload
                            file={imageFile}
                            onFileSelect={(file) => setImageFile(file)}
                            onFileRemove={() => setImageFile(null)}
                        />
                    </div>
                )}

                {error && !isSubmitting && (
                    <div className="mt-4 flex items-center gap-2 text-rose-400 text-xs bg-rose-950/40 border border-rose-800/50 p-3.5 rounded-xl">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="mt-8">
                    <GenerateButton
                        disabled={isButtonDisabled}
                        loading={isSubmitting}
                        onClick={handleStartGeneration}
                    />
                </div>
            </div>

            {isSubmitting && (
                <ProgressTracker
                    statusData={statusData}
                    onRetry={() => {
                        setIsSubmitting(false);
                        setStatusData(null);
                        setError("");
                    }}
                />
            )}
        </div>
    );
}