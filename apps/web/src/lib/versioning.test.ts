import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const transactionMock = vi.fn();
const pageFindUniqueMock = vi.fn();
const pageUpdateMock = vi.fn();
const versionFindFirstMock = vi.fn();
const versionFindManyMock = vi.fn();
const versionFindUniqueMock = vi.fn();
const versionCreateMock = vi.fn();
const logAuditEventMock = vi.fn();
const readMarkdownFileMock = vi.fn();
const writeMarkdownFileMock = vi.fn();

vi.mock("@foundry/database", () => ({
	prisma: {
		$transaction: transactionMock,
		page: {
			findUnique: pageFindUniqueMock,
			update: pageUpdateMock,
		},
		version: {
			findFirst: versionFindFirstMock,
			findMany: versionFindManyMock,
			findUnique: versionFindUniqueMock,
			create: versionCreateMock,
		},
	},
	readMarkdownFile: readMarkdownFileMock,
	writeMarkdownFile: writeMarkdownFileMock,
}));

vi.mock("./audit", () => ({
	logAuditEvent: logAuditEventMock,
}));

describe("versioning helpers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		transactionMock.mockImplementation(
			async (callback: (tx: unknown) => Promise<unknown>) =>
				callback({
					page: { findUnique: pageFindUniqueMock, update: pageUpdateMock },
					version: {
						findFirst: versionFindFirstMock,
						findMany: versionFindManyMock,
						findUnique: versionFindUniqueMock,
						create: versionCreateMock,
					},
				}),
		);
	});

	it("creates a version when content changes", async () => {
		const { createVersion } = await import("./versioning");
		versionFindFirstMock.mockResolvedValue({ hash: "older-hash" });
		versionCreateMock.mockResolvedValue({ id: "version-1" });

		const created = await createVersion("page-1", "# Updated", "user-1");

		const expectedHash = createHash("sha256").update("# Updated").digest("hex");
		expect(versionCreateMock).toHaveBeenCalledWith({
			data: {
				pageId: "page-1",
				content: "# Updated",
				hash: expectedHash,
				createdById: "user-1",
			},
		});
		expect(logAuditEventMock).not.toHaveBeenCalled();
		expect(created).toEqual({ id: "version-1" });
	});

	it("skips duplicate versions when the hash matches the previous version", async () => {
		const { createVersion } = await import("./versioning");
		const duplicateHash = createHash("sha256")
			.update("same content")
			.digest("hex");
		versionFindFirstMock.mockResolvedValue({ hash: duplicateHash });

		await expect(
			createVersion("page-1", "same content", "user-1"),
		).resolves.toBeNull();
		expect(versionCreateMock).not.toHaveBeenCalled();
		expect(logAuditEventMock).not.toHaveBeenCalled();
	});

	it("lists versions newest first with creator details", async () => {
		const { getVersions } = await import("./versioning");
		versionFindManyMock.mockResolvedValue([{ id: "version-1" }]);

		await expect(getVersions("page-1")).resolves.toEqual([{ id: "version-1" }]);
		expect(versionFindManyMock).toHaveBeenCalledWith({
			where: { pageId: "page-1" },
			orderBy: { createdAt: "desc" },
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	});

	it("reverts to a version by backing up current content, updating page state, and writing the markdown file", async () => {
		const { revertToVersion } = await import("./versioning");
		const targetContent = "# Target content";
		const currentContent = "# Current content";
		versionFindUniqueMock.mockResolvedValue({
			id: "version-target",
			pageId: "page-1",
			content: targetContent,
		});
		pageFindUniqueMock.mockResolvedValue({
			id: "page-1",
			title: "Page",
			slug: "page",
			path: "page",
			status: "draft",
			tags: ["docs"],
			pinned: false,
			source: "human",
			contentText: currentContent,
			contentPath: "/tmp/page.md",
			updatedById: "user-2",
			updatedAt: new Date("2024-01-02T00:00:00.000Z"),
			space: { slug: "space-a" },
		});
		versionFindFirstMock
			.mockResolvedValueOnce({ hash: "different-hash" })
			.mockResolvedValueOnce({ hash: "another-hash" });
		versionCreateMock
			.mockResolvedValueOnce({ id: "backup-version" })
			.mockResolvedValueOnce({ id: "restored-version" });
		pageUpdateMock.mockResolvedValue({
			id: "page-1",
			title: "Page",
			slug: "page",
			path: "page",
			status: "draft",
			tags: ["docs"],
			pinned: false,
			source: "human",
			contentText: targetContent,
			contentPath: "/tmp/page.md",
			updatedById: "user-1",
			updatedAt: new Date("2024-01-03T00:00:00.000Z"),
			space: { slug: "space-a" },
		});

		const reverted = await revertToVersion(
			"page-1",
			"version-target",
			"user-1",
		);

		expect(versionCreateMock).toHaveBeenNthCalledWith(1, {
			data: expect.objectContaining({
				pageId: "page-1",
				content: currentContent,
				createdById: "user-1",
			}),
		});
		expect(pageUpdateMock).toHaveBeenCalledWith({
			where: { id: "page-1" },
			data: {
				contentText: targetContent,
				updatedById: "user-1",
			},
			include: { space: true },
		});
		expect(writeMarkdownFileMock).toHaveBeenCalledWith(
			"/tmp/page.md",
			expect.objectContaining({
				id: "page-1",
				title: "Page",
				space: "space-a",
				updatedBy: "user-1",
			}),
			targetContent,
		);
		expect(logAuditEventMock).toHaveBeenCalledWith({
			actorId: "user-1",
			actorType: "human",
			action: "page:revert",
			targetId: "page-1",
			targetType: "page",
			pageId: "page-1",
			metadata: {
				versionId: "version-target",
				backupVersionId: "backup-version",
			},
		});
		expect(reverted.contentText).toBe(targetContent);
	});
});
