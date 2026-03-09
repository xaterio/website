import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for Windows compatibility
  experimental: {},
  serverExternalPackages: ['@anthropic-ai/sdk'],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://alexwebdesign.pro/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
