import { beforeEach, describe, expect, it, vi } from "vitest";

const requireRoleMock = vi.fn();
const toAuthErrorResponseMock = vi.fn();
const versionFindUniqueMock = vi.fn();

vi.mock("@/lib/auth", () => ({
	requireRole: requireRoleMock,
	toAuthErrorResponse: toAuthErrorResponseMock,
}));

vi.mock("@foundry/database", () => ({
	prisma: {
		version: {
			findUnique: versionFindUniqueMock,
		},
	},
}));

describe("GET /api/versions/[id]", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		toAuthErrorResponseMock.mockReturnValue(null);
	});

	it("returns full version details for editors", async () => {
		const { GET } = await import("./route");
		versionFindUniqueMock.mockResolvedValue({
			id: "version-1",
			content: "# Doc",
		});

		const response = await GET(
			new Request("http://localhost/api/versions/version-1"),
			{
				params: Promise.resolve({ id: "version-1" }),
			},
		);

		expect(requireRoleMock).toHaveBeenCalledWith("editor");
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			id: "version-1",
			content: "# Doc",
		});
	});

	it("returns 404 when the version does not exist", async () => {
		const { GET } = await import("./route");
		versionFindUniqueMock.mockResolvedValue(null);

		const response = await GET(
			new Request("http://localhost/api/versions/missing"),
			{
				params: Promise.resolve({ id: "missing" }),
			},
		);

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ error: "Version not found" });
	});
});
