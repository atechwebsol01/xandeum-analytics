"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  Server,
  Network,
  BarChart3,
  ArrowLeftRight,
  Coins,
  Calculator,
  BookOpen,
  Info,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Github,
  MessageCircle,
  Bot,
  History,
  Globe,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  Monitor,
  Star,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "next-themes";

interface NavItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
  external?: boolean;
}

const navigation: NavItem[] = [
  { 
    name: "Overview", 
    href: "/", 
    icon: LayoutDashboard 
  },
  {
    name: "pNodes",
    icon: Server,
    children: [
      { name: "Network Stats", href: "/network", icon: Network },
      { name: "All Nodes", href: "/pnodes", icon: Server },
      { name: "My Nodes", href: "/my-nodes", icon: Star, badge: "New" },
      { name: "Global Map", href: "/map", icon: Globe },
      { name: "Historical Data", href: "/history", icon: History },
    ],
  },
  {
    name: "Trading",
    icon: Coins,
    children: [
      { name: "Swap Tokens", href: "/swap", icon: ArrowLeftRight },
      { name: "Token Analytics", href: "/token", icon: BarChart3 },
      { name: "Earnings", href: "/earnings", icon: DollarSign },
      { name: "Staking", href: "/analytics#staking", icon: Calculator },
    ],
  },
  {
    name: "Tools",
    icon: Bot,
    children: [
      { name: "AI Assistant", href: "/chat", icon: MessageCircle },
      { name: "Telegram Bot", href: "/telegram", icon: Bell },
    ],
  },
  {
    name: "Resources",
    icon: BookOpen,
    children: [
      { name: "Documentation", href: "/docs", icon: BookOpen },
      { name: "About", href: "/about", icon: Info },
      { name: "Xandeum Docs", href: "https://docs.xandeum.network", icon: ExternalLink, external: true },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["pNodes", "Trading"]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleSection = useCallback((name: string) => {
    setExpandedSections((prev) =>
      prev.includes(name)
        ? prev.filter((s) => s !== name)
        : [...prev, name]
    );
  }, []);

  const isActive = useCallback((href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    if (href.includes("#")) {
      const basePath = href.split("#")[0];
      return pathname === basePath || pathname.startsWith(basePath);
    }
    return pathname === href || pathname.startsWith(href);
  }, [pathname]);

  const isParentActive = useCallback((item: NavItem) => {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  }, [isActive]);

  // Memoize the sidebar content to avoid unnecessary re-renders
  const sidebarContent = useMemo(() => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b shrink-0",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 transition-transform duration-200 group-hover:scale-105">
            <span className="text-lg font-bold text-white">X</span>
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Xandeum
              </span>
              <span className="text-sm font-medium text-muted-foreground ml-1">
                Analytics
              </span>
            </div>
          )}
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden lg:flex"
            onClick={() => setCollapsed(true)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => !collapsed && toggleSection(item.name)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                      isParentActive(item)
                        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", isParentActive(item) && "text-violet-500")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.name}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            expandedSections.includes(item.name) && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && expandedSections.includes(item.name) && (
                    <div className="ml-4 pl-4 border-l border-border/50 space-y-1">
                      {item.children.map((child) => (
                        child.external ? (
                          <a
                            key={child.name}
                            href={child.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          >
                            <child.icon className="h-4 w-4" />
                            <span className="flex-1">{child.name}</span>
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </a>
                        ) : (
                          <Link
                            key={child.name}
                            href={child.href || "#"}
                            data-tour={child.href?.replace("/", "") || child.name.toLowerCase().replace(/\s+/g, "-")}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200",
                              isActive(child.href)
                                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                          >
                            <child.icon className={cn("h-4 w-4", isActive(child.href) && "text-violet-500")} />
                            <span className="flex-1">{child.name}</span>
                            {child.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-violet-500 text-white">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href || "#"}
                  data-tour={item.href?.replace("/", "") || item.name.toLowerCase().replace(/\s+/g, "-")}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive(item.href)
                      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive(item.href) && "text-violet-500")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className={cn(
        "border-t p-3 space-y-2 shrink-0",
        collapsed && "px-2"
      )}>
        {/* Theme Switcher */}
        {mounted && (
          <div className={cn(
            "flex items-center gap-1 p-1 rounded-lg bg-muted/50",
            collapsed ? "flex-col" : "justify-between"
          )}>
            {!collapsed && <span className="text-xs text-muted-foreground px-2">Theme</span>}
            <div className="flex gap-1">
              <Button
                variant={theme === "light" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setTheme("light")}
                type="button"
              >
                <Sun className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={theme === "dark" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setTheme("dark")}
                type="button"
              >
                <Moon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={theme === "system" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setTheme("system")}
                type="button"
              >
                <Monitor className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* External Links */}
        {!collapsed && (
          <div className="flex gap-2">
            <a
              href="https://xandeum.network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full text-xs">
                Xandeum
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </a>
            <a
              href="https://github.com/atechwebsol01/xandeum-analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
            </a>
          </div>
        )}

        {/* Restart Tour */}
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground"
            onClick={() => {
              localStorage.removeItem("xandeum-tour-v8");
              window.location.reload();
            }}
            type="button"
          >
            🎯 Restart Tour
          </Button>
        )}

        {/* Expand button when collapsed */}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-8"
            onClick={() => setCollapsed(false)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        )}
      </div>
    </div>
  ), [collapsed, expandedSections, isActive, isParentActive, mounted, setTheme, theme, toggleSection]);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
            <span className="text-sm font-bold text-white">X</span>
          </div>
          <span className="font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Xandeum
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-background border-r transform transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed top-0 left-0 z-40 h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Spacer for content */}
      <div className={cn(
        "hidden lg:block shrink-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )} />
      
      {/* Mobile spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
