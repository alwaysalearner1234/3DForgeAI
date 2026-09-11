"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Html, Grid } from "@react-three/drei";
import { RotateCcw, Box, Eye, Loader2, Maximize2, Minimize2 } from "lucide-react";

function Model({ url, wireframe }) {
    const { scene } = useGLTF(url);

    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = wireframe;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene, wireframe]);

    return (
        <Center top>
            <primitive object={scene} />
        </Center>
    );
}

function CanvasFallback() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-3 bg-slate-900/95 border border-slate-800 px-6 py-4 rounded-2xl backdrop-blur-md shadow-2xl">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs font-semibold text-slate-200 tracking-wider uppercase">
                    Streaming GLB Geometry...
                </span>
            </div>
        </Html>
    );
}

export default function ModelViewer({ modelUrl }) {
    const containerRef = useRef(null);
    const controlsRef = useRef(null);
    const [wireframe, setWireframe] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => console.error(err));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch((err) => console.error(err));
            setIsFullscreen(false);
        }
    };

    const handleResetView = () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full bg-slate-950 rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl flex flex-col transition-all ${isFullscreen ? "h-screen rounded-none border-none" : "h-full min-h-[420px] lg:min-h-[580px]"
                }`}
        >
            <div className="flex-1 w-full h-full relative">
                <Canvas
                    shadows
                    camera={{ position: [0, 1.8, 4.2], fov: 45 }}
                    className="w-full h-full"
                >
                    <color attach="background" args={["#020617"]} />

                    {/* Studio Lights */}
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[6, 12, 8]} intensity={1.8} castShadow />
                    <directionalLight position={[-8, 6, -6]} intensity={0.6} color="#8b5cf6" />
                    <pointLight position={[0, -2, 4]} intensity={0.4} color="#06b6d4" />

                    {/* 3D Studio Floor Grid */}
                    <Grid
                        position={[0, -0.01, 0]}
                        args={[12, 12]}
                        cellSize={0.4}
                        cellThickness={0.7}
                        cellColor="#1e293b"
                        sectionSize={1.6}
                        sectionThickness={1.2}
                        sectionColor="#334155"
                        fadeDistance={8}
                        fadeStrength={1.5}
                    />

                    <Suspense fallback={<CanvasFallback />}>
                        <Model url={modelUrl} wireframe={wireframe} />
                    </Suspense>

                    <OrbitControls
                        ref={controlsRef}
                        autoRotate={autoRotate}
                        autoRotateSpeed={1.2}
                        enablePan={true}
                        enableZoom={true}
                        enableDamping={true}
                        dampingFactor={0.05}
                        minDistance={1}
                        maxDistance={15}
                    />
                </Canvas>
            </div>

            {/* Action Toolbar */}
            <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setWireframe(!wireframe)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all border ${wireframe
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-lg shadow-cyan-500/20"
                            : "bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                        }`}
                >
                    <Box className="w-3.5 h-3.5" />
                    <span>{wireframe ? "Solid" : "Wireframe"}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all border ${autoRotate
                            ? "bg-violet-500/20 text-violet-300 border-violet-400"
                            : "bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                        }`}
                >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Rotate</span>
                </button>

                <button
                    type="button"
                    onClick={handleResetView}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 backdrop-blur-md transition-all"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                </button>

                <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 backdrop-blur-md transition-all"
                >
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Bottom Hint */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2.5 text-[11px] text-slate-400 bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl backdrop-blur-md font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>R3F WebGL Canvas • Damped Camera</span>
            </div>
        </div>
    );
}