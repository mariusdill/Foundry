import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
	pool?: Pool;
};

function getConnectionString() {
	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error("DATABASE_URL is required to initialize Prisma.");
	}

	return connectionString;
}

function getPool() {
	globalForPrisma.pool ??= new Pool({
		connectionString: getConnectionString(),
		max: process.env.NODE_ENV === "development" ? 5 : 10,
	});

	return globalForPrisma.pool;
}

function getPrismaClient() {
	globalForPrisma.prisma ??= new PrismaClient({
		adapter: new PrismaPg(getPool()),
		log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
	});

	return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
	get(_target, property, receiver): unknown {
		const client = getPrismaClient();
		const value: unknown = Reflect.get(client as object, property, receiver);

		if (typeof value === "function") {
			return value.bind(client);
		}

		return value;
	},
	set(_target, property, value, receiver): boolean {
		return Reflect.set(getPrismaClient(), property, value, receiver);
	},
});
