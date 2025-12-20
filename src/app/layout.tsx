import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
  ],
  authors: [{ name: "Xandeum Analytics" }],
  openGraph: {
    title: "Xandeum Analytics | pNode Network Dashboard",
    description:
      "Professional analytics platform for Xandeum pNodes. Monitor network health and track performance.",
    type: "website",
    locale: "en_US",
    siteName: "Xandeum Analytics",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xandeum Analytics | pNode Network Dashboard",
    description:
      "Professional analytics platform for Xandeum pNodes. Monitor network health and track performance.",
  },
  robots: {
    index: true,
    follow: true,
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
              <div className="relative min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
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
