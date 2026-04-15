"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Layers, Layout, Target, Monitor, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: "Reconstruction Protocol",
    description: "Welcome to Aether-Scan Pro. This system is optimized for high-fidelity 3D reconstruction and neural data synthesis.",
    icon: <Layout className="text-accent" size={32} />
  },
  {
    title: "Session Explorer",
    description: "Orchestrate your reconstruction layers in the top-right pane. Navigate through point clouds, image sets, and neural fields.",
    icon: <Database className="text-accent" size={32} />
  },
  {
    title: "Neural Volumetrics",
    description: "Calibrate your reconstruction parameters live. High-precision control over SH Degree, Splat counts, and training hooks.",
    icon: <Target className="text-accent" size={32} />
  },
  {
    title: "Convergence Telemetry",
    description: "Monitor the evolution of your neural field in real-time. Track loss reduction and volumetric convergence live in the viewport.",
    icon: <Monitor className="text-accent" size={32} />
  }
];

export default function OnboardingFlow() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem("aether_pro_onboarding_completed");
    if (!completed) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("aether_pro_onboarding_completed", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <div className="max-w-md w-full p-10 glass-panel rounded-3xl relative shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 mx-4">
            <button 
              onClick={handleComplete}
              className="absolute top-6 right-6 text-foreground/20 hover:text-accent transition-all hover:rotate-90"
            >
              <X size={20} />
            </button>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="w-16 h-16 bg-accent/10 border border-accent/30 flex items-center justify-center rounded-2xl glow-accent mx-auto mb-8">
                {STEPS[currentStep].icon}
              </div>

              <div className="space-y-4 text-center">
                <span className="text-accent text-[10px] font-mono tracking-[0.3em] uppercase font-black opacity-60">
                   Protocol {currentStep + 1} // {STEPS.length}
                </span>
                <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-tight">
                   {STEPS[currentStep].title}
                </h1>
                <p className="text-[13px] text-foreground/50 font-sans leading-relaxed px-4">
                  {STEPS[currentStep].description}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <button 
                  onClick={handleNext} 
                  className="pro-btn pro-btn-active flex-1 flex justify-center py-4 rounded-2xl glow-accent group transition-all active:scale-95"
                >
                  <span className="font-bold uppercase tracking-[0.2em]">
                    {currentStep === STEPS.length - 1 ? "Initialize Workstation" : "Continue"}
                  </span>
                  <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Step Progress Dots */}
              <div className="flex justify-center gap-2 pt-2">
                 {STEPS.map((_, i) => (
                    <div 
                       key={i} 
                       className={cn(
                          "h-1 transition-all rounded-full",
                          i === currentStep ? "w-6 bg-accent" : "w-2 bg-white/10"
                       )} 
                    />
                 ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
