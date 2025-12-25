import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Database,
  Coins,
  Bot,
  MessageSquare,
  BarChart3,
  Calculator,
  Download,
  Keyboard,
  Zap,
  Shield,
  Clock,
  Activity,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation | Xandeum Analytics",
  description:
    "Learn how to use the Xandeum Analytics platform. Documentation for features, metrics, APIs, and deployment.",
};

interface DocSection {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const sections: DocSection[] = [
  {
    title: "Getting Started",
    icon: <Zap className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>
          Welcome to Xandeum Analytics, a real-time monitoring dashboard for the Xandeum pNode network.
          This platform provides comprehensive insights into network health, node performance, and storage metrics.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-3 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-1">Live Dashboard</h4>
            <p className="text-sm text-muted-foreground">
              Visit the <Link href="/" className="text-violet-500 hover:underline">home page</Link> to see real-time network statistics.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-1">Node Explorer</h4>
            <p className="text-sm text-muted-foreground">
              Browse all pNodes on the <Link href="/pnodes" className="text-violet-500 hover:underline">pNodes page</Link>.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Network Metrics",
    icon: <Activity className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>The dashboard displays several key network metrics:</p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-emerald-500/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div>
              <h4 className="font-medium">Online Nodes</h4>
              <p className="text-sm text-muted-foreground">
                Nodes last seen within 2 minutes. These are actively participating in the network.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-yellow-500/10">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
            </div>
            <div>
              <h4 className="font-medium">Warning Nodes</h4>
              <p className="text-sm text-muted-foreground">
                Nodes last seen 2-10 minutes ago. May be experiencing connectivity issues.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-red-500/10">
              <div className="w-2 h-2 rounded-full bg-red-500" />
            </div>
            <div>
              <h4 className="font-medium">Offline Nodes</h4>
              <p className="text-sm text-muted-foreground">
                Nodes not seen for more than 10 minutes. May be down or disconnected.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Pod Credits System",
    icon: <Database className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>
          Pod Credits are the official reputation metric for pNodes, tracking reliability over time.
        </p>
        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-emerald-500">+1 Credit</span>
            <span className="text-sm text-muted-foreground">Per successful heartbeat (~30 seconds)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-red-500">-100 Credits</span>
            <span className="text-sm text-muted-foreground">For each missed data operation</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-500">Monthly Reset</span>
            <span className="text-sm text-muted-foreground">Credits reset at the start of each month</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Data source: <code className="px-1.5 py-0.5 bg-muted rounded text-xs">podcredits.xandeum.network</code>
        </p>
      </div>
    ),
  },
  {
    title: "X-Score Calculation",
    icon: <Shield className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>
          The X-Score (0-100) is a composite performance metric calculated from multiple factors:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Factor</th>
                <th className="text-center py-2 font-medium">Max Points</th>
                <th className="text-left py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2">Pod Credits</td>
                <td className="text-center py-2">35</td>
                <td className="py-2 text-muted-foreground">Official reputation (0-10K: 20pts, 10K+: +15pts)</td>
              </tr>
              <tr>
                <td className="py-2">Uptime</td>
                <td className="text-center py-2">25</td>
                <td className="py-2 text-muted-foreground">Days of continuous operation (0.5pts/day)</td>
              </tr>
              <tr>
                <td className="py-2">Availability</td>
                <td className="text-center py-2">25</td>
                <td className="py-2 text-muted-foreground">Based on last seen timestamp</td>
              </tr>
              <tr>
                <td className="py-2">Storage</td>
                <td className="text-center py-2">10</td>
                <td className="py-2 text-muted-foreground">Storage commitment and usage ratio</td>
              </tr>
              <tr>
                <td className="py-2">Public Access</td>
                <td className="text-center py-2">5</td>
                <td className="py-2 text-muted-foreground">Bonus for public pRPC exposure</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    title: "3D Globe & Maps",
    icon: <Globe className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>
          The platform provides two visualization options for geographic distribution:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-3 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-1">3D Globe</h4>
            <p className="text-sm text-muted-foreground">
              Interactive Three.js visualization. Requires WebGL support. Auto-rotates and allows manual orbit controls.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-1">2D Map</h4>
            <p className="text-sm text-muted-foreground">
              Leaflet-based map with clustered markers. Works on all devices. Shows country/city statistics.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          IP geolocation is performed via the <code className="px-1.5 py-0.5 bg-muted rounded text-xs">ip-api.com</code> batch API.
        </p>
      </div>
    ),
  },
  {
    title: "Token Analytics",
    icon: <Coins className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>Real-time XAND token metrics sourced from Jupiter and DexScreener APIs:</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Price</Badge>
            Current USD price with 24h change percentage
          </li>
          <li className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Market Cap</Badge>
            Total market capitalization
          </li>
          <li className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Volume</Badge>
            24-hour trading volume
          </li>
          <li className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Liquidity</Badge>
            Available liquidity in pools
          </li>
        </ul>
        <p className="text-sm">
          Token: <code className="px-1.5 py-0.5 bg-muted rounded text-xs">XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx</code>
        </p>
      </div>
    ),
  },
  {
    title: "Staking Calculator",
    icon: <Calculator className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>Estimate your staking rewards based on amount and lock period:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Tier</th>
                <th className="text-center py-2 font-medium">Min Stake</th>
                <th className="text-center py-2 font-medium">Base APY</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr><td className="py-2 text-orange-600">Bronze</td><td className="text-center">0 SOL</td><td className="text-center">6.5%</td></tr>
              <tr><td className="py-2 text-gray-400">Silver</td><td className="text-center">100 SOL</td><td className="text-center">7.2%</td></tr>
              <tr><td className="py-2 text-yellow-500">Gold</td><td className="text-center">500 SOL</td><td className="text-center">8.0%</td></tr>
              <tr><td className="py-2 text-cyan-400">Platinum</td><td className="text-center">1000 SOL</td><td className="text-center">8.5%</td></tr>
              <tr><td className="py-2 text-violet-500">Diamond</td><td className="text-center">5000 SOL</td><td className="text-center">9.2%</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          Lock period bonuses: 30d (+0%), 90d (+0.5%), 180d (+1%), 365d (+1.5%)
        </p>
      </div>
    ),
  },
  {
    title: "AI Assistant (XandBot)",
    icon: <Bot className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>
          XandBot is an AI assistant powered by GPT-4o-mini, trained on Xandeum documentation.
          Click the chat icon in the bottom-right corner to ask questions about:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>What is Xandeum and how does it work?</li>
          <li>How do pNodes store data?</li>
          <li>How are Pod Credits calculated?</li>
          <li>How to run your own pNode?</li>
          <li>Understanding the X-Score metric</li>
          <li>XAND token and staking</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Telegram Bot",
    icon: <MessageSquare className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>
          Get real-time alerts and monitor your pNodes via Telegram:
        </p>
        <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm space-y-2">
          <p><span className="text-violet-500">/start</span> - Show menu with buttons</p>
          <p><span className="text-violet-500">/network</span> - Live network statistics</p>
          <p><span className="text-violet-500">/price</span> - XAND token price</p>
          <p><span className="text-violet-500">/watch [pubkey]</span> - Monitor a specific pNode</p>
          <p><span className="text-violet-500">/unwatch [pubkey]</span> - Stop monitoring</p>
          <p><span className="text-violet-500">/status</span> - View your watched nodes</p>
          <p><span className="text-violet-500">/alerts on|off</span> - Toggle notifications</p>
        </div>
        <a
          href="https://t.me/Xandeum_Atech_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-violet-500 hover:underline"
        >
          Open @Xandeum_Atech_bot
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    ),
  },
  {
    title: "Data Export",
    icon: <Download className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>Export node data in multiple formats from the pNodes table:</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Badge className="mb-2">CSV</Badge>
            <p className="text-xs text-muted-foreground">Spreadsheet compatible</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Badge className="mb-2">JSON</Badge>
            <p className="text-xs text-muted-foreground">For programmatic use</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Badge className="mb-2">TXT</Badge>
            <p className="text-xs text-muted-foreground">Human readable</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Keyboard Shortcuts",
    icon: <Keyboard className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>Navigate the dashboard efficiently with keyboard shortcuts:</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-center justify-between p-2 rounded bg-muted/50">
            <span className="text-sm">Show shortcuts</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">?</kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-muted/50">
            <span className="text-sm">Refresh data</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">R</kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-muted/50">
            <span className="text-sm">Toggle theme</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">T</kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-muted/50">
            <span className="text-sm">Go to home</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">H</kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-muted/50">
            <span className="text-sm">Go to pNodes</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">N</kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-muted/50">
            <span className="text-sm">Go to Analytics</span>
            <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">A</kbd>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "API Reference",
    icon: <BarChart3 className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>The platform exposes several API endpoints:</p>
        <div className="space-y-3 font-mono text-sm">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-violet-500 mb-1">GET /api/pnodes</p>
            <p className="text-xs text-muted-foreground">Returns all pNodes with credits, scores, and network stats</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-violet-500 mb-1">GET /api/token-price</p>
            <p className="text-xs text-muted-foreground">Returns XAND token price and market data</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-violet-500 mb-1">POST /api/geo</p>
            <p className="text-xs text-muted-foreground">Batch IP geolocation lookup</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-violet-500 mb-1">POST /api/chat</p>
            <p className="text-xs text-muted-foreground">AI chat endpoint (requires OpenAI API key)</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Deployment",
    icon: <Clock className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p>Deploy your own instance:</p>
        <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm space-y-2">
          <p className="text-muted-foreground"># Clone repository</p>
          <p>git clone https://github.com/YOUR_USERNAME/xandeum-analytics.git</p>
          <p className="text-muted-foreground mt-2"># Install dependencies</p>
          <p>npm install</p>
          <p className="text-muted-foreground mt-2"># Start development server</p>
          <p>npm run dev</p>
          <p className="text-muted-foreground mt-2"># Build for production</p>
          <p>npm run build</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Environment variables (optional): <code>OPENAI_API_KEY</code>, <code>TELEGRAM_BOT_TOKEN</code>, <code>NEXT_PUBLIC_SUPABASE_URL</code>
        </p>
      </div>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="container py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Badge className="mb-3">Documentation</Badge>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Xandeum Analytics Guide
        </h1>
        <p className="text-muted-foreground">
          Everything you need to know about using the Xandeum pNode analytics platform.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={index} id={section.title.toLowerCase().replace(/\s+/g, "-")}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                  {section.icon}
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>{section.content}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-lg bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 text-center">
        <h2 className="text-xl font-bold mb-2">Need More Help?</h2>
        <p className="text-muted-foreground mb-4">
          Join the Xandeum community for support and discussions.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="https://discord.gg/uqRSmmM5m"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            Discord
            <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href="https://docs.xandeum.network"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            Official Docs
            <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href="https://t.me/xandeumlabs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            Telegram
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
