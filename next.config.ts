import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xandeum.network",
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=30, stale-while-revalidate=59",
          },
        ],
      },
    ];
  },

  // Redirect www to non-www
  async redirects() {
    return [];
  },

  // Rewrites to proxy external APIs (bypasses CORS and mixed content)
  async rewrites() {
    return [
      // Proxy pRPC requests to avoid mixed content/CORS
      {
        source: "/proxy/prpc/:path*",
        destination: "http://192.190.136.28:6000/:path*",
      },
      // Proxy pod credits API to avoid CORS
      {
        source: "/proxy/credits",
        destination: "https://podcredits.xandeum.network/api/pods-credits",
      },
    ];
  },
};

export default nextConfig;
