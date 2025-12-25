"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ChevronLeft } from "lucide-react";

interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  sectionToExpand?: string;
}

const STEPS: TourStep[] = [
  {
    targetSelector: "",
    title: "Welcome to Xandeum Analytics!",
    description: "Your dashboard for monitoring the Xandeum pNode network. Let's take a quick tour!",
  },
  {
    targetSelector: "[data-tour='pnodes']",
    title: "All Nodes",
    description: "Browse all pNodes with X-Score, credits, and status. Click any row for details.",
    sectionToExpand: "pNodes",
  },
  {
    targetSelector: "[data-tour='my-nodes']",
    title: "My Nodes",
    description: "Save your favorite nodes (up to 20) for quick monitoring.",
    sectionToExpand: "pNodes",
  },
  {
    targetSelector: "[data-tour='map']",
    title: "Global Map",
    description: "See where pNodes are located worldwide on an interactive 3D globe.",
    sectionToExpand: "pNodes",
  },
  {
    targetSelector: "[data-tour='swap']",
    title: "Swap Tokens",
    description: "Trade SOL for XAND directly using Jupiter - best rates on Solana.",
    sectionToExpand: "Trading",
  },
  {
    targetSelector: "[data-tour='token']",
    title: "Token Analytics",
    description: "Track XAND price, market cap, volume, and view live charts.",
    sectionToExpand: "Trading",
  },
  {
    targetSelector: "[data-tour='earnings']",
    title: "Earnings Estimator",
    description: "Calculate potential pNode earnings based on your setup.",
    sectionToExpand: "Trading",
  },
  {
    targetSelector: "[data-tour='chat']",
    title: "AI Assistant",
    description: "Ask questions about Xandeum anytime using our AI chatbot!",
    sectionToExpand: "Tools",
  },
  {
    targetSelector: "[data-tour='telegram']",
    title: "Telegram Bot",
    description: "Get alerts when your nodes go offline via @Xandeum_Atech_bot",
    sectionToExpand: "Tools",
  },
];

const STORAGE_KEY = "xandeum-tour-done-v7";

function expandSidebarSection(sectionName: string): Promise<void> {
  return new Promise((resolve) => {
    // Find all buttons in the nav
    const buttons = document.querySelectorAll("nav button");
    
    for (const btn of buttons) {
      const buttonText = btn.textContent?.trim();
      if (buttonText?.includes(sectionName)) {
        // Check if already expanded (has rotate-180 class on chevron)
        const chevron = btn.querySelector("svg:last-child");
        const isExpanded = chevron?.classList.contains("rotate-180");
        
        if (!isExpanded) {
          (btn as HTMLButtonElement).click();
          // Wait for animation
          setTimeout(resolve, 300);
          return;
        }
      }
    }
    resolve();
  });
}

function findElement(selector: string, maxAttempts = 10): Promise<Element | null> {
  return new Promise((resolve) => {
    let attempts = 0;
    
    const tryFind = () => {
      const el = document.querySelector(selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Make sure element is visible (has dimensions)
        if (rect.width > 0 && rect.height > 0) {
          resolve(el);
          return;
        }
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryFind, 100);
      } else {
        resolve(null);
      }
    };
    
    tryFind();
  });
}

export function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const retryRef = useRef<NodeJS.Timeout | null>(null);

  const current = STEPS[step];
  const isWelcomeStep = !current.targetSelector;
  const isLastStep = step === STEPS.length - 1;

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(() => setOpen(true), 1500);
    }
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open || isWelcomeStep) {
      setTargetRect(null);
      return;
    }

    const findTargetElement = async () => {
      // First expand the section if needed
      if (current.sectionToExpand) {
        await expandSidebarSection(current.sectionToExpand);
      }

      // Now find the element
      const el = await findElement(current.targetSelector);
      
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    findTargetElement();

    // Also update on resize
    const handleResize = () => {
      if (current.targetSelector) {
        const el = document.querySelector(current.targetSelector);
        if (el) setTargetRect(el.getBoundingClientRect());
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, step, current, isWelcomeStep]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const next = () => {
    if (isLastStep) {
      close();
    } else {
      setStep(step + 1);
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!mounted || !open) return null;

  // Measurements
  const PAD = 8;
  const hasTarget = targetRect && targetRect.width > 0;
  
  const hole = hasTarget ? {
    top: targetRect!.top - PAD,
    left: targetRect!.left - PAD,
    width: targetRect!.width + PAD * 2,
    height: targetRect!.height + PAD * 2,
  } : null;

  const screenW = typeof window !== "undefined" ? window.innerWidth : 1920;
  const screenH = typeof window !== "undefined" ? window.innerHeight : 1080;

  // Tooltip position
  let tipTop = 100;
  let tipLeft = 100;
  
  if (hole) {
    tipLeft = hole.left + hole.width + 20;
    tipTop = hole.top;
    
    // If tooltip goes off screen right, put it below instead
    if (tipLeft + 320 > screenW) {
      tipLeft = Math.max(20, hole.left);
      tipTop = hole.top + hole.height + 20;
    }
    // If tooltip goes off screen bottom
    if (tipTop + 200 > screenH) {
      tipTop = Math.max(20, hole.top - 200);
    }
  }

  return createPortal(
    <>
      {/* OVERLAYS - Create 4 pieces around the hole */}
      {isWelcomeStep || !hole ? (
        // Full dark overlay for welcome or when no target found
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 99990,
          }}
        />
      ) : (
        <>
          {/* Top */}
          <div
            onClick={close}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: hole.top,
              backgroundColor: "rgba(0,0,0,0.8)",
              zIndex: 99990,
            }}
          />
          {/* Bottom */}
          <div
            onClick={close}
            style={{
              position: "fixed",
              top: hole.top + hole.height,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.8)",
              zIndex: 99990,
            }}
          />
          {/* Left */}
          <div
            onClick={close}
            style={{
              position: "fixed",
              top: hole.top,
              left: 0,
              width: hole.left,
              height: hole.height,
              backgroundColor: "rgba(0,0,0,0.8)",
              zIndex: 99990,
            }}
          />
          {/* Right */}
          <div
            onClick={close}
            style={{
              position: "fixed",
              top: hole.top,
              left: hole.left + hole.width,
              right: 0,
              height: hole.height,
              backgroundColor: "rgba(0,0,0,0.8)",
              zIndex: 99990,
            }}
          />
          {/* Highlight border */}
          <div
            style={{
              position: "fixed",
              top: hole.top,
              left: hole.left,
              width: hole.width,
              height: hole.height,
              border: "3px solid #8b5cf6",
              borderRadius: 8,
              boxShadow: "0 0 20px rgba(139,92,246,0.6)",
              pointerEvents: "none",
              zIndex: 99991,
            }}
          />
        </>
      )}

      {/* TOOLTIP */}
      <div
        style={{
          position: "fixed",
          top: isWelcomeStep ? "50%" : tipTop,
          left: isWelcomeStep ? "50%" : tipLeft,
          transform: isWelcomeStep ? "translate(-50%, -50%)" : "none",
          width: 320,
          zIndex: 99995,
        }}
      >
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Arrow pointing to target */}
          {hole && !isWelcomeStep && tipLeft === hole.left + hole.width + 20 && (
            <div
              style={{
                position: "absolute",
                left: -8,
                top: 24,
                width: 16,
                height: 16,
                backgroundColor: "#7c3aed",
                transform: "rotate(45deg)",
                zIndex: -1,
              }}
            />
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white">
            <div className="flex justify-between items-start">
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {step + 1} / {STEPS.length}
              </span>
              <button onClick={close} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold mt-2">{current.title}</h3>
          </div>

          {/* Body */}
          <div className="p-4">
            <p className="text-sm text-muted-foreground">{current.description}</p>
          </div>

          {/* Progress bar */}
          <div className="px-4 pb-3">
            <div className="h-1 bg-muted rounded-full">
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-3 pb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={prev}
              disabled={step === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={close}>
                Skip
              </Button>
              <Button
                size="sm"
                onClick={next}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isLastStep ? "Done!" : "Next"}
                {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
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
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }}
    >
      Restart Tour
    </Button>
  );
}
