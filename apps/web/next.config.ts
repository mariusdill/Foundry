import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@foundry/ui", "@foundry/shared", "@foundry/database"],
};

export default nextConfig;
