"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Bell,
  MessageCircle,
  Shield,
  Zap,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Smartphone,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings,
} from "lucide-react";

// Correct bot username - created via @BotFather
const BOT_USERNAME = "Xandeum_Atech_bot";
const BOT_LINK = `https://t.me/${BOT_USERNAME}`;

const features = [
  {
    icon: Bell,
    title: "Node Alerts",
    description: "Get instant notifications when your watched pNodes go offline or have issues",
  },
  {
    icon: Globe,
    title: "Network Stats",
    description: "Check live network statistics with /network command",
  },
  {
    icon: Zap,
    title: "Price Alerts",
    description: "Get XAND token price updates with /price command",
  },
  {
    icon: MessageCircle,
    title: "AI Assistant",
    description: "Ask questions about Xandeum - powered by GPT-4",
  },
  {
    icon: Shield,
    title: "Watch Nodes",
    description: "Monitor up to 10 pNodes with /watch [pubkey]",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Access all features from your phone via Telegram",
  },
];

const commands = [
  { cmd: "/start", desc: "Start the bot and see main menu" },
  { cmd: "/network", desc: "View live network statistics" },
  { cmd: "/price", desc: "Check current XAND token price" },
  { cmd: "/watch [pubkey]", desc: "Start watching a pNode" },
  { cmd: "/unwatch [pubkey]", desc: "Stop watching a pNode" },
  { cmd: "/status", desc: "View your watched nodes" },
  { cmd: "/alerts on|off", desc: "Toggle alert notifications" },
  { cmd: "/help", desc: "Show all available commands" },
];

const setupSteps = [
  {
    step: 1,
    title: "Create Bot with BotFather",
    description: "Open @BotFather on Telegram, send /newbot, and follow the prompts to create your bot.",
    link: "https://t.me/BotFather",
  },
  {
    step: 2,
    title: "Copy Bot Token",
    description: "BotFather will give you a token like 123456:ABC-DEF. Save this securely.",
  },
  {
    step: 3,
    title: "Add Environment Variables",
    description: "In Vercel, add TELEGRAM_BOT_TOKEN and NEXT_PUBLIC_TELEGRAM_BOT_USERNAME.",
  },
  {
    step: 4,
    title: "Set Webhook",
    description: "Call the Telegram API to set your webhook URL to receive messages.",
    code: `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.vercel.app/api/telegram"`,
  },
];

export default function TelegramPage() {
  const [copied, setCopied] = useState(false);
  const [botStatus, setBotStatus] = useState<"checking" | "online" | "offline" | "not_configured">("checking");
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // Check if bot is configured by trying to reach the API
    const checkBotStatus = async () => {
      try {
        // We can't directly check Telegram, but we can check if env vars are set
        // by making a test request to our API
        const response = await fetch("/api/telegram", {
          method: "GET",
          headers: { "Authorization": "Bearer test" },
        });
        
        if (response.status === 401) {
          // API exists but auth failed - bot is configured
          setBotStatus("online");
        } else if (response.status === 500) {
          // Server error - likely missing config
          setBotStatus("not_configured");
        } else {
          setBotStatus("online");
        }
      } catch {
        setBotStatus("offline");
      }
    };

    checkBotStatus();
  }, []);

  const copyBotLink = () => {
    navigator.clipboard.writeText(BOT_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyWebhookCommand = () => {
    const cmd = `curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=${window.location.origin}/api/telegram"`;
    navigator.clipboard.writeText(cmd);
  };

  return (
    <div className="container py-8 px-4 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mb-2">
          <Bot className="h-12 w-12 text-blue-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Telegram Bot
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Monitor your pNodes, get instant alerts, and access network stats right from Telegram
        </p>
        
        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2">
          {botStatus === "checking" && (
            <Badge variant="secondary">Checking status...</Badge>
          )}
          {botStatus === "online" && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Bot Configured
            </Badge>
          )}
          {botStatus === "offline" && (
            <Badge variant="error" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Bot Offline
            </Badge>
          )}
          {botStatus === "not_configured" && (
            <Badge variant="warning" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Setup Required
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <a href={BOT_LINK} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2 bg-[#0088cc] hover:bg-[#0077b5]">
              <MessageCircle className="h-5 w-5" />
              Open @{BOT_USERNAME}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <Button variant="outline" size="lg" onClick={copyBotLink} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </div>

      {/* Setup Required Warning */}
      {(botStatus === "not_configured" || botStatus === "offline") && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-600 dark:text-yellow-500 mb-2">
                  Bot Setup Required
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The Telegram bot needs to be configured before it can work. You need to create a bot via @BotFather and add the token to your environment variables.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSetup(!showSetup)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {showSetup ? "Hide Setup Guide" : "Show Setup Guide"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Guide */}
      {showSetup && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Bot Setup Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {setupSteps.map((step) => (
              <div key={step.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                  {step.link && (
                    <a href={step.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1">
                        Open BotFather
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  )}
                  {step.code && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between bg-muted p-2 rounded-lg">
                        <code className="text-xs break-all">{step.code}</code>
                        <Button variant="ghost" size="sm" onClick={copyWebhookCommand}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Environment Variables Needed:</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2 font-mono text-xs">
                <p>TELEGRAM_BOT_TOKEN=123456:ABC-DEF...</p>
                <p>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBotName</p>
                <p>OPENAI_API_KEY=sk-... (for AI features)</p>
                <p>SUPABASE_SERVICE_ROLE_KEY=... (for alerts)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bot Username Card */}
      <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-xl bg-[#0088cc]">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bot Username</p>
                <p className="text-xl font-mono font-bold">@{BOT_USERNAME}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                value={BOT_LINK}
                readOnly
                className="w-64 font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={copyBotLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:border-blue-500/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <feature.icon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Available Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {commands.map((item) => (
              <div
                key={item.cmd}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <code className="px-2 py-1 rounded bg-background font-mono text-sm text-blue-500 min-w-[160px]">
                  {item.cmd}
                </code>
                <span className="text-sm text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Use */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>How to Get Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold">Open the Bot</h4>
              <p className="text-sm text-muted-foreground">
                Click the button above or search for @{BOT_USERNAME} in Telegram
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold">Start the Bot</h4>
              <p className="text-sm text-muted-foreground">
                Send /start to begin and see the interactive menu
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold">Watch Your Nodes</h4>
              <p className="text-sm text-muted-foreground">
                Use /watch [pubkey] to start monitoring your pNodes
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold">Get Alerts</h4>
              <p className="text-sm text-muted-foreground">
                Receive instant notifications when your nodes have issues
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center py-8">
        <a href={BOT_LINK} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 bg-[#0088cc] hover:bg-[#0077b5]">
            Start Using the Bot
            <ChevronRight className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}
