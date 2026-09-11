import Link from "next/link";
import { Box, Sparkles, Terminal, Cpu } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Box className="w-5 h-5 text-cyan-400" />
                            <span className="font-bold text-base text-slate-200">3DForge AI</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                            From a simple idea to a production-ready 3D asset — automatically.
                            Powered by Tripo 3D, FastAPI, Three.js, and Blender Python processing.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3">
                            Production Pipeline
                        </h4>
                        <ul className="space-y-1.5 text-xs">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                AI 3D Generation (Tripo API)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                                Mesh Cleanup (PyMeshLab / trimesh)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                UV Processing & Blender Automation
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                                Interactive Three.js GLB Inspection
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3">
                            Team Deliverables
                        </h4>
                        <div className="space-y-2 text-xs">
                            <div className="p-2 rounded bg-slate-900 border border-slate-800">
                                <span className="text-slate-300 font-medium">Lidiya:</span> AI Generation & FastAPI Backend
                            </div>
                            <div className="p-2 rounded bg-slate-900 border border-slate-800">
                                <span className="text-slate-300 font-medium">Atharv:</span> 3D Geometry Processing Pipeline
                            </div>
                            <div className="p-2 rounded bg-slate-900 border border-slate-800">
                                <span className="text-slate-300 font-medium">Manoj:</span> User Interface & Three.js Viewer
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© 2026 3DForge AI. Built for the Production-Ready 3D Hackathon.</p>
                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-[11px]">
                            FastAPI: 8000
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-violet-400 font-mono text-[11px]">
                            Next.js: 3000
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}