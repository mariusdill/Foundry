import { beforeEach, describe, expect, it, vi } from "vitest";

const requireRoleMock = vi.fn();
const toAuthErrorResponseMock = vi.fn();
const pageFindUniqueMock = vi.fn();
const getVersionsMock = vi.fn();

vi.mock("@/lib/auth", () => ({
	requireRole: requireRoleMock,
	toAuthErrorResponse: toAuthErrorResponseMock,
}));

vi.mock("@foundry/database", () => ({
	prisma: {
		page: {
			findUnique: pageFindUniqueMock,
		},
	},
}));

vi.mock("@/lib/versioning", () => ({
	getVersions: getVersionsMock,
}));

describe("GET /api/pages/[id]/versions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		toAuthErrorResponseMock.mockReturnValue(null);
	});

	it("returns a page's versions for editors", async () => {
		const { GET } = await import("./route");
		pageFindUniqueMock.mockResolvedValue({ id: "page-1" });
		getVersionsMock.mockResolvedValue([
			{
				id: "version-1",
				hash: "abcdef1234567890",
				createdAt: "2024-01-01T00:00:00.000Z",
				createdBy: { name: "Editor", email: "editor@example.com" },
			},
		]);

		const response = await GET(
			new Request("http://localhost/api/pages/page-1/versions"),
			{
				params: Promise.resolve({ id: "page-1" }),
			},
		);

		expect(requireRoleMock).toHaveBeenCalledWith("editor");
		expect(getVersionsMock).toHaveBeenCalledWith("page-1");
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([
			{
				id: "version-1",
				createdAt: "2024-01-01T00:00:00.000Z",
				createdBy: "Editor",
				hashPreview: "abcdef123456",
			},
		]);
	});

	it("returns 404 when the page does not exist", async () => {
		const { GET } = await import("./route");
		pageFindUniqueMock.mockResolvedValue(null);

		const response = await GET(
			new Request("http://localhost/api/pages/missing/versions"),
			{
				params: Promise.resolve({ id: "missing" }),
			},
		);

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ error: "Page not found" });
	});
});
