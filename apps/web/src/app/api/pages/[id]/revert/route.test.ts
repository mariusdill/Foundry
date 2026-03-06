import { beforeEach, describe, expect, it, vi } from "vitest";

const requireRoleMock = vi.fn();
const toAuthErrorResponseMock = vi.fn();
const revertToVersionMock = vi.fn();

vi.mock("@/lib/auth", () => ({
	requireRole: requireRoleMock,
	toAuthErrorResponse: toAuthErrorResponseMock,
}));

vi.mock("@/lib/versioning", () => ({
	revertToVersion: revertToVersionMock,
}));

describe("POST /api/pages/[id]/revert", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		toAuthErrorResponseMock.mockReturnValue(null);
	});

	it("reverts a page to the requested version for editors", async () => {
		const { POST } = await import("./route");
		requireRoleMock.mockResolvedValue({ id: "user-1" });
		revertToVersionMock.mockResolvedValue({
			id: "page-1",
			contentText: "# Restored",
		});

		const response = await POST(
			new Request("http://localhost/api/pages/page-1/revert", {
				method: "POST",
				body: JSON.stringify({
					versionId: "550e8400-e29b-41d4-a716-446655440000",
				}),
				headers: { "content-type": "application/json" },
			}),
			{ params: Promise.resolve({ id: "page-1" }) },
		);

		expect(requireRoleMock).toHaveBeenCalledWith("editor");
		expect(revertToVersionMock).toHaveBeenCalledWith(
			"page-1",
			"550e8400-e29b-41d4-a716-446655440000",
			"user-1",
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			id: "page-1",
			contentText: "# Restored",
		});
	});

	it("returns 400 when the body is invalid", async () => {
		const { POST } = await import("./route");
		requireRoleMock.mockResolvedValue({ id: "user-1" });

		const response = await POST(
			new Request("http://localhost/api/pages/page-1/revert", {
				method: "POST",
				body: JSON.stringify({ versionId: "not-a-uuid" }),
				headers: { "content-type": "application/json" },
			}),
			{ params: Promise.resolve({ id: "page-1" }) },
		);

		expect(response.status).toBe(400);
		expect(revertToVersionMock).not.toHaveBeenCalled();
	});
});
