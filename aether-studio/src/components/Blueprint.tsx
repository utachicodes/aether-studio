"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Crosshair, ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "academic" | "residential" | "utility";
}

const DUMMY_HOTSPOTS: Hotspot[] = [
  { id: "dept-aero", x: 400, y: 150, label: "Mechanical & Aeronautical Engineering", type: "academic" },
  { id: "dept-elec", x: 650, y: 250, label: "Electronic & Computer Engineering", type: "academic" },
  { id: "dept-civil", x: 800, y: 400, label: "Civil & Environmental Engineering", type: "academic" },
  { id: "dept-chem", x: 300, y: 400, label: "Chemistry & Biomolecules", type: "academic" },
  { id: "student-center", x: 550, y: 550, label: "DAUST Student Center (Hub)", type: "utility" },
  { id: "dorm-boys", x: 200, y: 650, label: "Men's Residential Housing", type: "residential" },
  { id: "dorm-girls", x: 950, y: 650, label: "Women's Residential Housing", type: "residential" },
  { id: "dining-hall", x: 550, y: 720, label: "Campus Dining & International Cuisine", type: "utility" },
];


export default function Blueprint({ onSelectHotspot }: { onSelectHotspot: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const springX = useSpring(x, { damping: 20, stiffness: 100 });
  const springY = useSpring(y, { damping: 20, stiffness: 100 });
  const springScale = useSpring(scale, { damping: 20, stiffness: 100 });

  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const handleZoom = (delta: number) => {
    scale.set(Math.min(Math.max(scale.get() + delta, 0.5), 3));
  };

  const handleReset = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-background select-none group">
      {/* Blueprint Navigation HUD */}
      <div className="absolute top-10 right-10 z-20 flex flex-col gap-2">
        <button onClick={() => handleZoom(0.1)} className="p-3 bg-panel border border-border hover:border-accent text-foreground/20 hover:text-accent transition-all"><ZoomIn size={18}/></button>
        <button onClick={() => handleZoom(-0.1)} className="p-3 bg-panel border border-border hover:border-accent text-foreground/20 hover:text-accent transition-all"><ZoomOut size={18}/></button>
        <button onClick={handleReset} className="p-3 bg-panel border border-border hover:border-accent text-foreground/20 hover:text-accent transition-all"><Maximize size={18}/></button>
      </div>

      <div className="absolute top-10 left-10 z-20">
         <div className="flex items-center gap-3 px-4 py-2 bg-panel-bright/80 border border-white/5 backdrop-blur-xl">
            <div className="w-2 h-2 bg-accent/60 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/40">Campus Grid / Somone / Live</span>
         </div>
      </div>


      {/* The Diagram Container */}
      <motion.div 
        ref={containerRef}
        drag
        dragConstraints={{ left: -1500, right: 1500, top: -1500, bottom: 1500 }}
        style={{ x: springX, y: springY, scale: springScale }}
        className="cursor-grab active:cursor-grabbing flex items-center justify-center min-w-[3000px] min-h-[3000px]"
      >
        <div className="relative w-[1200px] h-[800px] bg-background border border-white/5 shadow-2xl">
          {/* Professional Technical Grid */}
          <div className="absolute inset-0 grid-bg opacity-5 pointer-events-none" />
          
          {/* SVG Diagram - Industrial Architecture */}
          <svg viewBox="0 0 1200 800" className="w-full h-full fill-none stroke-accent/10 stroke-[1px]">
            {/* Structural Blocks */}
            <rect x="350" y="100" width="200" height="150" fill="rgba(212, 175, 55, 0.02)" stroke="rgba(212, 175, 55, 0.1)" />
            <rect x="150" y="550" width="300" height="100" fill="rgba(212, 175, 55, 0.02)" stroke="rgba(212, 175, 55, 0.1)" />
            <rect x="550" y="400" width="250" height="200" fill="rgba(212, 175, 55, 0.02)" stroke="rgba(212, 175, 55, 0.1)" />
            <circle cx="200" cy="200" r="80" fill="rgba(212, 175, 55, 0.02)" stroke="rgba(212, 175, 55, 0.1)" />
            
            {/* Grid Coordinates (A-F, 1-8) */}
            <g className="text-[14px] font-mono fill-accent/10 stroke-none uppercase">
              <text x="10" y="30">A1</text>
              <text x="1150" y="30">F1</text>
              <text x="10" y="780">A8</text>
              <text x="1150" y="780">F8</text>
            </g>

            {/* Pathways */}
            <path d="M 450 250 L 450 700" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="2 4" />
            <path d="M 0 450 L 1200 450" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="2 4" />
          </svg>

          {/* Industrial Hotspots */}
          {DUMMY_HOTSPOTS.map((hotspot) => (
            <motion.div
              key={hotspot.id}
              style={{ left: hotspot.x, top: hotspot.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
            >
              <button 
                onMouseEnter={() => setActiveHotspot(hotspot.id)}
                onMouseLeave={() => setActiveHotspot(null)}
                onClick={() => onSelectHotspot(hotspot.id)}
                className="group relative flex items-center justify-center font-mono"
              >
                <div className="absolute inset-0 bg-accent/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-10" />
                <div className="relative z-10 w-8 h-8 border border-accent/20 bg-background flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-background transition-all duration-300">
                   <Crosshair size={14} />
                </div>
                
                {/* Side Label */}
                <AnimatePresence>
                  {activeHotspot === hotspot.id && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-[calc(100%+16px)] pointer-events-none"
                    >
                      <div className="bg-panel border border-accent/30 px-4 py-2 shadow-2xl">
                        <span className="text-[11px] font-mono whitespace-nowrap uppercase tracking-[0.2em] text-accent">{hotspot.label}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Viewport Corners Layer */}
      <div className="absolute inset-0 pointer-events-none border-[64px] border-background z-10" />
      <div className="absolute inset-0 pointer-events-none border border-white/5 z-0" />
    </div>

    </div>
  );
}
