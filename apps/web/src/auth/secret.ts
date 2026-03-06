const DEVELOPMENT_AUTH_SECRET = "foundry-local-development-only-auth-secret";

let hasWarnedAboutDevelopmentSecret = false;

export function resolveAuthSecret() {
	const configuredSecret =
		process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

	if (configuredSecret) {
		return configuredSecret;
	}

	// Edge runtime (middleware) doesn't have NODE_ENV, so we need to be more lenient
	// Only throw if explicitly in production/CI environment
	if (process.env.CI === "true" || process.env.NODE_ENV === "production") {
		throw new Error("AUTH_SECRET is required in production/CI environment.");
	}
	// Only throw if explicitly in production environment
	if (process.env.NODE_ENV === "production") {
		throw new Error("AUTH_SECRET is required in production environment.");
	}
	// Only throw if explicitly in production/CI environment
	if (process.env.CI === "true" || process.env.NODE_ENV === "production") {
		throw new Error("AUTH_SECRET is required in production/CI environment.");
	}

	// For development or when NODE_ENV is undefined (edge runtime), use fallback
	if (!hasWarnedAboutDevelopmentSecret) {
		console.warn(
			"AUTH_SECRET is not set; using a local development fallback secret.",
		);
		hasWarnedAboutDevelopmentSecret = true;
	}

	return DEVELOPMENT_AUTH_SECRET;
}
