import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import {
	buildLoginRedirect,
	hasRequiredRole,
	isAdminPathname,
	isProtectedApiPathname,
	isProtectedUiPathname,
} from "@/auth/guards";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
	const pathname = request.nextUrl.pathname;
	const isAuthenticated = Boolean(request.auth?.user);

	if (pathname === "/login" && isAuthenticated) {
		return NextResponse.redirect(new URL("/", request.nextUrl));
	}

	if (!isAuthenticated && isProtectedApiPathname(pathname)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!isAuthenticated && isProtectedUiPathname(pathname)) {
		return NextResponse.redirect(
			buildLoginRedirect(request.nextUrl.toString()),
		);
	}

	if (
		isAdminPathname(pathname) &&
		!hasRequiredRole(request.auth?.user?.role, "admin")
	) {
		if (isProtectedApiPathname(pathname)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		return NextResponse.redirect(new URL("/", request.nextUrl));
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
	],
};
