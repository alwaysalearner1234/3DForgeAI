"use client";

import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from "lucide-react";

export default function FileUpload({ file, onFileSelect, onFileRemove }) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const validateAndSelect = (selectedFile) => {
        setError("");
        if (!selectedFile) return;

        if (!allowedTypes.includes(selectedFile.type)) {
            setError("Only .jpg, .png, and .webp files are supported.");
            return;
        }

        if (selectedFile.size > 15 * 1024 * 1024) {
            setError("File size must be under 15MB.");
            return;
        }

        onFileSelect(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSelect(e.dataTransfer.files[0]);
        }
    };

    const handleInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSelect(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleInputChange}
                className="hidden"
            />

            {file ? (
                <div className="relative rounded-2xl border border-slate-700 bg-slate-900/90 p-4 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={URL.createObjectURL(file)}
                            alt="Upload preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px]">
                            Ready for synthesis
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            onFileRemove();
                            if (inputRef.current) inputRef.current.value = "";
                        }}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${isDragging
                            ? "border-cyan-400 bg-cyan-950/20 scale-[0.99]"
                            : "border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/50"
                        }`}
                >
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                        <UploadCloud className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                        Drag &amp; drop reference image here, or{" "}
                        <span className="text-cyan-400 underline underline-offset-4">browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                        Supports JPG, PNG, and WebP (up to 15MB)
                    </p>
                </div>
            )}

            {error && (
                <div className="mt-3 flex items-center gap-2 text-rose-400 text-xs bg-rose-950/30 border border-rose-900/50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}