import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	...(process.env.NODE_ENV === "production"
		? { output: "standalone" as const }
		: {}),
	transpilePackages: ["@foundry/ui", "@foundry/shared"],
	serverExternalPackages: ["@prisma/client", ".prisma/client", "prisma"],
};

export default nextConfig;
