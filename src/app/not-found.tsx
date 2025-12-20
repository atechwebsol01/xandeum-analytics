import Link from "next/link";
import { Server, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
          <Server className="h-12 w-12 text-violet-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-md">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/pnodes">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Browse pNodes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
