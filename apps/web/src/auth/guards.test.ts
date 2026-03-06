import { describe, expect, it } from "vitest";

import {
	buildLoginRedirect,
	hasRequiredRole,
	isAdminPathname,
	isAuthenticationExemptPathname,
	isProtectedApiPathname,
	isProtectedUiPathname,
} from "./guards";

describe("auth guards", () => {
	it("treats auth endpoints and login as exempt", () => {
		expect(isAuthenticationExemptPathname("/login")).toBe(true);
		expect(isAuthenticationExemptPathname("/api/auth/session")).toBe(true);
		expect(isAuthenticationExemptPathname("/_next/static/chunk.js")).toBe(true);
		expect(isAuthenticationExemptPathname("/api/spaces")).toBe(false);
	});

	it("protects application pages and api routes", () => {
		expect(isProtectedUiPathname("/")).toBe(true);
		expect(isProtectedUiPathname("/spaces/alpha")).toBe(true);
		expect(isProtectedUiPathname("/login")).toBe(false);
		expect(isProtectedApiPathname("/api/spaces")).toBe(true);
		expect(isProtectedApiPathname("/api/auth/session")).toBe(false);
	});

	it("marks admin namespaces as admin-only", () => {
		expect(isAdminPathname("/api/admin/users")).toBe(true);
		expect(isAdminPathname("/admin/settings")).toBe(true);
		expect(isAdminPathname("/spaces/alpha")).toBe(false);
	});

	it("applies hierarchical role checks", () => {
		expect(hasRequiredRole("admin", "admin")).toBe(true);
		expect(hasRequiredRole("admin", "editor")).toBe(true);
		expect(hasRequiredRole("editor", "reader")).toBe(true);
		expect(hasRequiredRole("reader", "editor")).toBe(false);
		expect(hasRequiredRole(undefined, "reader")).toBe(false);
	});

	it("builds login redirects with callback urls", () => {
		expect(
			buildLoginRedirect("http://localhost:3000/api/spaces?view=all"),
		).toBe(
			"http://localhost:3000/login?callbackUrl=%2Fapi%2Fspaces%3Fview%3Dall",
		);
	});
});
