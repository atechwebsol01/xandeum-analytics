import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background/50">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Built with</span>
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span>for the</span>
          <a
            href="https://xandeum.network"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-violet-600 transition-colors"
          >
            Xandeum
          </a>
          <span>community</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href="https://discord.gg/xandeum"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Discord
          </a>
          <a
            href="https://twitter.com/xandeum"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Twitter
          </a>
          <a
            href="https://docs.xandeum.network"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
}
