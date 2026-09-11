"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    Sparkles,
    ArrowRight,
    Cpu,
    Layers,
    Box,
    CheckCircle2,
    Sliders,
    ShieldCheck,
    Zap,
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            {/* Hero Section */}
            <section className="max-w-4xl mx-auto text-center relative z-10">
                {/* Release / Hackathon Pill */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 text-xs font-medium mb-8 backdrop-blur-md shadow-inner shadow-cyan-500/10"
                >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Automated Generation-to-Production Pipeline</span>
                </motion.div>

                {/* Hero Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight"
                >
                    <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                        Make 3D Models Ready for
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-500 bg-clip-text text-transparent">
                        Real Production
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
                >
                    From a simple idea to a production-ready 3D asset — automatically.
                    We don&apos;t just generate raw geometry; we optimize polygons, clean UVs, and deliver Blender-compatible GLB files.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/generate"
                        className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-base shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 group"
                    >
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Start Creating</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <a
                        href="#workflow"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 font-medium text-base transition-colors"
                    >
                        How it Works
                    </a>
                </motion.div>
            </section>

            {/* 3-Step Workflow Section */}
            <section id="workflow" className="w-full max-w-6xl mx-auto mt-24 sm:mt-32">
                <div className="text-center mb-14">
                    <h2 className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                        End-To-End Architecture
                    </h2>
                    <p className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        How 3DForge AI Transforms Your Input
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {/* Step 1 */}
                    <div className="relative p-6 sm:p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-between hover:border-cyan-500/40 transition-colors group">
                        <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400">
                            STEP 01
                        </div>
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">1. Generate</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Provide a natural language prompt or upload a reference image. Our FastAPI backend orchestrates the Tripo 3D engine to synthesize the initial mesh representation.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs text-slate-500">
                            <span>Text Prompt or Image</span>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative p-6 sm:p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-between hover:border-violet-500/40 transition-colors group">
                        <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-violet-400">
                            STEP 02
                        </div>
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">2. Optimize</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                PyMeshLab and Blender Python pipelines clean dirty geometry, remove duplicate vertices, decimate excessive polygons (e.g. 450K → 120K), and stabilize UV layouts.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs text-slate-500">
                            <span>Blender &amp; PyMeshLab Automation</span>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative p-6 sm:p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors group">
                        <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400">
                            STEP 03
                        </div>
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                <Box className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">3. Preview &amp; Export</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Inspect your processed 3D asset directly in our interactive Three.js viewer with quality metrics, wireframe inspection, and one-click GLB download.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs text-slate-500">
                            <span>Interactive Three.js &amp; GLB</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Production Comparison Highlights */}
            <section className="w-full max-w-5xl mx-auto mt-20 p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
                    <div className="px-4 py-2">
                        <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-1">
                            ~73%
                        </div>
                        <div className="text-sm font-semibold text-slate-200">Polygon Reduction</div>
                        <p className="text-xs text-slate-400 mt-1">
                            450K raw faces decimated down to 120K clean triangles.
                        </p>
                    </div>

                    <div className="px-4 py-2">
                        <div className="text-2xl sm:text-3xl font-bold text-violet-400 mb-1">
                            Automated
                        </div>
                        <div className="text-sm font-semibold text-slate-200">UV Preservation</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Unwrapped and re-projected coordinates without stretching.
                        </p>
                    </div>

                    <div className="px-4 py-2">
                        <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">
                            100%
                        </div>
                        <div className="text-sm font-semibold text-slate-200">Blender Compatible</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Standard GLB format ready for game engines and rigging pipelines.
                        </p>
                    </div>
                </div>
            </section>

            {/* Powered By Section */}
            <section className="w-full max-w-4xl mx-auto mt-20 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
                    Powered by Industry-Standard 3D &amp; AI Frameworks
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                    <span className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 text-xs sm:text-sm font-medium">
                        ⚡ Tripo 3D API
                    </span>
                    <span className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 text-xs sm:text-sm font-medium">
                        🚀 FastAPI Backend
                    </span>
                    <span className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 text-xs sm:text-sm font-medium">
                        🧊 Three.js &amp; R3F
                    </span>
                    <span className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 text-xs sm:text-sm font-medium">
                        🔧 Blender Python API
                    </span>
                    <span className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 text-xs sm:text-sm font-medium">
                        📐 PyMeshLab &amp; trimesh
                    </span>
                </div>
            </section>
        </div>
    );
}