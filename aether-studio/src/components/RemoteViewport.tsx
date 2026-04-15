"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Loader2, Zap, AlertTriangle, Radio, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RemoteViewportProps {
  socketUrl: string;
  active: boolean;
}

export default function RemoteViewport({ socketUrl, active }: RemoteViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.up.set(0, -1, 0); // Native splat up vector
    camera.position.set(0, 0, 2);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    const loader = new THREE.TextureLoader();

    function connect() {
      if (wsRef.current) wsRef.current.close();
      setStatus("connecting");
      
      try {
        const ws = new WebSocket(socketUrl);
        ws.binaryType = "blob";
        wsRef.current = ws;

        ws.onopen = () => {
          setStatus("connected");
          console.log("Remote Viewport: Connected to Splat Engine");
        };

        ws.onmessage = async (event) => {
          if (event.data instanceof Blob) {
            const url = URL.createObjectURL(event.data);
            loader.load(url, (texture) => {
              texture.colorSpace = THREE.SRGBColorSpace;
              scene.background = texture;
              URL.revokeObjectURL(url);
            });
          }
          
          if (ws.readyState === WebSocket.OPEN) {
            const data = {
              res_x: canvas.clientWidth,
              res_y: canvas.clientHeight,
              state: "start",
              pose: camera.matrixWorld.elements,
              snapToLast: false
            };
            ws.send(JSON.stringify(data));
          }
        };

        ws.onclose = () => {
          setStatus("disconnected");
          setTimeout(() => {
            if (active) connect();
          }, 3000); // Faster reconnect
        };

        ws.onerror = () => {
          setStatus("disconnected");
        };
      } catch (e) {
        setStatus("disconnected");
      }
    }

    connect();

    let animationId: number;
    function animate() {
      if (canvas.clientWidth !== canvas.width || canvas.clientHeight !== canvas.height) {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      if (status !== 'connected') {
        scene.background = new THREE.Color(0x050505);
      }

      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if(wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      renderer.dispose();
      scene.clear();
    };
  }, [socketUrl, active]); 

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* SCANLINE EFFECT OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      <canvas ref={canvasRef} className={cn("w-full h-full transition-opacity duration-700", status === 'connected' ? "opacity-100" : "opacity-0")} />
      
      {status !== "connected" && (
        <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center overflow-hidden z-20">
          {/* Neural Calibration Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          
          <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 flex flex-col items-center gap-6"
          >
              <div className="relative">
                  <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="w-24 h-24 border border-blue-500/20 rounded-full border-t-blue-500 flex items-center justify-center"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu className="text-blue-500/50" size={32} />
                  </div>
              </div>

              <div className="flex flex-col items-center gap-1 text-center">
                  <h2 className="text-sm font-mono tracking-[0.3em] text-blue-400 uppercase font-bold">ENGINE_STANDBY</h2>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Awaiting Data Ingest or Session Activation</p>
              </div>

              <div className="flex gap-4 border border-white/5 bg-white/5 p-4 rounded-lg backdrop-blur-md">
                  <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase">Calibration</span>
                      <span className="text-[11px] text-blue-400 font-mono">READY</span>
                  </div>
                  <div className="w-[1px] bg-white/10" />
                  <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase">VRAM Status</span>
                      <span className="text-[11px] text-zinc-300 font-mono">OPTIMIZED</span>
                  </div>
                  <div className="w-[1px] bg-white/10" />
                  <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase">Port</span>
                      <span className="text-[11px] text-zinc-300 font-mono">6009/TCP</span>
                  </div>
              </div>
          </motion.div>
        </div>
      )}

      {/* Mini Viewport Legend */}
      <div className="absolute bottom-6 left-6 flex gap-4 pointer-events-none z-30">
         <div className="flex items-center gap-3 px-3 py-1.5 bg-black/60 border border-white/5 rounded-md backdrop-blur-md">
            <Zap size={12} className={cn("transition-colors duration-500", status === 'connected' ? "text-yellow-400 fill-yellow-400" : "text-foreground/20")} />
            <div className="flex flex-col">
               <span className="text-[9px] font-bold uppercase text-foreground/80 leading-none mb-1">Engine Control</span>
               <span className="text-[7px] font-mono uppercase text-foreground/40 leading-none">Status: {status}</span>
            </div>
         </div>
      </div>
    </div>
  );
}
