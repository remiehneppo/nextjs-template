import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev origins for testing
  allowedDevOrigins: ['*'],
  // Enable standalone output for Docker
  output: 'standalone',
};

export default nextConfig;
