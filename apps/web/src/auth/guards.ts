const PUBLIC_PATH_PREFIXES = ["/_next", "/favicon.ico"] as const;
const AUTH_EXEMPT_PATHS = new Set(["/login"]);
const ROLE_ORDER = {
	reader: 0,
	editor: 1,
	admin: 2,
} as const;

export type AppRole = keyof typeof ROLE_ORDER;

export function isAuthenticationExemptPathname(pathname: string) {
	return (
		AUTH_EXEMPT_PATHS.has(pathname) ||
		pathname.startsWith("/api/auth") ||
		PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
	);
}

export function isProtectedApiPathname(pathname: string) {
	return pathname.startsWith("/api/") && !pathname.startsWith("/api/auth");
}

export function isProtectedUiPathname(pathname: string) {
	if (pathname.startsWith("/api/")) {
		return false;
	}

	return !isAuthenticationExemptPathname(pathname);
}

export function isAdminPathname(pathname: string) {
	return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

export function hasRequiredRole(
	currentRole: AppRole | undefined,
	requiredRole: AppRole,
) {
	if (!currentRole) {
		return false;
	}

	return ROLE_ORDER[currentRole] >= ROLE_ORDER[requiredRole];
}

export function buildLoginRedirect(url: string) {
	const requestUrl = new URL(url);
	const redirectUrl = new URL("/login", requestUrl.origin);
	const callbackUrl = `${requestUrl.pathname}${requestUrl.search}`;

	redirectUrl.searchParams.set("callbackUrl", callbackUrl || "/");

	return redirectUrl.toString();
}
