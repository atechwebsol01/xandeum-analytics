import { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  Globe,
  Zap,
  Shield,
  Users,
  ArrowRight,
  ExternalLink,
  Github,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About | Xandeum Analytics",
  description:
    "Learn about Xandeum Analytics platform built by ATECH WEB SOLUTIONS for the Xandeum pNode network.",
};

const features = [
  {
    icon: Zap,
    title: "Real-time Monitoring",
    description:
      "Live updates every 30 seconds with automatic data refresh and instant status changes.",
  },
  {
    icon: Shield,
    title: "Reliable Data",
    description:
      "Multiple fallback endpoints ensure continuous data availability even during network issues.",
  },
  {
    icon: Code2,
    title: "Modern Stack",
    description:
      "Built with Next.js 16, React 19, TypeScript, and TailwindCSS for optimal performance.",
  },
  {
    icon: Globe,
    title: "Accessible Design",
    description:
      "Fully responsive interface with dark/light mode and accessibility features.",
  },
];

export default function AboutPage() {
  return (
    <div className="container py-8 px-4 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">
          About <span className="gradient-text">Xandeum Analytics</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          A professional analytics platform for monitoring and analyzing Xandeum
          pNode network performance, built with passion by ATECH WEB SOLUTIONS.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="card-hover">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* About ATECH WEB SOLUTIONS */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Users className="h-6 w-6 text-violet-500" />
            Built by ATECH WEB SOLUTIONS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            ATECH WEB SOLUTIONS is a dedicated team of developers passionate
            about building innovative web applications and blockchain solutions.
            We specialize in creating high-performance, user-friendly platforms
            that make complex data accessible and actionable.
          </p>
          <p className="text-muted-foreground">
            This analytics platform was built as part of the Superteam bounty
            program to provide the Xandeum community with powerful tools for
            monitoring their pNode network. We believe in the future of
            decentralized storage and are proud to contribute to the ecosystem.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <a
              href="https://x.com/atechwebsol"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                <Twitter className="h-4 w-4" />
                Follow on X
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
            <a
              href="https://github.com/atechwebsol01/xandeum-analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                <Github className="h-4 w-4" />
                GitHub Repo
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* About Xandeum */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">About Xandeum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Xandeum is building a scalable storage layer for Solana dApps. Think
            of it as a second tier of Solana accounts that can grow to exabytes
            and beyond. This storage layer lives on its own network of storage
            provider nodes, called pNodes.
          </p>
          <p className="text-muted-foreground">
            pNodes are the backbone of the Xandeum network, providing
            decentralized storage capacity that scales with demand. This
            platform helps operators and the community monitor the health and
            performance of these critical infrastructure nodes.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <a
              href="https://xandeum.network"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-2">
                Visit Xandeum
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
            <a
              href="https://docs.xandeum.network"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                Documentation
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
            <a
              href="https://discord.gg/uqRSmmM5m"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                Join Discord
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Ready to explore?</h2>
        <p className="text-muted-foreground">
          Start monitoring the Xandeum pNode network now.
        </p>
        <Link href="/">
          <Button size="lg" className="gap-2">
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
