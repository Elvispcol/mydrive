import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Prevent webpack from resolving junctions to real paths.
    // The project path contains '#' which webpack treats as a URL fragment,
    // corrupting module resolution. Running from C:\mydrive-dev (junction)
    // keeps webpack paths clean.
    config.resolve = config.resolve ?? {};
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
