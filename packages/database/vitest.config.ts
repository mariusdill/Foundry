import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "vitest/config";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Set default DATABASE_URL if not provided
process.env.DATABASE_URL ??=
	"postgresql://foundry:foundry@localhost:5432/foundry?schema=public";

export default defineConfig({
	test: {
		include: ["src/__tests__/**/*.test.ts"],
		environment: "node",
		globals: true,
	},
	resolve: {
		alias: {
			"@foundry/database": path.resolve(__dirname, "./src"),
			"@foundry/shared": path.resolve(__dirname, "../shared/src"),
		},
	},
});
