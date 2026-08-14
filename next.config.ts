import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // sharp and tesseract.js must not be bundled by Next.js
  serverExternalPackages: ["sharp", "tesseract.js"],
  // Turbopack config (Next.js 16 default)
  turbopack: {},
};

export default nextConfig;
