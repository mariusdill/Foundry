import "dotenv/config";

import { defineConfig } from "prisma/config";

const databaseUrl =
	process.env.DATABASE_URL ??
	"postgresql://foundry:foundry@localhost:5432/foundry?schema=public";

export default defineConfig({
	schema: "./prisma/schema.prisma",
	datasource: {
		url: databaseUrl,
	},
});
