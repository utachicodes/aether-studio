"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Layers, Layout, Target, Monitor } from "lucide-react";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: "Pro Workstation Architecture",
    description: "Welcome to Aether-Scan Pro. This environment is designed for high-density neural reconstruction, mirroring industrial 3D tools.",
    icon: <Layout className="text-accent" size={32} />
  },
  {
    title: "Scene Hierarchy",
    description: "Manage your project nodes in the top-right pane. Navigate between your camera sets, image streams, and the active neural field.",
    icon: <Layers className="text-accent" size={32} />
  },
  {
    title: "Neural Parameters",
    description: "Fine-tune your Splatting model in the parameters pane. Adjust SH Degree, Splat counts, and training hooks in real-time.",
    icon: <Target className="text-accent" size={32} />
  },
  {
    title: "Unified Capture",
    description: "Use the industrial timeline and utility bar to orchestrate your training. Monitor convergence telemetry live in the viewport.",
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
          <div className="max-w-md w-full p-8 bg-[#1a1a1c] border border-border shadow-2xl relative">
            <button 
              onClick={handleComplete}
              className="absolute top-4 right-4 text-foreground/20 hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 bg-accent/10 border border-accent/20 flex items-center justify-center">
                {STEPS[currentStep].icon}
              </div>

              <div className="space-y-2">
                <span className="text-accent text-[9px] font-mono tracking-widest uppercase opacity-50">Step {currentStep + 1} of {STEPS.length}</span>
                <h1 className="text-lg font-bold uppercase tracking-tight text-foreground">{STEPS[currentStep].title}</h1>
                <p className="text-xs text-foreground/60 font-sans leading-relaxed">
                  {STEPS[currentStep].description}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button onClick={handleNext} className="pro-btn pro-btn-active flex-1 flex justify-center py-2">
                  {currentStep === STEPS.length - 1 ? "Initialize Studio" : "Next Step"}
                  <ChevronRight size={14} className="ml-1" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
