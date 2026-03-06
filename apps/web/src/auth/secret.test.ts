import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("resolveAuthSecret", () => {
	beforeEach(() => {
		vi.spyOn(console, "warn").mockImplementation(() => undefined);
	});

	afterEach(() => {
		process.env = { ...ORIGINAL_ENV };
		vi.restoreAllMocks();
		vi.resetModules();
	});

	function setNodeEnv(value: string) {
		Object.assign(process.env, { NODE_ENV: value });
	}

	it("uses AUTH_SECRET when configured", async () => {
		process.env.AUTH_SECRET = "configured-auth-secret";
		delete process.env.NEXTAUTH_SECRET;
		setNodeEnv("development");

		const { resolveAuthSecret } = await import("./secret");

		expect(resolveAuthSecret()).toBe("configured-auth-secret");
	});

	it("falls back to NEXTAUTH_SECRET when AUTH_SECRET is absent", async () => {
		delete process.env.AUTH_SECRET;
		process.env.NEXTAUTH_SECRET = "nextauth-secret";
		setNodeEnv("development");

		const { resolveAuthSecret } = await import("./secret");

		expect(resolveAuthSecret()).toBe("nextauth-secret");
	});

	it("uses a local development fallback when no secret is configured", async () => {
		delete process.env.AUTH_SECRET;
		delete process.env.NEXTAUTH_SECRET;
		delete process.env.CI;
		setNodeEnv("development");

		const { resolveAuthSecret } = await import("./secret");

		expect(resolveAuthSecret()).toBe(
			"foundry-local-development-only-auth-secret",
		);
		expect(resolveAuthSecret()).toBe(resolveAuthSecret());
		expect(console.warn).toHaveBeenCalledTimes(1);
	});

	it("throws in production when no secret is configured", async () => {
		delete process.env.AUTH_SECRET;
		delete process.env.NEXTAUTH_SECRET;
		setNodeEnv("production");

		const { resolveAuthSecret } = await import("./secret");

		expect(() => resolveAuthSecret()).toThrow(
			"AUTH_SECRET is required outside local development.",
		);
	});

	it("throws in CI even during development when no secret is configured", async () => {
		delete process.env.AUTH_SECRET;
		delete process.env.NEXTAUTH_SECRET;
		process.env.CI = "true";
		setNodeEnv("development");

		const { resolveAuthSecret } = await import("./secret");

		expect(() => resolveAuthSecret()).toThrow(
			"AUTH_SECRET is required outside local development.",
		);
	});
});
