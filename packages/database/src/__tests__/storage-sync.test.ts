import { randomUUID } from "node:crypto";
import { access, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../client";
import { PageSource, PageStatus } from "../generated/prisma/enums";
import {
	readMarkdownFile,
	resolvePageFilePath,
	writeMarkdownFile,
} from "../markdown";

describe("Dual-Storage Integration", () => {
	const testSpaceSlug = `test-space-${randomUUID().slice(0, 8)}`;
	const testDataDir = join("/tmp", `foundry-test-${randomUUID().slice(0, 8)}`);
	let spaceId: string;
	let pageId: string;

	beforeAll(async () => {
		// Create test data directory
		await mkdir(testDataDir, { recursive: true });

		// Create test space in DB
		const space = await prisma.space.create({
			data: {
				name: "Test Space",
				slug: testSpaceSlug,
				icon: "📁",
				kind: "projects",
				rootFolder: testDataDir,
			},
		});
		spaceId = space.id;
	});

	afterAll(async () => {
		// Clean up test data directory
		await rm(testDataDir, { recursive: true, force: true });

		// Clean up DB - delete pages first, then space
		await prisma.page.deleteMany({
			where: { spaceId },
		});
		await prisma.space.delete({
			where: { id: spaceId },
		});

		await prisma.$disconnect();
	});

	describe("Page Creation", () => {
		it("should create both DB record and markdown file", async () => {
			const pagePath = "test-page.md";
			const filePath = resolvePageFilePath(
				testDataDir,
				"projects",
				testSpaceSlug,
				pagePath,
			);

			const page = await prisma.page.create({
				data: {
					spaceId,
					title: "Test Page",
					slug: "test-page",
					path: pagePath,
					contentPath: filePath,
					contentText: "This is test content",
					status: PageStatus.stable,
					source: PageSource.human,
					pinned: false,
				},
			});
			pageId = page.id;

			// Write markdown file with complete frontmatter
			await writeMarkdownFile(
				filePath,
				{
					id: page.id,
					title: "Test Page",
					slug: "test-page",
					space: testSpaceSlug,
					path: pagePath,
					status: PageStatus.stable,
					tags: [],
					updatedBy: "test-user",
					updatedAt: new Date().toISOString(),
					source: PageSource.human,
					pinned: false,
				},
				"# Test Page\n\nThis is test content.",
			);

			// Verify DB record exists
			const dbPage = await prisma.page.findUnique({
				where: { id: pageId },
			});
			expect(dbPage).not.toBeNull();
			expect(dbPage?.title).toBe("Test Page");

			// Verify markdown file exists
			await expect(access(filePath)).resolves.not.toThrow();

			// Verify markdown file content
			const { frontmatter, markdown } = await readMarkdownFile(filePath);
			expect(frontmatter.title).toBe("Test Page");
			expect(markdown).toContain("Test Page");
		});

		it("should handle DB creation without file operation", async () => {
			// This test verifies DB-only creation works
			const page = await prisma.page.create({
				data: {
					spaceId,
					title: "DB Only Test",
					slug: "db-only-test",
					path: "db-only.md",
					contentPath: "/tmp/db-only.md",
					contentText: "Content without file",
					status: PageStatus.draft,
					source: PageSource.human,
					pinned: false,
				},
			});

			const dbPage = await prisma.page.findUnique({
				where: { id: page.id },
			});

			expect(dbPage).not.toBeNull();
			expect(dbPage?.title).toBe("DB Only Test");

			// Clean up
			await prisma.page.delete({ where: { id: page.id } });
		});
	});

	describe("Page Update", () => {
		it("should update both DB and markdown file", async () => {
			expect(pageId).toBeDefined();

			// Update DB record
			await prisma.page.update({
				where: { id: pageId },
				data: {
					title: "Updated Page Title",
					contentText: "Updated content text",
				},
			});

			const filePath = resolvePageFilePath(
				testDataDir,
				"projects",
				testSpaceSlug,
				"test-page.md",
			);

			// Update markdown file with complete frontmatter
			await writeMarkdownFile(
				filePath,
				{
					id: pageId,
					title: "Updated Page Title",
					slug: "test-page",
					space: testSpaceSlug,
					path: "test-page.md",
					status: PageStatus.stable,
					tags: [],
					updatedBy: "test-user",
					updatedAt: new Date().toISOString(),
					source: PageSource.human,
					pinned: false,
				},
				"# Updated Page Title\n\nUpdated content text.",
			);

			// Verify DB was updated
			const dbPage = await prisma.page.findUnique({
				where: { id: pageId },
			});
			expect(dbPage?.title).toBe("Updated Page Title");
			expect(dbPage?.contentText).toBe("Updated content text");

			// Verify markdown file was updated
			const { frontmatter, markdown } = await readMarkdownFile(filePath);
			expect(frontmatter.title).toBe("Updated Page Title");
			expect(markdown).toContain("Updated content text");
		});
	});

	describe("Page Deletion", () => {
		let deletePageId: string;
		let deleteFilePath: string;

		beforeEach(async () => {
			// Create a page to delete
			const pagePath = "delete-test.md";
			deleteFilePath = resolvePageFilePath(
				testDataDir,
				"projects",
				testSpaceSlug,
				pagePath,
			);

			const page = await prisma.page.create({
				data: {
					spaceId,
					title: "Delete Test",
					slug: "delete-test",
					path: pagePath,
					contentPath: deleteFilePath,
					contentText: "Content to be deleted",
					status: PageStatus.stable,
					source: PageSource.human,
					pinned: false,
				},
			});
			deletePageId = page.id;

			// Create the markdown file with complete frontmatter
			await writeMarkdownFile(
				deleteFilePath,
				{
					id: page.id,
					title: "Delete Test",
					slug: "delete-test",
					space: testSpaceSlug,
					path: pagePath,
					status: PageStatus.stable,
					tags: [],
					updatedBy: "test-user",
					updatedAt: new Date().toISOString(),
					source: PageSource.human,
					pinned: false,
				},
				"# Delete Test\n\nContent to be deleted.",
			);
		});

		it("should delete both DB record and markdown file", async () => {
			expect(deletePageId).toBeDefined();
			expect(deleteFilePath).toBeDefined();

			// Verify file exists before deletion
			await expect(access(deleteFilePath)).resolves.not.toThrow();

			// Delete DB record
			await prisma.page.delete({
				where: { id: deletePageId },
			});

			// Delete markdown file
			await rm(deleteFilePath);

			// Verify DB record is deleted
			const dbPage = await prisma.page.findUnique({
				where: { id: deletePageId },
			});
			expect(dbPage).toBeNull();

			// Verify markdown file is deleted
			await expect(access(deleteFilePath)).rejects.toThrow();
		});
	});

	describe("Error Handling", () => {
		it("should handle file read errors gracefully", async () => {
			const nonexistentFilePath = join(testDataDir, "nonexistent", "file.md");

			await expect(readMarkdownFile(nonexistentFilePath)).rejects.toThrow();
		});

		it("should verify sync between DB and filesystem", async () => {
			expect(pageId).toBeDefined();

			const filePath = resolvePageFilePath(
				testDataDir,
				"projects",
				testSpaceSlug,
				"test-page.md",
			);

			// Get DB record
			const dbPage = await prisma.page.findUnique({
				where: { id: pageId },
			});

			// Get file content
			const { frontmatter, markdown } = await readMarkdownFile(filePath);

			// Verify sync
			expect(dbPage?.title).toBe(frontmatter.title);
			expect(markdown).toContain(dbPage?.contentText ?? "");
		});
	});
});
