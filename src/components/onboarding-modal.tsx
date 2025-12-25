"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  BarChart3,
  Coins,
  Bot,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Database,
  Activity,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Welcome to Xandeum Analytics",
    description:
      "Your mission control for the Xandeum pNode network. Monitor 240+ storage nodes in real-time with live data from the network.",
    icon: <Sparkles className="h-8 w-8" />,
    highlight: "Real-time network monitoring",
  },
  {
    title: "Network Dashboard",
    description:
      "View live statistics including online/offline nodes, storage capacity, network health score, and version distribution across the network.",
    icon: <Activity className="h-8 w-8" />,
    highlight: "Live network statistics",
  },
  {
    title: "3D Globe Visualization",
    description:
      "Explore the global distribution of pNodes with our interactive 3D globe. Hover over nodes to see their location, status, and details.",
    icon: <Globe className="h-8 w-8" />,
    highlight: "Geographic distribution",
  },
  {
    title: "Pod Credits & X-Score",
    description:
      "Track node reputation with official Pod Credits (+1 per heartbeat, -100 for missed operations). X-Score combines credits, uptime, and availability into a 0-100 rating.",
    icon: <Database className="h-8 w-8" />,
    highlight: "Reputation metrics",
  },
  {
    title: "Token Analytics",
    description:
      "Monitor XAND token price, 24h change, market cap, and liquidity. Trade directly on Jupiter Exchange with our integrated swap interface.",
    icon: <Coins className="h-8 w-8" />,
    highlight: "Price & trading",
  },
  {
    title: "Staking Calculator",
    description:
      "Estimate your staking rewards based on amount, lock period, and tier. Tiers range from Bronze (6.5% APY) to Diamond (9.2% APY).",
    icon: <Calculator className="h-8 w-8" />,
    highlight: "Reward estimation",
  },
  {
    title: "AI Assistant (XandBot)",
    description:
      "Ask questions about Xandeum, pNodes, staking, and more. Our AI assistant is trained on Xandeum documentation to help you navigate the ecosystem.",
    icon: <Bot className="h-8 w-8" />,
    highlight: "Click the chat icon bottom-right",
  },
  {
    title: "Telegram Bot",
    description:
      "Get real-time alerts when your watched nodes go offline. Use /watch [pubkey] to monitor specific pNodes and receive push notifications.",
    icon: <MessageSquare className="h-8 w-8" />,
    highlight: "@Xandeum_Atech_bot",
  },
  {
    title: "Analytics & Export",
    description:
      "View detailed charts, compare nodes side-by-side, and export data in CSV, JSON, or TXT formats for your own analysis.",
    icon: <BarChart3 className="h-8 w-8" />,
    highlight: "Data export options",
  },
];

const STORAGE_KEY = "xandeum-onboarding-completed";

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasCompleted = localStorage.getItem(STORAGE_KEY);
    if (!hasCompleted) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/10"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-white/20">
                {step.icon}
              </div>
              <div>
                <Badge variant="secondary" className="mb-1 bg-white/20 text-white">
                  Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                </Badge>
                <DialogTitle className="text-xl text-white">
                  {step.title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-muted-foreground mb-4 leading-relaxed">
            {step.description}
          </p>

          {step.highlight && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                {step.highlight}
              </span>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep
                    ? "bg-violet-500 w-6"
                    : index < currentStep
                    ? "bg-violet-300"
                    : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
              Skip Tour
            </Button>
            <Button
              onClick={nextStep}
              className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export a button to manually trigger the tour
export function TriggerTourButton() {
  const handleClick = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} className="gap-2">
      <Sparkles className="h-4 w-4" />
      Take Tour
    </Button>
  );
}
