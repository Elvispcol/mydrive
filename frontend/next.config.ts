import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
