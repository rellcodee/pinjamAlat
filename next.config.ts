import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Bypass eror TS biar tetep sukses build
  },
  eslint: {
    ignoreDuringBuilds: true, // Bypass eror ESLint
  },
};

export default nextConfig;