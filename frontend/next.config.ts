import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack vacío para silenciar el warning en Next.js 16 build
  // (webpack config solo aplica en dev con --webpack flag)
  turbopack: {},
  webpack: (config) => {
    // Prevent webpack from following junctions to real paths.
    // The project path contains '#' which webpack treats as URL fragment —
    // resolve.symlinks:false keeps paths clean when running from C:\mydrive\frontend.
    config.resolve = config.resolve ?? {};
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
