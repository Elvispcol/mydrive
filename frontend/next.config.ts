import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
