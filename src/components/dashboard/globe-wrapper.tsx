"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "lucide-react";
import type { PNodeWithScore, GeoLocation } from "@/types/pnode";

// Thorough WebGL check - actually try to create and use a context
function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    
    if (!gl) return false;
    
    // Try to actually use the context
    const webgl = gl as WebGLRenderingContext;
    const debugInfo = webgl.getExtension("WEBGL_debug_renderer_info");
    
    if (debugInfo) {
      const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      // Check for known problematic renderers
      if (renderer && typeof renderer === "string") {
        const lowerRenderer = renderer.toLowerCase();
        // Block old DirectX 9 Intel HD Graphics
        if (lowerRenderer.includes("direct3d9") || lowerRenderer.includes("directx9")) {
          return false;
        }
      }
    }
    
    // Try to create a simple shader to verify the context works
    const vertexShader = webgl.createShader(webgl.VERTEX_SHADER);
    if (!vertexShader) return false;
    
    webgl.shaderSource(vertexShader, "void main() { gl_Position = vec4(0.0); }");
    webgl.compileShader(vertexShader);
    
    const success = webgl.getShaderParameter(vertexShader, webgl.COMPILE_STATUS);
    webgl.deleteShader(vertexShader);
    
    // Clean up
    const loseContext = webgl.getExtension("WEBGL_lose_context");
    if (loseContext) loseContext.loseContext();
    
    return success;
  } catch {
    return false;
  }
}

// Dynamically import Globe3D only when needed
const Globe3D = dynamic(
  () => import("@/components/dashboard/globe-3d").then((mod) => mod.Globe3D),
  { 
    ssr: false, 
    loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />
  }
);

interface GlobeWrapperProps {
  nodes: PNodeWithScore[];
  geoData: Map<string, GeoLocation>;
  isLoading: boolean;
}

export function GlobeWrapper({ nodes, geoData, isLoading }: GlobeWrapperProps) {
  // Use lazy initial state to check WebGL support only once on mount
  const [webGLSupported] = useState<boolean>(() => checkWebGLSupport());

  const onlineCount = nodes.filter((n) => n.status === "online").length;
  const locatedCount = nodes.filter((n) => geoData.has(n.ip)).length;

  // WebGL not supported - show animated 2D fallback
  if (!webGLSupported) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                <Globe className="h-4 w-4 text-white" />
              </div>
              Global Network View
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {locatedCount} nodes located
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full rounded-lg bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                animation: 'pulse 4s ease-in-out infinite'
              }} />
            </div>
            
            {/* Central globe representation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Outer glow rings */}
                <div className="absolute -inset-16 rounded-full border border-violet-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute -inset-12 rounded-full border border-violet-500/30 animate-ping" style={{ animationDuration: '2.5s' }} />
                <div className="absolute -inset-8 rounded-full border border-violet-500/40 animate-ping" style={{ animationDuration: '2s' }} />
                
                {/* Main globe circle */}
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border-2 border-violet-500/50 relative overflow-hidden">
                  {/* Globe lines */}
                  <div className="absolute inset-0 rounded-full border-t border-violet-400/30" style={{ top: '25%' }} />
                  <div className="absolute inset-0 rounded-full border-t border-violet-400/30" style={{ top: '50%' }} />
                  <div className="absolute inset-0 rounded-full border-t border-violet-400/30" style={{ top: '75%' }} />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-violet-400/30" />
                  <div className="absolute inset-y-0 left-1/4 w-px bg-violet-400/20" />
                  <div className="absolute inset-y-0 left-3/4 w-px bg-violet-400/20" />
                  
                  {/* Animated glow effect */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent animate-pulse"
                  />
                  
                  {/* Node dots - fixed positions */}
                  {[
                    { left: 25, top: 30 }, { left: 70, top: 25 }, { left: 45, top: 55 },
                    { left: 30, top: 70 }, { left: 65, top: 65 }, { left: 55, top: 35 },
                    { left: 35, top: 45 }, { left: 75, top: 50 }, { left: 40, top: 75 },
                    { left: 60, top: 40 }, { left: 50, top: 60 }, { left: 80, top: 35 }
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                      style={{
                        left: `${pos.left}%`,
                        top: `${pos.top}%`,
                        animationDelay: `${i * 0.15}s`,
                        boxShadow: '0 0 10px rgba(52, 211, 153, 0.8)'
                      }}
                    />
                  ))}
                </div>
                
                {/* Data transfer indicators */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ boxShadow: '0 0 15px rgba(251, 191, 36, 0.8)' }} />
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s', boxShadow: '0 0 15px rgba(34, 211, 238, 0.8)' }} />
                </div>
                <div className="absolute top-1/2 -left-4 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.25s', boxShadow: '0 0 15px rgba(244, 114, 182, 0.8)' }} />
                </div>
                <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.75s', boxShadow: '0 0 15px rgba(52, 211, 153, 0.8)' }} />
                </div>
              </div>
            </div>
            
            {/* Stats overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm text-emerald-400 font-mono">{onlineCount} ONLINE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-blue-400 font-mono">{locatedCount} LOCATED</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Network Status</div>
                <div className="text-lg font-bold text-emerald-400">OPERATIONAL</div>
              </div>
            </div>
            

          </div>
        </CardContent>
      </Card>
    );
  }

  // WebGL supported - render the actual globe
  return <Globe3D nodes={nodes} geoData={geoData} isLoading={isLoading} />;
}
