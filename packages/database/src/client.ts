import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
	pool?: Pool;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is required to initialize Prisma.");
}

const pool =
	globalForPrisma.pool ??
	new Pool({
		connectionString,
		max: process.env.NODE_ENV === "development" ? 5 : 10,
	});

const adapter = new PrismaPg(pool);

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.pool = pool;
	globalForPrisma.prisma = prisma;
}
