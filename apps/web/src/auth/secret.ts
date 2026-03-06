const DEVELOPMENT_AUTH_SECRET = "foundry-local-development-only-auth-secret";

let hasWarnedAboutDevelopmentSecret = false;

export function resolveAuthSecret() {
	const configuredSecret =
		process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

	if (configuredSecret) {
		return configuredSecret;
	}

	if (process.env.NODE_ENV === "development" && process.env.CI !== "true") {
		if (!hasWarnedAboutDevelopmentSecret) {
			console.warn(
				"AUTH_SECRET is not set; using a local development fallback secret.",
			);
			hasWarnedAboutDevelopmentSecret = true;
		}

		return DEVELOPMENT_AUTH_SECRET;
	}

	throw new Error("AUTH_SECRET is required outside local development.");
}
