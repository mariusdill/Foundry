import { beforeEach, describe, expect, it, vi } from "vitest";

const auditEventCreateMock = vi.fn();

vi.mock("@foundry/database", () => ({
	prisma: {
		auditEvent: {
			create: auditEventCreateMock,
		},
	},
}));

describe("logAuditEvent", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates an audit event with the provided fields", async () => {
		const { logAuditEvent } = await import("./audit");
		auditEventCreateMock.mockResolvedValue({ id: "audit-1" });

		await logAuditEvent({
			actorId: "user-1",
			actorType: "human",
			action: "page:create",
			targetId: "page-1",
			targetType: "page",
			scope: "write:drafts",
			metadata: { title: "Page title" },
			pageId: "page-1",
		});

		expect(auditEventCreateMock).toHaveBeenCalledWith({
			data: {
				actorId: "user-1",
				actorType: "human",
				action: "page:create",
				targetId: "page-1",
				targetType: "page",
				scope: "write:drafts",
				metadata: { title: "Page title" },
				pageId: "page-1",
			},
		});
	});
});
