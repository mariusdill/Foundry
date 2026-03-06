import { beforeEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.fn();
const authMock = vi.fn();
const findUserMock = vi.fn();
const findTokenUserMock = vi.fn();

vi.mock("next/headers", () => ({
	headers: headersMock,
}));

vi.mock("@/auth", () => ({
	auth: authMock,
}));

vi.mock("@/auth/guards", () => ({
	hasRequiredRole: (currentRole: string | undefined, requiredRole: string) => {
		const roleOrder = { reader: 0, editor: 1, admin: 2 } as const;
		if (!currentRole) {
			return false;
		}

		return (
			roleOrder[currentRole as keyof typeof roleOrder] >=
			roleOrder[requiredRole as keyof typeof roleOrder]
		);
	},
}));

vi.mock("@foundry/database", () => ({
	prisma: {
		user: {
			findUnique: findUserMock,
		},
		apiToken: {
			findFirst: findTokenUserMock,
		},
	},
	UserRole: {
		admin: "admin",
		editor: "editor",
		reader: "reader",
	},
}));

describe("auth utilities", () => {
	beforeEach(() => {
		headersMock.mockResolvedValue(new Headers());
		authMock.mockResolvedValue(null);
		findUserMock.mockResolvedValue(null);
		findTokenUserMock.mockResolvedValue(null);
		vi.resetModules();
	});

	it("returns null when no session or api token is present", async () => {
		const { getCurrentUser } = await import("./auth");

		await expect(getCurrentUser()).resolves.toBeNull();
	});

	it("loads the current user from the NextAuth session user id", async () => {
		const user = {
			id: "user-1",
			email: "reader@example.com",
			name: "Reader",
			passwordHash: null,
			role: "reader",
			createdAt: new Date("2024-01-01T00:00:00.000Z"),
			updatedAt: new Date("2024-01-01T00:00:00.000Z"),
		};

		authMock.mockResolvedValue({ user: { id: user.id } });
		findUserMock.mockResolvedValue(user);

		const { getCurrentUser } = await import("./auth");

		await expect(getCurrentUser()).resolves.toEqual(user);
		expect(findUserMock).toHaveBeenCalledWith({
			where: { id: user.id },
		});
	});

	it("rejects unauthenticated access with a 401 response", async () => {
		const { requireAuth, toAuthErrorResponse } = await import("./auth");

		await expect(requireAuth()).rejects.toMatchObject({
			message: "Unauthorized",
			status: 401,
		});

		const response = toAuthErrorResponse(
			await requireAuth().catch((error: unknown) => error),
		);

		expect(response?.status).toBe(401);
		expect(await response?.json()).toEqual({ error: "Unauthorized" });
	});

	it("allows admins to satisfy editor requirements", async () => {
		const adminUser = {
			id: "admin-1",
			email: "admin@example.com",
			name: "Admin",
			passwordHash: null,
			role: "admin",
			createdAt: new Date("2024-01-01T00:00:00.000Z"),
			updatedAt: new Date("2024-01-01T00:00:00.000Z"),
		};

		authMock.mockResolvedValue({ user: { id: adminUser.id } });
		findUserMock.mockResolvedValue(adminUser);

		const { requireRole } = await import("./auth");

		await expect(requireRole("editor")).resolves.toEqual(adminUser);
	});

	it("rejects readers from editor-only routes with a 403 response", async () => {
		const readerUser = {
			id: "reader-1",
			email: "reader@example.com",
			name: "Reader",
			passwordHash: null,
			role: "reader",
			createdAt: new Date("2024-01-01T00:00:00.000Z"),
			updatedAt: new Date("2024-01-01T00:00:00.000Z"),
		};

		authMock.mockResolvedValue({ user: { id: readerUser.id } });
		findUserMock.mockResolvedValue(readerUser);

		const { requireRole, requireAdmin, toAuthErrorResponse } = await import(
			"./auth"
		);

		const editorError = await requireRole("editor").catch(
			(error: unknown) => error,
		);
		const adminError = await requireAdmin().catch((error: unknown) => error);

		expect(editorError).toMatchObject({ message: "Forbidden", status: 403 });
		expect(adminError).toMatchObject({ message: "Forbidden", status: 403 });
		expect(await toAuthErrorResponse(editorError)?.json()).toEqual({
			error: "Forbidden",
		});
		expect(await toAuthErrorResponse(adminError)?.json()).toEqual({
			error: "Forbidden",
		});
	});
});
