import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@foundry/ui", "@foundry/shared", "@foundry/database"],
	output: "standalone",
};

export default nextConfig;

const nextConfig: NextConfig = {
	output: "standalone",
	transpilePackages: ["@foundry/ui", "@foundry/shared", "@foundry/database"],
};

export default nextConfig;
