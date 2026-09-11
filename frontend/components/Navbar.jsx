"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Sparkles, Cpu, Layers } from "lucide-react";
import { USE_MOCK } from "../lib/api";

export default function Navbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-500 p-[1px]">
                        <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                            <Box className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                    <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                        3DForge AI
                    </span>
                </Link>

                {/* Mode & Navigation */}
                <nav className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-xs">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-slate-400">
                            {USE_MOCK ? "Simulation Mode" : "FastAPI Connected"}
                        </span>
                    </div>

                    <Link
                        href="/"
                        className={`text-sm font-medium transition-colors hover:text-cyan-400 ${pathname === "/" ? "text-cyan-400" : "text-slate-400"
                            }`}
                    >
                        Overview
                    </Link>

                    <Link
                        href="/generate"
                        className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Start Creating</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}