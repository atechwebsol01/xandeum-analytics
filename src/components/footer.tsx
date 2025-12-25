import Link from "next/link";
import { Heart, ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/50">
      <div className="container py-8 px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                <span className="text-sm font-bold text-white">X</span>
              </div>
              <span className="font-bold">Xandeum Analytics</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional analytics platform for monitoring Xandeum pNode network performance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/pnodes" className="text-muted-foreground hover:text-foreground transition-colors">
                pNodes Explorer
              </Link>
              <Link href="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                Analytics
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </nav>
          </div>

          {/* Xandeum */}
          <div className="space-y-3">
            <h4 className="font-semibold">Xandeum</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <a
                href="https://xandeum.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Website <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://docs.xandeum.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Documentation <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://discord.gg/uqRSmmM5m"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Discord <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://t.me/xandeumlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Telegram <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://twitter.com/xandeumnetwork"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Twitter <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://forum.xandeum.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Forum <ExternalLink className="h-3 w-3" />
              </a>
            </nav>
          </div>

          {/* Developer */}
          <div className="space-y-3">
            <h4 className="font-semibold">Developer</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <a
                href="https://github.com/atechwebsol01"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                GitHub <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://x.com/atechwebsol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                X (Twitter) <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://t.me/atechwebsol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Telegram <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://github.com/atechwebsol01/xandeum-analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Source Code <ExternalLink className="h-3 w-3" />
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>by</span>
            <a
              href="https://x.com/atechwebsol"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-violet-600 transition-colors"
            >
              ATECH WEB SOLUTIONS
            </a>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {currentYear} - For the Xandeum community
          </div>
        </div>
      </div>
    </footer>
  );
}
