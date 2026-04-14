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

const API_BASE = "http://localhost:8001";

export default function Home() {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string>("rdnc-field");
  const [activeTab, setActiveTab] = useState("Train");
  const [currentTime, setCurrentTime] = useState("0:04 / 0:35");
  
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
    <div className="flex flex-col h-screen w-screen bg-background text-foreground font-sans overflow-hidden select-none">
      <OnboardingFlow />

      {/* 1. TOP UTILITY BAR (Postshot Style) */}
      <header className="h-[40px] border-b border-border bg-[#18181a] flex items-center justify-between px-2 shrink-0 z-50">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2 px-3 border-r border-border mr-2">
             <Box size={14} className="text-accent" />
             <span className="text-[10px] font-bold uppercase tracking-tight">Aether-Scan <span className="text-accent/60">BETA</span></span>
          </div>
          <UtilityButton icon={<FolderOpen size={12}/>} label="Import..." />
          <UtilityButton icon={<Play size={12}/>} label="Pause Training" active />
          <UtilityButton icon={<Camera size={12}/>} label="Create Camera" />
          <UtilityButton icon={<Layers size={12}/>} label="Render" />
        </div>
        
        <div className="flex items-center gap-4 text-[10px] font-mono text-foreground/40">
           <div className="flex items-center gap-1">
              <Cpu size={12} />
              <span>RTX 4090 [42%]</span>
           </div>
           <div className="flex items-center gap-1">
              <Database size={12} />
              <span>VRAM: 8.2/24 GB</span>
           </div>
           <div className="mx-2 w-px h-4 bg-border" />
           <span className="text-accent underline cursor-pointer">Postshot Pro</span>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (4-Pane) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* VIEWPORT CANVAS (Center) */}
        <main className="flex-1 relative bg-black flex flex-col min-w-0">
           {/* VIEWPORT HUD */}
           <div className="absolute top-4 left-4 z-20 flex gap-4 pointer-events-none">
              <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/5 backdrop-blur-md">
                 <Camera size={12} className="text-foreground/40" />
                 <span className="text-[10px] uppercase font-mono tracking-widest text-foreground/60">Default Camera</span>
                 <ChevronDown size={10} className="text-foreground/20" />
              </div>
           </div>

           {/* THE CORE 3D VIEWPORT */}
           <div className="w-full h-full relative">
              <RemoteViewport socketUrl="ws://localhost:6009" active={true} />
              
              {/* CROSSHAIR OVERLAY */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
                 <div className="w-8 h-px bg-white" />
                 <div className="h-8 w-px bg-white absolute" />
              </div>
           </div>

           {/* VIEWPORT CONTROLS (Left Floating) */}
           <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 flex flex-col gap-1">
              <SideTool icon={<Box size={14} />} />
              <SideTool icon={<Camera size={14} />} />
              <SideTool icon={<Search size={14} />} />
              <div className="h-px w-4 bg-border mx-auto my-1" />
              <SideTool icon={<Plus size={14} />} />
           </div>
        </main>

        {/* PRO SIDEBAR (Right) */}
        <aside className="w-[340px] flex flex-col border-l border-border bg-panel shrink-0">
           
           {/* SCENE HIERARCHY (Top) */}
           <div className="h-[280px] flex flex-col border-b border-border">
              <div className="pro-header flex justify-between">
                 <span>Scene</span>
                 <div className="flex gap-2 text-foreground/20">
                    <Search size={10} />
                    <Settings size={10} />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0d0d0f] py-1">
                 <HierarchyNode label="Scene" icon={Box} depth={0} onClick={() => setSelectedNode("scene")} active={selectedNode === "scene"} />
                 <HierarchyNode label="Default Camera" icon={Camera} depth={1} onClick={() => setSelectedNode("camera")} active={selectedNode === "camera"} />
                 <HierarchyNode label="DAUST Image Set" icon={FolderOpen} depth={1} onClick={() => setSelectedNode("images")} active={selectedNode === "images"} />
                 <HierarchyNode label="Neural Field" icon={Layers} depth={1} onClick={() => setSelectedNode("rdnc-field")} active={selectedNode === "rdnc-field"} />
              </div>
           </div>

           {/* PARAMETERS (Bottom) */}
           <div className="flex-1 flex flex-col overflow-hidden">
              <div className="pro-header">Parameters</div>
              <ProTabGroup 
                 tabs={["Train", "Info", "Edit", "Render"]} 
                 activeTab={activeTab} 
                 onTabClick={setActiveTab} 
              />
              <div className="flex-1 overflow-y-auto custom-scrollbar scrollbar-hide">
                 {selectedNode === "rdnc-field" && activeTab === "Train" && (
                    <div className="flex flex-col">
                       <ParameterGroup title="Model Profile">
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

      {/* 3. VIDEO TIMELINE (Bottom Scrubber) */}
      <footer className="h-[48px] timeline-bg flex items-center gap-4 px-4 z-50 shrink-0">
         <div className="flex items-center gap-3">
            <TimelineAction icon={<SkipBack size={14}/>} />
            <TimelineAction icon={<Play size={18} fill="currentColor"/>} active />
            <TimelineAction icon={<SkipForward size={14}/>} />
         </div>

         <div className="flex-1 h-full flex flex-col justify-center">
            {/* Scrubber Base */}
            <div className="w-full h-1 bg-white/10 relative cursor-pointer">
               <div className="absolute top-0 bottom-0 left-0 w-[4%] bg-white" />
               <div className="absolute top-1/2 -translate-y-1/2 left-[4%] w-3 h-3 bg-white border-4 border-[#121213] shadow-xl" />
            </div>
            {/* Timeline Indices */}
            <div className="flex justify-between mt-2 px-1">
               {[...Array(20)].map((_, i) => (
                  <div key={i} className="h-1 w-px bg-white/10" />
               ))}
            </div>
         </div>

         <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="text-foreground/80 tracking-widest">{currentTime}</span>
            <div className="flex gap-4 items-center">
               <TimelineAction icon={<Volume2 size={14}/>} />
               <TimelineAction icon={<Maximize2 size={14}/>} />
               <TimelineAction icon={<MoreVertical size={14}/>} />
            </div>
         </div>
         
         {/* Live Progress HUD */}
         <div className="absolute bottom-[48px] right-0 p-2 text-[9px] font-mono flex gap-4 text-foreground/30 bg-black/40 backdrop-blur-sm pointer-events-none">
            <span>Training Radiance Field</span>
            <div className="flex gap-2">
               <span>84%</span>
               <div className="w-20 bg-white/10 h-2 my-auto relative">
                  <div className="absolute top-0 bottom-0 left-0 w-[84%] bg-accent" />
               </div>
            </div>
            <span>Remaining: 3m 11s</span>
         </div>
      </footer>
    </div>
  );
}

/* Helper Components for Postshot GUI */
function UtilityButton({ icon, label, active }: any) {
  return (
    <button className={cn(
      "flex items-center gap-2 px-2 py-1 transition-all border border-transparent",
      active ? "bg-[#353638] text-white border-[#4d4e50]" : "text-[#aaa] hover:bg-white/5"
    )}>
      {icon}
      <span className="text-[10px] font-mono tracking-tighter">{label}</span>
    </button>
  );
}

function SideTool({ icon }: any) {
  return (
    <button className="p-2 text-foreground/40 hover:text-white hover:bg-white/5 transition-all">
       {icon}
    </button>
  );
}

function TimelineAction({ icon, active }: any) {
  return (
    <button className={cn(
       "p-1 hover:text-white transition-colors",
       active ? "text-white" : "text-foreground/40"
    )}>
       {icon}
    </button>
  );
}
