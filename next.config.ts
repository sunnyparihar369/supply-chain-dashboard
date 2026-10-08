import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't walk up to the home directory
  // (which holds an unrelated package-lock.json) when inferring it.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
