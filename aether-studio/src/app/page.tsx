"use client";

import React, { useState, useEffect, useRef } from "react";
import RemoteViewport from "@/components/RemoteViewport";
import OnboardingFlow from "@/components/OnboardingFlow";
import { 
  ParameterGroup, 
  NumericField, 
  ProToggle, 
  HierarchyNode, 
  ProTabGroup 
} from "@/components/TechnicalUI";
import { 
  ChevronDown,
  Box, 
  FolderOpen,
  Camera,
  Layers,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  Settings,
  MoreVertical,
  Cpu,
  Database,
  Search,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const API_BASE = "http://localhost:8001";

export default function Home() {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>("rdnc-field");
  const [activeTab, setActiveTab] = useState("Train");
  const [currentTime, setCurrentTime] = useState("0:04 / 0:35");
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  
  // Workstation Parameters (Functional States)
  const [params, setParams] = useState({
    maxSplat: "3000",
    shDegree: "3",
    downsample: "3840",
    antiAliasing: true,
    skyModel: false,
    roi: false,
    stopTraining: 30,
    storeContext: true
  });

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.session_id) {
        setActiveSession(data.session_id);
        const updated = await fetch(`${API_BASE}/sessions`);
        const sessionData = await updated.json();
        setSessions(sessionData.sessions || []);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${API_BASE}/sessions`);
        const data = await res.json();
        const active = data.sessions?.[0] || null;
        setSessions(data.sessions || []);
        if (active) setActiveSession(active);
      } catch (err) {}
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    const pollStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/status/${activeSession}`);
        const data = await res.json();
        setLogs(data.log || []);
        setIsProcessing(data.status === "processing" || data.status === "training");
      } catch (err) {}
    };
    const interval = setInterval(pollStatus, 3000);
    pollStatus();
    return () => clearInterval(interval);
  }, [activeSession]);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground font-sans overflow-hidden select-none p-1.5 gap-1.5">
      <OnboardingFlow />

      {/* 1. TOP UTILITY BAR (Glassmorphic) */}
      <header className="h-[46px] glass-panel rounded-xl flex items-center justify-between px-4 shrink-0 z-50 transition-all hover:border-accent/20">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-3 pr-4 border-r border-border mr-2">
             <div className="w-7 h-7 bg-accent/10 rounded-xl flex items-center justify-center glow-accent transition-transform hover:scale-105 active:scale-95">
                <Box size={16} className="text-accent" />
             </div>
             <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Aether-Scan <span className="text-accent">Studio</span></span>
          </div>
          <UtilityButton 
            icon={<FolderOpen size={14}/>} 
            label={uploading ? "Uploading..." : "Import"} 
            onClick={handleImportClick} 
            disabled={uploading}
          />
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".zip,.mp4" 
            onChange={handleFileChange} 
          />
          <UtilityButton icon={<Play size={14}/>} label="Training..." active />
          <UtilityButton icon={<Camera size={14}/>} label="Viewports" />
          <UtilityButton icon={<Layers size={14}/>} label="Render" />
        </div>
        
        <div className="flex items-center gap-6 text-[10px] font-mono">
           <div className="flex items-center gap-2.5 px-4 py-1.5 bg-white/5 rounded-2xl border border-white/5 transition-colors hover:bg-white/10 hover:border-accent/20">
              <Cpu size={14} className="text-accent/60 animate-pulse" />
              <span className="text-foreground/40 uppercase tracking-tighter">GPU: <span className="text-foreground font-bold">42%</span></span>
           </div>
           <div className="flex items-center gap-2.5 px-4 py-1.5 bg-white/5 rounded-2xl border border-white/5 text-accent/80 transition-colors hover:bg-white/10 hover:border-accent/20">
              <Database size={14} />
              <span className="text-foreground/40 uppercase tracking-tighter">VRAM: <span className="text-foreground font-bold">8.2 GB</span></span>
           </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (4-Pane) */}
      <div className="flex flex-1 gap-1.5 overflow-hidden">
        
        {/* VIEWPORT CANVAS (Center) */}
        <main className="flex-1 relative bg-black flex flex-col min-w-0">
           {/* VIEWPORT HUD */}
           <div className="absolute top-4 left-4 z-40 flex gap-4 pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/5 backdrop-blur-xl rounded-2xl shadow-2xl">
                 <Camera size={14} className="text-accent" />
                 <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-foreground/80">POV: Default Camera</span>
                 <div className="mx-1 w-px h-3 bg-white/10" />
                 <ChevronDown size={12} className="text-foreground/40" />
              </div>
           </div>

           {/* THE CORE 3D VIEWPORT */}
           <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] border border-white/5">
              <RemoteViewport socketUrl="ws://localhost:6009" active={true} />
              
              {/* CROSSHAIR OVERLAY */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                 <div className="w-12 h-px bg-white" />
                 <div className="h-12 w-px bg-white absolute" />
              </div>
           </div>

           {/* VIEWPORT CONTROLS (Left Floating) */}
           <div className="absolute top-1/2 -translate-y-1/2 left-4 z-40 flex flex-col gap-2 p-1.5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl transition-all hover:bg-black/30">
              <SideTool icon={<Box size={16} />} />
              <SideTool icon={<Camera size={16} />} />
              <SideTool icon={<Search size={16} />} />
              <div className="h-px w-6 bg-white/5 mx-auto my-1" />
              <SideTool icon={<Plus size={16} />} />
           </div>
        </main>

        {/* PRO SIDEBAR (Right) */}
        <aside className="w-[320px] flex flex-col gap-1.5 shrink-0 overflow-hidden">
           
           {/* SCENE HIERARCHY (Top) */}
           <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
              <div className="pro-header flex justify-between rounded-t-2xl">
                 <div className="flex items-center gap-2">
                   <Layers size={14} className="text-accent" />
                   <span>Hierarchy</span>
                 </div>
                 <div className="flex gap-3 text-foreground/40">
                    <Search size={12} className="hover:text-accent transition-colors cursor-pointer" />
                    <Settings size={12} className="hover:text-accent transition-colors cursor-pointer" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/5 py-2 space-y-0.5">
                 <HierarchyNode label="Root Scene" icon={Box} depth={0} onClick={() => setSelectedNode("scene")} active={selectedNode === "scene"} />
                 <HierarchyNode label="Default Camera" icon={Camera} depth={1} onClick={() => setSelectedNode("camera")} active={selectedNode === "camera"} />
                 <HierarchyNode label="Image Stream" icon={FolderOpen} depth={1} onClick={() => setSelectedNode("images")} active={selectedNode === "images"} />
                 <HierarchyNode label="Neural Field" icon={Layers} depth={1} onClick={() => setSelectedNode("rdnc-field")} active={selectedNode === "rdnc-field"} />
              </div>
           </div>

           {/* PARAMETERS (Bottom) */}
           <div className="h-[380px] glass-panel rounded-2xl flex flex-col overflow-hidden">
              <div className="pro-header rounded-t-2xl">Visual Workspace</div>
              <ProTabGroup 
                 tabs={["Build", "Console", "Tools", "Graph"]} 
                 activeTab={activeTab === "Train" || activeTab === "Build" ? "Build" : activeTab} 
                 onTabClick={setActiveTab} 
              />
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5 bg-black/5">
                 {activeTab === "Console" ? (
                    <div className="flex flex-col gap-1 font-mono text-[9px] text-foreground/40 leading-tight h-full">
                       {logs.length > 0 ? (
                          logs.map((log, i) => (
                             <div key={i} className="flex gap-2">
                                <span className="text-accent/40 shrink-0">[{i}]</span>
                                <span className={cn(
                                   log.includes("ERROR") ? "text-red-400" : 
                                   log.includes("COMPLETE") ? "text-green-400" : 
                                   "text-foreground/60"
                                )}>{log}</span>
                             </div>
                          ))
                       ) : (
                          <div className="flex flex-col items-center justify-center h-full opacity-20 italic">
                             Waiting for telemetry data...
                          </div>
                       )}
                       <div ref={logEndRef} />
                    </div>
                 ) : selectedNode === "rdnc-field" && (
                    <div className="flex flex-col gap-4">
                       <ParameterGroup title="Workstation Profile">
                          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                             <span className="text-[10px] text-foreground/40 font-mono uppercase">Profile</span>
                             <div className="pro-input flex justify-between items-center cursor-pointer">
                                <span>Splat3</span>
                                <ChevronDown size={10} />
                             </div>
                          </div>
                          <NumericField label="Downsample" value={params.downsample} />
                          <NumericField label="Max Splats" value={params.maxSplat} />
                          <ProToggle label="Anti-Aliasing" active={params.antiAliasing} onToggle={() => setParams({...params, antiAliasing: !params.antiAliasing})} />
                       </ParameterGroup>

                       <ParameterGroup title="Configuration">
                          <NumericField label="SH Degree" value={params.shDegree} />
                          <ProToggle label="Sky Model" active={params.skyModel} onToggle={() => setParams({...params, skyModel: !params.skyModel})} />
                          <ProToggle label="Region of Interest" active={params.roi} onToggle={() => setParams({...params, roi: !params.roi})} />
                       </ParameterGroup>

                       <ParameterGroup title="Execution Hooks">
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] text-foreground/40 font-mono uppercase w-[100px]">Stop After</span>
                             <div className="flex items-center gap-2 flex-1">
                                <ProToggle label="" active={true} />
                                <input type="text" value={params.stopTraining} className="pro-input w-12 text-center" />
                                <span className="text-[9px] text-foreground/20 font-mono uppercase">kSteps</span>
                             </div>
                          </div>
                          <ProToggle label="Store Context" active={params.storeContext} />
                          <button className="w-full mt-4 py-1.5 border border-border bg-panel-bright text-foreground/50 hover:text-foreground text-[10px] font-mono uppercase tracking-tighter">
                             Reset Radiance Field
                          </button>
                       </ParameterGroup>
                    </div>
                 )}
                 {selectedNode !== "rdnc-field" && (
                    <div className="p-8 text-center opacity-20 italic text-[10px] uppercase font-mono tracking-widest leading-relaxed">
                       Dynamic parameters for <br/> [{selectedNode.toUpperCase()}] <br/> not loaded in beta.
                    </div>
                 )}
              </div>
           </div>
        </aside>
      </div>

      {/* 3. VIDEO TIMELINE (Glassmorphic Scrubber) */}
      <footer className="h-[64px] glass-panel rounded-2xl flex items-center px-6 gap-6 shrink-0 z-50 overflow-hidden shadow-2xl">
         <div className="flex items-center gap-2">
            <TimelineAction icon={<SkipBack size={14}/>} />
            <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all cursor-pointer shadow-lg group">
               <Play size={16} fill="currentColor" className="ml-1 group-active:scale-90" />
            </div>
            <TimelineAction icon={<SkipForward size={14}/>} />
         </div>

         <div className="flex-1 relative flex flex-col justify-center gap-2">
            {/* Scrubber Base */}
            <div className="w-full h-1.5 bg-white/5 rounded-full relative cursor-pointer group">
               <div className="absolute top-0 bottom-0 left-0 w-[35%] bg-gradient-to-r from-accent to-accent-vibrant rounded-full glow-accent" />
               <motion.div 
                 whileHover={{ scale: 1.2 }}
                 className="absolute top-1/2 -translate-y-1/2 left-[35%] w-4 h-4 bg-white rounded-full shadow-2xl border-2 border-accent z-10" 
               />
            </div>
            {/* Timeline Indices */}
            <div className="flex justify-between px-1 opacity-20">
               {[...Array(30)].map((_, i) => (
                  <div key={i} className={cn("h-1 w-px", i % 5 === 0 ? "h-2 bg-white" : "bg-white")} />
               ))}
            </div>
         </div>

         <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
               <span className="text-[12px] font-bold text-foreground tracking-widest">{currentTime}</span>
               <span className="text-[8px] text-foreground/20 font-mono uppercase tracking-[0.2em]">Live Stream</span>
            </div>
            <div className="flex gap-4 items-center border-l border-white/5 pl-8">
               <TimelineAction icon={<Volume2 size={18}/>} />
               <TimelineAction icon={<Maximize2 size={18}/>} />
               <TimelineAction icon={<MoreVertical size={18}/>} />
            </div>
         </div>
         
         {/* Live Progress HUD (Floating) */}
         <AnimatePresence>
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-12 right-6 p-2.5 glass-panel rounded-xl text-[10px] font-mono flex items-center gap-4 border-accent/20 shadow-2xl"
              >
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-foreground/60 uppercase tracking-tighter">Radiance_Training</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="font-bold text-accent">84%</span>
                    <div className="w-32 bg-white/10 h-1.5 rounded-full relative overflow-hidden">
                       <motion.div 
                         initial={{ x: "-100%" }}
                         animate={{ x: "0%" }}
                         className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-accent to-accent-vibrant" 
                       />
                    </div>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </footer>
    </div>
  );
}

/* Helper Components for Premium Studio GUI */
function UtilityButton({ icon, label, active, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 transition-all text-[11px] font-semibold tracking-wide rounded-lg group",
        active 
          ? "bg-accent/20 text-accent border border-accent/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]" 
          : "text-foreground/40 hover:bg-white/5 hover:text-foreground/80",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        {icon}
      </motion.div>
      <span className="font-sans uppercase text-[9px] tracking-widest">{label}</span>
    </button>
  );
}

function SideTool({ icon }: any) {
  return (
    <button className="p-3 text-foreground/40 hover:text-accent hover:bg-accent/10 transition-all rounded-full group">
       <div className="transition-transform group-hover:scale-110 group-active:scale-90">
         {icon}
       </div>
    </button>
  );
}

function TimelineAction({ icon, active }: any) {
  return (
    <button className={cn(
       "p-2 hover:bg-white/5 transition-all rounded-lg",
       active ? "text-accent bg-accent/10" : "text-foreground/40 hover:text-foreground/80"
    )}>
       {icon}
    </button>
  );
}
