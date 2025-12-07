import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel automatically handles Next.js deployment
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
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://maydaysaxonvale.co.uk",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://maydaysaxonvale.co.uk https://*.maydaysaxonvale.co.uk",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
