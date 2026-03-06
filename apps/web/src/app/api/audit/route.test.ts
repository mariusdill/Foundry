import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthMock = vi.fn();
const toAuthErrorResponseMock = vi.fn();
const auditEventFindManyMock = vi.fn();
const auditEventCountMock = vi.fn();

vi.mock("@/lib/auth", () => ({
	requireAuth: requireAuthMock,
	toAuthErrorResponse: toAuthErrorResponseMock,
}));

vi.mock("@foundry/database", () => ({
	prisma: {
		auditEvent: {
			findMany: auditEventFindManyMock,
			count: auditEventCountMock,
		},
	},
}));

describe("GET /api/audit", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		toAuthErrorResponseMock.mockReturnValue(null);
	});

	it("returns filtered audit events with pagination metadata for admins", async () => {
		const { GET } = await import("./route");
		requireAuthMock.mockResolvedValue({ id: "admin-1", role: "admin" });
		auditEventFindManyMock.mockResolvedValue([
			{
				id: "audit-1",
				action: "page:update",
				metadata: { diff: "full" },
				actor: { id: "user-1", name: "Ada", email: "ada@example.com" },
			},
		]);
		auditEventCountMock.mockResolvedValue(1);

		const response = await GET(
			new Request(
				"http://localhost/api/audit?actor=user-1&action=page:update&targetType=page&pageId=page-1&startDate=2025-01-01T00:00:00.000Z&endDate=2025-01-31T00:00:00.000Z&limit=10&offset=5",
			),
		);

		expect(auditEventFindManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					actorId: "user-1",
					action: "page:update",
					targetType: "page",
					pageId: "page-1",
					createdAt: {
						gte: new Date("2025-01-01T00:00:00.000Z"),
						lte: new Date("2025-01-31T00:00:00.000Z"),
					},
				},
				take: 10,
				skip: 5,
			}),
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			events: [
				{
					id: "audit-1",
					action: "page:update",
					metadata: { diff: "full" },
					actor: { id: "user-1", name: "Ada", email: "ada@example.com" },
				},
			],
			pagination: {
				limit: 10,
				offset: 5,
				total: 1,
			},
		});
	});

	it("redacts sensitive metadata for non-admin users", async () => {
		const { GET } = await import("./route");
		requireAuthMock.mockResolvedValue({ id: "reader-1", role: "reader" });
		auditEventFindManyMock.mockResolvedValue([
			{
				id: "audit-2",
				targetType: "page",
				metadata: { previousContent: "secret", title: "Visible title" },
				actor: { id: "user-2", name: "Grace", email: "grace@example.com" },
			},
		]);
		auditEventCountMock.mockResolvedValue(1);

		const response = await GET(new Request("http://localhost/api/audit"));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			events: [
				{
					id: "audit-2",
					targetType: "page",
					metadata: { title: "Visible title" },
					actor: { id: "user-2", name: "Grace", email: "grace@example.com" },
				},
			],
			pagination: {
				limit: 50,
				offset: 0,
				total: 1,
			},
		});
	});
});
