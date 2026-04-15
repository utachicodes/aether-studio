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
  Plus,
  Terminal,
  Activity,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const API_BASE = "http://localhost:8001";

export default function Home() {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>("neural-field");
  const [activeTab, setActiveTab] = useState("Build");
  const [uploading, setUploading] = useState(false);

  // --- Core Workstation State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(35); // 0-100%
  const [searchQuery, setSearchQuery] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  // Timeline Progress Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1; // Smooth progression
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const displayTime = React.useMemo(() => {
    const totalSeconds = 35;
    const currentSeconds = Math.floor((timelineProgress / 100) * totalSeconds);
    return `0:${currentSeconds.toString().padStart(2, "0")} / 0:${totalSeconds}`;
  }, [timelineProgress]);

  const handleMaximize = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  };
  
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
    const files = e.target.files;
    if (!files || files.length === 0) return;
 
    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

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
      if (e.target) e.target.value = ""; 
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

  // Hierarchical Data Filtering
  const explorerNodes = [
    { id: "project", label: "Studio Project", icon: Box, depth: 0 },
    { id: "points", label: "Point Clouds", icon: Plus, depth: 1 },
    { id: "images", label: "Source Stream", icon: FolderOpen, depth: 1 },
    { id: "neural-field", label: "Neural Field", icon: Layers, depth: 1 },
    { id: "optics", label: "V-Optics", icon: Camera, depth: 1 },
  ];

  const filteredNodes = explorerNodes.filter(n => 
    n.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground font-sans overflow-hidden select-none p-1.5 gap-1.5">
      <OnboardingFlow />

      {/* 1. TOP UTILITY BAR (Glassmorphic) */}
      <header className="h-[46px] glass-panel rounded-xl flex items-center justify-between px-4 shrink-0 z-[100] transition-all hover:border-accent/20">
        <div className="flex items-center gap-1 h-full">
          <div className="flex items-center gap-3 pr-4 border-r border-border mr-2 h-1/2">
             <div className="w-7 h-7 bg-accent/10 rounded-xl flex items-center justify-center glow-accent">
                <Box size={16} className="text-accent" />
             </div>
             <span className="text-[11px] font-black uppercase tracking-widest text-foreground">AETHER-SCAN <span className="text-accent">STUDIO</span></span>
          </div>
          <UtilityButton 
            icon={<FolderOpen size={14}/>} 
            label={uploading ? "INGESTING..." : "IMPORT"} 
            onClick={handleImportClick} 
            disabled={uploading}
          />
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".zip,.mp4,.mov,.avi,.mkv,.png,.jpg,.jpeg,.webp" 
            multiple
            onChange={handleFileChange} 
          />
          <UtilityButton 
            icon={<Play size={14}/>} 
            label={isProcessing ? "OPERATIONAL" : "INIT ENGINE"} 
            active={isProcessing} 
            onClick={() => setIsProcessing(!isProcessing)}
          />
          <UtilityButton 
            icon={<Layers size={14}/>} 
            label="NEURAL FLOW" 
            active={selectedNode === "neural-field"}
            onClick={() => setSelectedNode("neural-field")}
          />
          <UtilityButton 
            icon={<Database size={14}/>} 
            label="DATA POOL" 
            active={selectedNode === "images"}
            onClick={() => setSelectedNode("images")}
          />
        </div>
        
        <div className="flex items-center gap-6 text-[10px] font-mono">
           <div className="flex items-center gap-2.5 px-4 py-1.5 bg-white/5 rounded-2xl border border-white/5 transition-colors hover:bg-white/10 hover:border-accent/20 cursor-help">
              <Cpu size={14} className="text-accent/60 animate-pulse" />
              <span className="text-foreground/40 uppercase tracking-tighter">GPU_UTIL: <span className="text-foreground font-bold">42.8%</span></span>
           </div>
           <div className="flex items-center gap-2.5 px-4 py-1.5 bg-white/5 rounded-2xl border border-white/5 text-accent/80 transition-colors hover:bg-white/10 hover:border-accent/20">
              <Zap size={14} />
              <span className="text-foreground/40 uppercase tracking-tighter">LATENCY: <span className="text-foreground font-bold">14ms</span></span>
           </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex flex-1 gap-1.5 overflow-hidden">
        
        {/* VIEWPORT CANVAS (Center) */}
        <main className="flex-1 relative bg-black flex flex-col min-w-0">
           {/* VIEWPORT HUD */}
           <div className="absolute top-6 left-6 z-40 flex flex-col gap-2 pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-black/40 border border-white/5 backdrop-blur-xl rounded-2xl shadow-2xl">
                 <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]", isProcessing ? "bg-accent animate-pulse" : "bg-red-500")} />
                 <span className="text-[11px] uppercase font-black tracking-[0.3em] text-foreground/90">
                    {isProcessing ? "ENGINE_LINK: STABLE" : "ENGINE_LINK: DISCONNECTED"}
                 </span>
              </div>
              <div className="px-4 py-1.5 bg-black/20 text-[9px] font-mono text-foreground/40 uppercase tracking-widest border-l-2 border-accent/20 ml-2">
                 Workspace: 0x{activeSession?.substring(0, 8).toUpperCase() || "NULL"}
              </div>
           </div>

           {/* THE CORE NEURAL VIEWPORT */}
           <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              <RemoteViewport socketUrl="ws://localhost:6009" active={true} />
              
              {/* CROSSHAIR */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
                 <div className="w-16 h-px bg-white" />
                 <div className="h-16 w-px bg-white absolute" />
                 <div className="w-2 h-2 border border-white rounded-full absolute" />
              </div>

              {/* VIEWPORT CONTROLS */}
              <div className="absolute top-1/2 -translate-y-1/2 left-6 z-40 flex flex-col gap-2 p-1.5 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                 <SideTool icon={<Box size={18} />} onClick={() => setSelectedNode("project")} active={selectedNode === "project"} tooltip="Scene Tree" />
                 <SideTool icon={<Layers size={18} />} onClick={() => setSelectedNode("neural-field")} active={selectedNode === "neural-field"} tooltip="Neural Layers" />
                 <SideTool icon={<Camera size={18} />} onClick={() => setSelectedNode("optics")} active={selectedNode === "optics"} tooltip="Camera Matrix" />
                 <div className="h-px w-8 bg-white/10 mx-auto my-1.5" />
                 <SideTool icon={<Search size={18} />} onClick={() => document.getElementById('search-input')?.focus()} tooltip="Find Node" />
                 <SideTool icon={<Plus size={18} />} onClick={handleImportClick} tooltip="Quick Ingest" />
              </div>
           </div>
        </main>

        {/* PRO SIDEBAR */}
        <aside className="w-[340px] flex flex-col gap-1.5 shrink-0 overflow-hidden">
           
           {/* SESSION EXPLORER */}
           <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
              <div className="pro-header flex justify-between rounded-t-2xl px-5">
                 <div className="flex items-center gap-2.5">
                   <Database size={15} className="text-accent" />
                   <span className="text-[11px] font-bold uppercase tracking-widest">Session Explorer</span>
                 </div>
                 <div className="flex gap-3 text-foreground/40 items-center">
                    <input 
                      id="search-input"
                      type="text"
                      placeholder="Find..."
                      className="bg-transparent border-none outline-none text-[9px] w-0 focus:w-24 transition-all duration-300 text-foreground font-mono placeholder:text-foreground/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search size={13} className="hover:text-accent transition-colors cursor-pointer" onClick={() => (document.getElementById('search-input') as any)?.focus()} />
                    <Settings size={13} className="hover:text-accent transition-colors cursor-pointer" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10 py-3 px-1 space-y-0.5">
                 {filteredNodes.length > 0 ? (
                    filteredNodes.map(node => (
                      <HierarchyNode 
                        key={node.id}
                        label={node.label} 
                        icon={node.icon} 
                        depth={node.depth} 
                        onClick={() => setSelectedNode(node.id)} 
                        active={selectedNode === node.id} 
                      />
                    ))
                 ) : (
                    <div className="p-8 text-center text-[10px] uppercase font-mono text-foreground/20 tracking-widest">
                       No results for "{searchQuery}"
                    </div>
                 )}
              </div>
           </div>

           {/* PARAMETERS & TOOLS */}
           <div className="h-[420px] glass-panel rounded-2xl flex flex-col overflow-hidden">
              <div className="pro-header rounded-t-2xl px-5 flex items-center gap-2">
                 <Activity size={14} className="text-accent/60" />
                 <span className="text-[11px] font-bold uppercase tracking-widest">Visual Workspace</span>
              </div>
              <ProTabGroup 
                 tabs={["Parameters", "Console", "Tools", "Graph"]} 
                 activeTab={activeTab === "Build" ? "Parameters" : activeTab} 
                 onTabClick={setActiveTab} 
              />
              <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 bg-black/10">
                 <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-3"
                    >
                      {activeTab === "Console" && (
                         <div className="flex flex-col gap-1.5 font-mono text-[9px] leading-tight">
                            {logs.length > 0 ? (
                               logs.map((log, i) => (
                                  <div key={i} className="flex gap-2 group">
                                     <span className="text-accent/40 shrink-0 text-[8px] mt-0.5 tracking-tighter">[{i.toString().padStart(3, '0')}]</span>
                                     <span className={cn(
                                        "transition-colors",
                                        log.includes("ERROR") ? "text-red-400 font-bold" : 
                                        log.includes("COMPLETE") ? "text-accent font-bold" : 
                                        "text-foreground/50 group-hover:text-foreground/80"
                                     )}>{log}</span>
                                  </div>
                               ))
                            ) : (
                               <div className="flex flex-col items-center justify-center py-20 opacity-20 italic gap-3">
                                  <Terminal size={24} />
                                  <span>Bridging Backend Port 8001...</span>
                               </div>
                            )}
                            <div ref={logEndRef} />
                         </div>
                      )}

                      {activeTab === "Tools" && (
                         <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                               <div className="text-[9px] font-mono text-foreground/20 uppercase tracking-widest mb-1 px-1">Mesh Operations</div>
                               <ActionButton label="Recalculate Bounds" icon={<Box size={14}/>} />
                               <ActionButton label="Synchronize Poses" icon={<Radio size={14}/>} color="accent" />
                               <ActionButton label="Flush Cache" icon={<Zap size={14}/>} color="red" />
                            </div>
                         </div>
                      )}

                      {activeTab === "Graph" && (
                         <div className="flex flex-col gap-6 py-6 items-center">
                            <div className="w-full flex items-end gap-1.5 h-32 px-4">
                               {[45, 65, 40, 85, 30, 95, 75, 100, 60, 40].map((h, i) => (
                                  <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className="flex-1 bg-gradient-to-t from-accent/5 to-accent/40 border-t-2 border-accent" 
                                  />
                               ))}
                            </div>
                            <div className="flex flex-col items-center gap-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Convergence Vector</span>
                               <span className="text-[8px] font-mono opacity-30">ERR_RMS: 0.00427 | STEPS: 12.4k</span>
                            </div>
                         </div>
                      )}

                      {(activeTab === "Parameters" || activeTab === "Parameters") && (
                         <div className="flex flex-col gap-5">
                            <ParameterGroup title="Workstation Core">
                               <div className="grid grid-cols-[100px_1fr] items-center gap-2 mb-2">
                                  <span className="text-[10px] text-foreground/40 font-mono uppercase">Profile</span>
                                  <div className="pro-input flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors">
                                     <span>AETHER_v4_Splat</span>
                                     <ChevronDown size={12} />
                                  </div>
                               </div>
                               <NumericField label="Downsample" value={params.downsample} />
                               <NumericField label="Max Splats" value={params.maxSplat} />
                               <ProToggle label="Anti-Aliasing" active={params.antiAliasing} onToggle={() => setParams({...params, antiAliasing: !params.antiAliasing})} />
                            </ParameterGroup>

                            <ParameterGroup title="Advanced Optimization">
                               <NumericField label="SH Degree" value={params.shDegree} />
                               <ProToggle label="Global Sky Model" active={params.skyModel} onToggle={() => setParams({...params, skyModel: !params.skyModel})} />
                               <ProToggle label="Force ROI Mask" active={params.roi} onToggle={() => setParams({...params, roi: !params.roi})} />
                            </ParameterGroup>
                         </div>
                      )}
                    </motion.div>
                 </AnimatePresence>
              </div>
           </div>
        </aside>
      </div>

      {/* 3. MASTER TIMELINE */}
      <footer className="h-[68px] glass-panel rounded-2xl flex items-center px-8 gap-10 shrink-0 z-[100] overflow-hidden shadow-2xl transition-all hover:bg-black/40">
         <div className="flex items-center gap-4">
            <TimelineAction icon={<SkipBack size={18}/>} onClick={() => setTimelineProgress(0)} />
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-11 h-11 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all cursor-pointer shadow-lg shadow-accent/10"
            >
               {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </motion.div>
            <TimelineAction icon={<SkipForward size={18}/>} onClick={() => setTimelineProgress(100)} />
         </div>

         <div className="flex-1 flex flex-col justify-center gap-2.5">
            <div 
              className="w-full h-2 bg-white/5 rounded-full relative cursor-pointer group"
              onClick={(e) => {
                const rect = (e.currentTarget as any).getBoundingClientRect();
                const x = e.clientX - rect.left;
                setTimelineProgress((x / rect.width) * 100);
              }}
            >
               <div 
                 className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-accent to-accent-vibrant rounded-full glow-accent transition-all duration-75" 
                 style={{ width: `${timelineProgress}%` }}
               />
               <motion.div 
                 animate={{ left: `${timelineProgress}%` }}
                 className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] border-2 border-accent z-10 -ml-2" 
               />
            </div>
            <div className="flex justify-between px-1 opacity-20">
               {[...Array(50)].map((_, i) => (
                  <div key={i} className={cn("w-px bg-white", i % 5 === 0 ? "h-2.5" : "h-1.5")} />
               ))}
            </div>
         </div>

         <div className="flex items-center gap-10">
            <div className="flex flex-col items-end min-w-[100px]">
               <span className="text-[14px] font-black tracking-widest text-foreground">{displayTime}</span>
               <span className="text-[9px] text-accent font-mono uppercase tracking-[0.2em] font-bold">
                  {isPlaying ? "STREAMING_DATA" : "BUFFERED_STATIC"}
               </span>
            </div>
            <div className="flex gap-5 items-center border-l border-white/10 pl-10">
               <TimelineAction icon={isMuted ? <Volume2 size={22} className="text-red-400" /> : <Volume2 size={22}/>} onClick={() => setIsMuted(!isMuted)} />
               <TimelineAction icon={<Maximize2 size={22}/>} onClick={handleMaximize} />
               <TimelineAction icon={<MoreVertical size={22}/>} />
            </div>
         </div>
      </footer>
    </div>
  );
}

/* --- High-Fidelity Studio Components --- */

function UtilityButton({ icon, label, active, onClick, disabled }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 px-4 py-2 transition-all text-[11px] font-bold tracking-widest rounded-xl relative group",
        active 
          ? "text-accent bg-accent/10 border border-accent/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
          : "text-foreground/40 hover:bg-white/5 hover:text-foreground/80 border border-transparent",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      <div className="transition-transform group-hover:scale-110">
        {icon}
      </div>
      <span className="font-mono uppercase text-[9px]">{label}</span>
      {active && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />}
    </button>
  );
}

function SideTool({ icon, onClick, active, tooltip }: any) {
  return (
    <div className="group relative">
      <button 
        onClick={onClick}
        className={cn(
          "w-12 h-12 transition-all rounded-xl flex items-center justify-center border",
          active 
            ? "text-accent bg-accent/10 border-accent/40 shadow-[0_0_15px_rgba(59,130,246,0.2)] scale-105" 
            : "text-foreground/30 border-transparent hover:text-accent hover:bg-white/5"
        )}
      >
         <div className="transition-transform group-active:scale-90">
           {icon}
         </div>
      </button>
      <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-accent/90 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all opacity-0 pointer-events-none group-hover:opacity-100 group-hover:left-14 shadow-2xl whitespace-nowrap">
        {tooltip}
      </div>
    </div>
  );
}

function TimelineAction({ icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-10 h-10 flex items-center justify-center transition-all rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5",
        active ? "text-accent bg-accent/10" : "text-foreground/30 hover:text-foreground/90 whitespace-nowrap"
      )}
    >
       {icon}
    </button>
  );
}

function ActionButton({ label, icon, color = "default" }: any) {
  const colors: any = {
    default: "text-foreground/60 border-white/5 hover:bg-white/5",
    accent: "text-accent border-accent/20 bg-accent/5 hover:bg-accent/10",
    red: "text-red-400 border-red-900/20 bg-red-950/20 hover:bg-red-950/40"
  };

  return (
    <button className={cn(
      "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-[10px] font-mono uppercase tracking-tighter transition-all",
      colors[color]
    )}>
      <span>{label}</span>
      {icon}
    </button>
  );
}

function Radio({ className, size }: any) {
  return <Activity className={className} size={size} />;
}
