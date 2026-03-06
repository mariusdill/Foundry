import type { User } from "@foundry/database";
import { prisma, UserRole } from "@foundry/database";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasRequiredRole } from "@/auth/guards";

type UserRoleValue = NonNullable<User["role"]>;

class AuthError extends Error {
	constructor(
		readonly status: 401 | 403,
		message: "Unauthorized" | "Forbidden",
	) {
		super(message);
		this.name = "AuthError";
		Object.setPrototypeOf(this, AuthError.prototype);
	}
}

function unauthorized(): never {
	throw new AuthError(401, "Unauthorized");
}

function forbidden(): never {
	throw new AuthError(403, "Forbidden");
}

function getBearerToken(requestHeaders: Headers): string | null {
	const authorization = requestHeaders.get("authorization");
	if (!authorization?.startsWith("Bearer ")) {
		return null;
	}

	const token = authorization.slice("Bearer ".length).trim();
	return token.length > 0 ? token : null;
}

async function getUserFromApiToken(
	requestHeaders: Headers,
): Promise<User | null> {
	const bearerToken = getBearerToken(requestHeaders);
	if (!bearerToken) {
		return null;
	}

	void bearerToken;
	return null;
}

async function getUserFromSession(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_requestHeaders: Headers,
): Promise<User | null> {
	const session = await auth();
	if (!session?.user?.id) {
		return null;
	}

	return prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function getCurrentUser(): Promise<User | null> {
	const requestHeaders = await headers();

	const apiTokenUser = await getUserFromApiToken(requestHeaders);
	if (apiTokenUser) {
		return apiTokenUser;
	}

	return getUserFromSession(requestHeaders);
}

export async function requireAuth(): Promise<User> {
	const user = await getCurrentUser();
	if (!user) {
		unauthorized();
	}

	return user;
}

export async function requireRole(role: UserRoleValue): Promise<User> {
	const user = await requireAuth();
	if (!hasRequiredRole(user.role ?? undefined, role)) {
		forbidden();
	}

	return user;
}

export async function requireAdmin(): Promise<User> {
	return requireRole(UserRole.admin);
}

export function isAuthError(error: unknown): error is AuthError {
	return error instanceof AuthError;
}

export function toAuthErrorResponse(error: unknown): NextResponse | null {
	if (!isAuthError(error)) {
		return null;
	}

	return NextResponse.json({ error: error.message }, { status: error.status });
}
