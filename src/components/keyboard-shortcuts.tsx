"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

const shortcuts = [
  { keys: ["g", "h"], description: "Go to Dashboard", action: "/" },
  { keys: ["g", "p"], description: "Go to pNodes", action: "/pnodes" },
  { keys: ["g", "a"], description: "Go to Analytics", action: "/analytics" },
  { keys: ["g", "b"], description: "Go to About", action: "/about" },
  { keys: ["r"], description: "Refresh data", action: "refresh" },
  { keys: ["t"], description: "Toggle theme", action: "theme" },
  { keys: ["?"], description: "Show keyboard shortcuts", action: "help" },
  { keys: ["/"], description: "Focus search", action: "search" },
  { keys: ["Esc"], description: "Close dialogs", action: "escape" },
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Handle two-key shortcuts (g + something)
      if (pendingKey === "g") {
        setPendingKey(null);
        switch (key) {
          case "h":
            router.push("/");
            break;
          case "p":
            router.push("/pnodes");
            break;
          case "a":
            router.push("/analytics");
            break;
          case "b":
            router.push("/about");
            break;
        }
        return;
      }

      // Handle single-key shortcuts
      switch (key) {
        case "g":
          setPendingKey("g");
          setTimeout(() => setPendingKey(null), 1000);
          break;
        case "?":
          e.preventDefault();
          setIsOpen(true);
          break;
        case "/":
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[placeholder*="Search"]'
          );
          searchInput?.focus();
          break;
        case "r":
          // Trigger refresh - dispatch custom event
          window.dispatchEvent(new CustomEvent("refresh-data"));
          break;
        case "t":
          // Toggle theme - dispatch custom event
          window.dispatchEvent(new CustomEvent("toggle-theme"));
          break;
        case "escape":
          setIsOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingKey, router]);

  return (
    <>
      {/* Pending key indicator */}
      {pendingKey && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-card border rounded-lg shadow-lg">
          <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">
            {pendingKey}
          </kbd>
          <span className="text-sm text-muted-foreground">waiting...</span>
        </div>
      )}

      {/* Shortcuts dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Navigation
              </h4>
              {shortcuts
                .filter((s) => s.action.startsWith("/"))
                .map((shortcut) => (
                  <ShortcutRow key={shortcut.action} {...shortcut} />
                ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Actions
              </h4>
              {shortcuts
                .filter((s) => !s.action.startsWith("/"))
                .map((shortcut) => (
                  <ShortcutRow key={shortcut.action} {...shortcut} />
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ShortcutRow({
  keys,
  description,
}: {
  keys: string[];
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-muted-foreground text-xs">+</span>}
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
              {key}
            </kbd>
          </span>
        ))}
      </div>
    </div>
  );
}
