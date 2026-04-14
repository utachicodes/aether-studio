import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

/* 1. Technical Parameters Group */
export function ParameterGroup({ title, children, expanded = true }: { title: string; children: React.ReactNode; expanded?: boolean }) {
  const [isExpanded, setIsExpanded] = React.useState(expanded);
  
  return (
    <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden mb-2 transition-all hover:bg-white/[0.08]">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2.5 px-3 py-2 cursor-pointer group"
      >
        <ChevronDown size={14} className={cn("text-foreground/30 transition-transform duration-300", !isExpanded && "-rotate-90 group-hover:text-accent")} />
        <span className="text-[10px] uppercase font-black tracking-widest text-foreground/50 group-hover:text-foreground transition-colors">{title}</span>
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-1 space-y-3 bg-[#09090b]/40">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* 2. Pro Numeric Input (Modern Glass) */
export function NumericField({ label, value, onChange }: { label: string; value: number | string; onChange?: (v: any) => void }) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-2 group">
      <label className="text-[10px] text-foreground/40 font-sans group-hover:text-foreground/70 transition-colors uppercase font-bold tracking-widest">{label}</label>
      <div className="relative group-within:scale-[1.02] transition-transform">
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange?.(e.target.value)}
          className="pro-input pr-8 rounded-lg border-white/5 bg-white/5 focus:bg-black/40" 
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-mono text-accent opacity-40 uppercase font-bold">px</span>
      </div>
    </div>
  );
}

/* 3. Vibrant Toggle */
export function ProToggle({ label, active, onToggle }: { label: string; active: boolean; onToggle?: () => void }) {
  return (
    <div className="flex items-center justify-between group py-0.5">
      <label className="text-[10px] text-foreground/40 font-sans group-hover:text-foreground/80 transition-colors uppercase font-semibold tracking-wider font-mono">{label}</label>
      <button 
        onClick={onToggle}
        className={cn(
          "w-8 h-4 rounded-full relative transition-all duration-300 border",
          active ? "bg-accent/20 border-accent/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]" : "bg-white/5 border-white/10"
        )}
      >
        <motion.div 
          animate={{ x: active ? 16 : 2 }}
          className={cn(
            "absolute top-0.5 w-2.5 h-2.5 rounded-full transition-colors",
            active ? "bg-accent shadow-[0_0_8px_white]" : "bg-foreground/20"
          )} 
        />
      </button>
    </div>
  );
}

/* 4. Smooth Scene Hierarchy Item */
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
    <motion.div 
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2.5 px-3 py-1.5 cursor-pointer select-none rounded-lg mx-1 transition-all",
        active ? "bg-accent/15 text-accent shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]" : "text-foreground/40 hover:bg-white/5 hover:text-foreground/80"
      )}
      style={{ marginLeft: `${depth * 12 + 6}px` }}
    >
      <ChevronRight size={12} className={cn("transition-transform", active ? "rotate-90 text-accent" : "text-foreground/10")} />
      <div className={cn("p-1.5 rounded-md transition-colors", active ? "bg-accent/20" : "bg-white/5 group-hover:bg-white/10")}>
        <Icon size={14} className={cn("shrink-0", active ? "text-accent" : "text-foreground/60")} />
      </div>
      <span className={cn("text-[11px] font-sans flex-1 truncate tracking-tight", active ? "font-bold text-foreground" : "")}>
        {label}
      </span>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 px-1 items-center">
        {visible ? <Eye size={12} className="text-foreground/20 hover:text-foreground/60" /> : <EyeOff size={12} className="text-accent" />}
        {locked ? <Lock size={12} className="text-accent" /> : <Unlock size={12} className="text-foreground/20 hover:text-foreground/60" />}
      </div>
    </motion.div>
  );
}

/* 5. Glassmorphic Tab Group */
export function ProTabGroup({ tabs, activeTab, onTabClick }: { tabs: string[]; activeTab: string; onTabClick: (t: string) => void }) {
  return (
    <div className="flex bg-black/20 p-1 gap-1 border-b border-white/5 mb-2">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabClick(tab)}
          className={cn(
            "flex-1 py-1.5 text-[9px] uppercase font-bold tracking-[0.2em] transition-all rounded-lg",
            activeTab === tab ? "bg-white/10 text-accent shadow-lg border border-white/5" : "text-foreground/30 hover:text-foreground/60 hover:bg-white/5"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
