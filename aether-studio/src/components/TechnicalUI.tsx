"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChevronDown, ChevronRight, Eye, EyeOff, Lock, Unlock } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* 1. Technical Parameters Group */
export function ParameterGroup({ title, children, expanded = true }: { title: string; children: React.ReactNode; expanded?: boolean }) {
  const [isExpanded, setIsExpanded] = React.useState(expanded);
  
  return (
    <div className="border-b border-border/50 select-none">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 px-2 py-1.5 bg-panel hover:bg-panel-bright cursor-pointer"
      >
        <ChevronDown size={12} className={cn("text-foreground/30 transition-transform", !isExpanded && "-rotate-90")} />
        <span className="text-[10px] uppercase font-bold tracking-tight text-foreground/60">{title}</span>
      </div>
      {isExpanded && <div className="p-3 space-y-2 bg-[#121213]">{children}</div>}
    </div>
  );
}

/* 2. Pro Numeric Input (Draggable Feel) */
export function NumericField({ label, value, onChange }: { label: string; value: number | string; onChange?: (v: any) => void }) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-2 group">
      <label className="text-[10px] text-foreground/40 font-mono group-hover:text-foreground/70 transition-colors uppercase">{label}</label>
      <div className="relative">
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange?.(e.target.value)}
          className="pro-input pr-6" 
        />
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-foreground/20 uppercase">px</span>
      </div>
    </div>
  );
}

/* 3. Postshot Toggle */
export function ProToggle({ label, active, onToggle }: { label: string; active: boolean; onToggle?: () => void }) {
  return (
    <div className="flex items-center justify-between group">
      <label className="text-[10px] text-foreground/40 font-mono group-hover:text-foreground/70">{label}</label>
      <button 
        onClick={onToggle}
        className={cn(
          "w-6 h-3 border border-border relative transition-colors",
          active ? "bg-accent/40 border-accent" : "bg-black/40"
        )}
      >
        <div className={cn(
          "absolute top-0.5 bottom-0.5 w-2 bg-white/80 transition-all",
          active ? "left-[13px]" : "left-0.5"
        )} />
      </button>
    </div>
  );
}

/* 4. Scene Hierarchy Item */
export function HierarchyNode({ 
  label, 
  icon: Icon, 
  depth = 0, 
  active = false, 
  visible = true,
  locked = false,
  onClick 
}: any) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/5 cursor-pointer select-none",
        active && "bg-accent/15 text-accent border-l-2 border-accent"
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <ChevronRight size={10} className="text-foreground/10" />
      <Icon size={12} className={cn("shrink-0", active ? "text-accent" : "text-foreground/40")} />
      <span className={cn("text-[10px] font-mono flex-1 truncate", active ? "font-bold" : "text-foreground/70")}>
        {label}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 px-1">
        {visible ? <Eye size={10} className="text-foreground/20" /> : <EyeOff size={10} className="text-accent" />}
        {locked ? <Lock size={10} className="text-accent" /> : <Unlock size={10} className="text-foreground/20" />}
      </div>
    </div>
  );
}

/* 5. Parameter Tab Group */
export function ProTabGroup({ tabs, activeTab, onTabClick }: { tabs: string[]; activeTab: string; onTabClick: (t: string) => void }) {
  return (
    <div className="flex bg-[#1a1a1c] border-b border-border overflow-x-auto custom-scrollbar scrollbar-hide">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabClick(tab)}
          className={cn(
            "px-3 py-1.5 text-[10px] uppercase font-mono border-r border-border transition-colors whitespace-nowrap",
            activeTab === tab ? "bg-[#232325] text-foreground border-b border-b-accent" : "text-foreground/30 hover:text-foreground/60"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
