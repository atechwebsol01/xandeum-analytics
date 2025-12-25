import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { AIChat } from "@/components/dashboard/ai-chat";
import { PWARegister } from "@/components/pwa-register";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Xandeum Analytics | pNode Network Dashboard",
  description:
    "Professional analytics platform for Xandeum pNodes. Monitor network health, track pNode performance, and explore real-time storage metrics on Solana's scalable storage layer.",
  keywords: [
    "Xandeum",
    "pNode",
    "Analytics",
    "Solana",
    "Blockchain",
    "Storage",
    "Dashboard",
    "Network",
    "Monitoring",
    "ATECH WEB SOLUTIONS",
  ],
  authors: [{ name: "ATECH WEB SOLUTIONS" }],
  creator: "ATECH WEB SOLUTIONS",
  publisher: "ATECH WEB SOLUTIONS",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://xandeum-analytics.vercel.app"
  ),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/favicon.svg" }],
  },
  openGraph: {
    title: "Xandeum Analytics | pNode Network Dashboard",
    description:
      "Professional analytics platform for Xandeum pNodes. Monitor network health and track performance.",
    type: "website",
    locale: "en_US",
    siteName: "Xandeum Analytics",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Xandeum Analytics Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xandeum Analytics | pNode Network Dashboard",
    description:
      "Professional analytics platform for Xandeum pNodes. Monitor network health and track performance.",
    images: ["/og-image.png"],
    creator: "@atechwebsolutions",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider delayDuration={0}>
              <div className="relative min-h-screen flex">
                {/* Skip to main content link for accessibility */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none"
                >
                  Skip to main content
                </a>
                <Sidebar />
                <main id="main-content" className="flex-1 min-h-screen overflow-auto flex flex-col" tabIndex={-1}>
                  <div className="flex-1">
                    {children}
                  </div>
                  <Footer />
                </main>
              </div>
              <KeyboardShortcuts />
              <AIChat />
              <OnboardingModal />
              <PWARegister />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "hsl(var(--card))",
                    color: "hsl(var(--card-foreground))",
                    border: "1px solid hsl(var(--border))",
                  },
                }}
              />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
