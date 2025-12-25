"use client";

import { Component, useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Globe, Maximize2, Minimize2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PNodeWithScore, GeoLocation } from "@/types/pnode";

// Error boundary for catching Canvas/WebGL errors
class CanvasErrorBoundary extends Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Check if WebGL is supported
function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

interface Globe3DProps {
  nodes: PNodeWithScore[];
  geoData: Map<string, GeoLocation>;
  isLoading: boolean;
}

// Convert lat/lon to 3D sphere coordinates
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Node marker component
function NodeMarker({ 
  position, 
  status, 
  pubkey, 
  location 
}: { 
  position: THREE.Vector3;
  status: string;
  pubkey: string;
  location: string;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const color = status === "online" ? "#10b981" : status === "warning" ? "#f59e0b" : "#ef4444";

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.5 : 1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-background/95 border rounded-lg p-2 shadow-lg text-xs whitespace-nowrap">
            <p className="font-mono text-[10px]">{pubkey.slice(0, 8)}...{pubkey.slice(-6)}</p>
            <p className="text-muted-foreground">{location}</p>
            <p className={cn(
              "font-medium",
              status === "online" ? "text-emerald-500" : 
              status === "warning" ? "text-yellow-500" : "text-red-500"
            )}>
              {status}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

// Connection line between nodes
function ConnectionLine({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
  const lineRef = useRef<THREE.Line>(null);
  
  const { geometry, material } = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      start,
      new THREE.Vector3(
        (start.x + end.x) / 2,
        (start.y + end.y) / 2 + 0.3,
        (start.z + end.z) / 2
      ),
      end
    );
    const points = curve.getPoints(20);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: "#8b5cf6", opacity: 0.3, transparent: true });
    return { geometry: geo, material: mat };
  }, [start, end]);

  return <primitive ref={lineRef} object={new THREE.Line(geometry, material)} />;
}

// Earth globe
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <meshStandardMaterial
        color="#1e293b"
        roughness={0.8}
        metalness={0.2}
        wireframe={false}
      />
      {/* Grid lines */}
      <Sphere args={[1.001, 32, 32]}>
        <meshBasicMaterial
          color="#334155"
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>
    </Sphere>
  );
}

// Main scene
function Scene({ nodes, geoData }: { nodes: PNodeWithScore[]; geoData: Map<string, GeoLocation> }) {
  const nodesWithGeo = useMemo(() => {
    return nodes
      .filter((node) => geoData.has(node.ip))
      .map((node) => {
        const geo = geoData.get(node.ip)!;
        return {
          ...node,
          position: latLonToVector3(geo.lat, geo.lon, 1.05),
          location: `${geo.city || "Unknown"}, ${geo.country || "Unknown"}`,
        };
      });
  }, [nodes, geoData]);

  // Create deterministic connections between nodes for visual effect
  const connections = useMemo(() => {
    const conns: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const onlineNodes = nodesWithGeo.filter((n) => n.status === "online");
    
    // Create deterministic connections based on node positions
    for (let i = 0; i < Math.min(20, onlineNodes.length - 1); i++) {
      const startIdx = i;
      const endIdx = (i + 5) % onlineNodes.length; // Connect to node 5 positions away
      if (startIdx !== endIdx && onlineNodes[startIdx] && onlineNodes[endIdx]) {
        conns.push({
          start: onlineNodes[startIdx].position,
          end: onlineNodes[endIdx].position,
        });
      }
    }
    return conns;
  }, [nodesWithGeo]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

      <Earth />

      {/* Node markers */}
      {nodesWithGeo.map((node) => (
        <NodeMarker
          key={node.pubkey}
          position={node.position}
          status={node.status}
          pubkey={node.pubkey}
          location={node.location}
        />
      ))}

      {/* Connection lines */}
      {connections.map((conn, i) => (
        <ConnectionLine key={i} start={conn.start} end={conn.end} />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={4}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function Globe3D({ nodes, geoData, isLoading }: Globe3DProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Use lazy initial state to check WebGL support only once on mount
  const [webGLSupported] = useState<boolean>(() => isWebGLSupported());
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const onlineCount = nodes.filter((n) => n.status === "online").length;
  const locatedCount = nodes.filter((n) => geoData.has(n.ip)).length;

  // Show fallback if WebGL not supported
  if (webGLSupported === false || hasError) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                <Globe className="h-4 w-4 text-white" />
              </div>
              3D Network Globe
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {locatedCount} nodes located
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full rounded-lg bg-slate-950/50 flex flex-col items-center justify-center text-center p-6">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">3D Globe Unavailable</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Your browser or graphics card doesn&apos;t support WebGL, which is required for the 3D globe visualization. 
              The 2D map below provides the same node location data.
            </p>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>{onlineCount} online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>{locatedCount} located</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            3D Network Globe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={containerRef} className={cn(isFullscreen && "fixed inset-0 z-50 rounded-none")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <Globe className="h-4 w-4 text-white" />
            </div>
            3D Network Globe
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {locatedCount} located
            </Badge>
            <Badge variant="success" className="text-xs">
              {onlineCount} online
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className={cn(
            "w-full rounded-lg overflow-hidden bg-slate-950",
            isFullscreen ? "h-[calc(100vh-80px)]" : "h-[400px]"
          )}
        >
          <CanvasErrorBoundary onError={() => setHasError(true)}>
            <Canvas 
              camera={{ position: [0, 0, 2.5], fov: 45 }}
              onCreated={() => {
                // WebGL context successfully created
              }}
              fallback={
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  Loading 3D scene...
                </div>
              }
              gl={{ 
                failIfMajorPerformanceCaveat: false,
                powerPreference: "low-power"
              }}
            >
              <Scene nodes={nodes} geoData={geoData} />
            </Canvas>
          </CanvasErrorBoundary>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-violet-500/50" />
            <span className="text-xs text-muted-foreground">Connections</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
