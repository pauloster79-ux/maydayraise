import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel automatically handles Next.js deployment
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://maydaysaxonvale.co.uk",
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
