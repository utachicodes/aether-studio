"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Loader2, Box, Zap } from "lucide-react";

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
      setStatus("connecting");
      const ws = new WebSocket(socketUrl);
      ws.binaryType = "blob";
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
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
        
        // Always send back the current pose to trigger the next frame
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
        setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.error("Remote Viewport Error:", err);
      };
    }

    connect();

    let animationId: number;
    function animate() {
      if (canvas.clientWidth !== canvas.width || canvas.clientHeight !== canvas.height) {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      wsRef.current?.close();
      renderer.dispose();
    };
  }, [socketUrl, active]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {status !== "connected" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 pointer-events-none">
          <Loader2 className="animate-spin text-accent mb-4" size={32} />
          <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
            Bridging Live 3D Stream...
          </span>
          <span className="text-[8px] font-mono text-foreground/40 mt-1">
            TARGET: {socketUrl}
          </span>
        </div>
      )}

      {/* Mini Viewport Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 pointer-events-none z-10">
         <div className="flex items-center gap-2 px-2 py-1 bg-black/40 border border-white/5">
            <Zap size={10} className={status === 'connected' ? "text-yellow-400" : "text-foreground/20"} />
            <span className="text-[8px] font-mono uppercase text-foreground/60">Splat_Engine: {status}</span>
         </div>
      </div>
    </div>
  );
}
