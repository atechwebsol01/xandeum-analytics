"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ChevronLeft } from "lucide-react";

interface TourStep {
  href: string; // Use href to find the link directly
  title: string;
  description: string;
  sectionToExpand?: string;
}

const STEPS: TourStep[] = [
  {
    href: "",
    title: "Welcome to Xandeum Analytics!",
    description: "Your dashboard for monitoring the Xandeum pNode network. Let's take a quick tour!",
  },
  {
    href: "/pnodes",
    title: "All Nodes",
    description: "Browse all pNodes with X-Score, credits, and status. Click any row for details.",
    sectionToExpand: "pNodes",
  },
  {
    href: "/my-nodes",
    title: "My Nodes",
    description: "Save your favorite nodes (up to 20) for quick monitoring.",
    sectionToExpand: "pNodes",
  },
  {
    href: "/map",
    title: "Global Map",
    description: "See where pNodes are located worldwide on an interactive 3D globe.",
    sectionToExpand: "pNodes",
  },
  {
    href: "/swap",
    title: "Swap Tokens",
    description: "Trade SOL for XAND directly using Jupiter - best rates on Solana.",
    sectionToExpand: "Trading",
  },
  {
    href: "/token",
    title: "Token Analytics",
    description: "Track XAND price, market cap, volume, and view live charts.",
    sectionToExpand: "Trading",
  },
  {
    href: "/earnings",
    title: "Earnings Estimator",
    description: "Calculate potential pNode earnings based on your setup.",
    sectionToExpand: "Trading",
  },
  {
    href: "/chat",
    title: "AI Assistant",
    description: "Ask questions about Xandeum anytime using our AI chatbot!",
    sectionToExpand: "Tools",
  },
  {
    href: "/telegram",
    title: "Telegram Bot",
    description: "Get alerts when your nodes go offline via @Xandeum_Atech_bot",
    sectionToExpand: "Tools",
  },
];

const STORAGE_KEY = "xandeum-tour-v8";
const OVERLAY_BG = "rgba(0, 0, 0, 0.8)";

export function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const current = STEPS[step];
  const isWelcome = !current.href;

  // Expand a sidebar section by clicking its button
  const expandSection = (name: string) => {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      if (btn.textContent?.includes(name)) {
        // Check if collapsed (chevron not rotated)
        const svg = btn.querySelector("svg.rotate-180");
        if (!svg) {
          btn.click();
        }
        break;
      }
    }
  };

  // Find element by href and get its rect
  const findTarget = () => {
    if (!current.href) {
      setRect(null);
      return;
    }

    // Query by href - most reliable!
    const link = document.querySelector(`a[href="${current.href}"]`) as HTMLElement;
    
    if (link) {
      const r = link.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        return;
      }
    }
    
    setRect(null);
  };

  // Initialize
  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(() => setOpen(true), 1200);
    }
  }, []);

  // On step change - expand section and find target
  useEffect(() => {
    if (!open) return;

    // Expand section first
    if (current.sectionToExpand) {
      expandSection(current.sectionToExpand);
    }

    // Wait for DOM to update, then find target
    const t1 = setTimeout(findTarget, 100);
    const t2 = setTimeout(findTarget, 300);
    const t3 = setTimeout(findTarget, 500);

    window.addEventListener("resize", findTarget);
    window.addEventListener("scroll", findTarget, true);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", findTarget);
      window.removeEventListener("scroll", findTarget, true);
    };
  }, [open, step, current]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : close());
  const prev = () => (step > 0 ? setStep(step - 1) : null);

  if (!mounted || !open) return null;

  // Calculate spotlight hole
  const PAD = 6;
  const hasSpotlight = rect !== null;
  const hole = hasSpotlight ? {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  } : null;

  // Tooltip position
  const winW = window.innerWidth;
  let tipTop = 0, tipLeft = 0;
  
  if (hole) {
    tipLeft = hole.left + hole.width + 16;
    tipTop = hole.top;
    if (tipLeft + 310 > winW) {
      tipLeft = Math.max(16, hole.left - 326);
    }
  }

  return createPortal(
    <>
      {/* OVERLAY */}
      {isWelcome || !hole ? (
        <div onClick={close} style={{ position: "fixed", inset: 0, backgroundColor: OVERLAY_BG, zIndex: 99990 }} />
      ) : (
        <>
          {/* Top */}
          <div onClick={close} style={{ position: "fixed", top: 0, left: 0, right: 0, height: Math.max(0, hole.top), backgroundColor: OVERLAY_BG, zIndex: 99990 }} />
          {/* Bottom */}
          <div onClick={close} style={{ position: "fixed", top: hole.top + hole.height, left: 0, right: 0, bottom: 0, backgroundColor: OVERLAY_BG, zIndex: 99990 }} />
          {/* Left */}
          <div onClick={close} style={{ position: "fixed", top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.height, backgroundColor: OVERLAY_BG, zIndex: 99990 }} />
          {/* Right */}
          <div onClick={close} style={{ position: "fixed", top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height, backgroundColor: OVERLAY_BG, zIndex: 99990 }} />
          {/* Border highlight */}
          <div style={{
            position: "fixed",
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            border: "3px solid #8b5cf6",
            borderRadius: 8,
            boxShadow: "0 0 0 4px rgba(139,92,246,0.3), 0 0 20px rgba(139,92,246,0.5)",
            pointerEvents: "none",
            zIndex: 99991,
          }} />
        </>
      )}

      {/* TOOLTIP */}
      <div
        style={{
          position: "fixed",
          top: isWelcome ? "50%" : tipTop,
          left: isWelcome ? "50%" : tipLeft,
          transform: isWelcome ? "translate(-50%, -50%)" : "none",
          width: 310,
          zIndex: 99999,
        }}
      >
        <div className="bg-card border rounded-xl shadow-2xl overflow-hidden">
          {/* Arrow */}
          {hole && (
            <div style={{
              position: "absolute",
              left: tipLeft > hole.left ? -8 : "auto",
              right: tipLeft <= hole.left ? -8 : "auto",
              top: 22,
              width: 16,
              height: 16,
              backgroundColor: "#7c3aed",
              transform: "rotate(45deg)",
            }} />
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{step + 1} / {STEPS.length}</span>
              <button onClick={close} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <h3 className="text-lg font-bold">{current.title}</h3>
          </div>

          {/* Body */}
          <div className="p-4">
            <p className="text-sm text-muted-foreground">{current.description}</p>
          </div>

          {/* Progress */}
          <div className="px-4 pb-3">
            <div className="h-1 bg-muted rounded-full">
              <div className="h-full bg-violet-600 rounded-full transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-3 pb-3">
            <Button variant="ghost" size="sm" onClick={prev} disabled={step === 0}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={close}>Skip</Button>
              <Button size="sm" onClick={next} className="bg-violet-600 hover:bg-violet-700 text-white">
                {step === STEPS.length - 1 ? "Done!" : "Next"} {step < STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export function ResetTourButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); }}>
      Restart Tour
    </Button>
  );
}

// Floating help button - always visible
export function HelpButton() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <button
      onClick={() => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }}
      className="fixed bottom-20 left-4 z-50 w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
      title="Restart Tour"
    >
      <span className="text-lg font-bold">?</span>
    </button>
  );
}
