"use client";

import { Sparkles, Loader2 } from "lucide-react";

export default function GenerateButton({ disabled, loading, onClick }) {
    return (
        <button
            type="button"
            disabled={disabled || loading}
            onClick={onClick}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all shadow-lg ${disabled || loading
                    ? "bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99]"
                }`}
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Synthesizing 3D Asset...</span>
                </>
            ) : (
                <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate 3D Model</span>
                    <span className="hidden sm:inline-block ml-2 text-xs font-mono opacity-60 border border-white/20 rounded px-1.5 py-0.5">
                        Ctrl + Enter
                    </span>
                </>
            )}
        </button>
    );
}