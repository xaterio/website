import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for Windows compatibility
  experimental: {},
  serverExternalPackages: ['@anthropic-ai/sdk'],
};

export default nextConfig;
