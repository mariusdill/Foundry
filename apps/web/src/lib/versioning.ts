import { createHash } from "node:crypto";
import { prisma, writeMarkdownFile } from "@foundry/database";
import { NextResponse } from "next/server";

type VersioningClient = {
	version: {
		findFirst: typeof prisma.version.findFirst;
		findMany: typeof prisma.version.findMany;
		findUnique: typeof prisma.version.findUnique;
		create: typeof prisma.version.create;
	};
	page: {
		findUnique: typeof prisma.page.findUnique;
		update: typeof prisma.page.update;
	};
	auditEvent: {
		create: typeof prisma.auditEvent.create;
	};
};

class VersioningError extends Error {
	constructor(
		readonly status: 400 | 404,
		message: "Page not found" | "Version not found",
	) {
		super(message);
		this.name = "VersioningError";
		Object.setPrototypeOf(this, VersioningError.prototype);
	}
}

function hashContent(content: string) {
	return createHash("sha256").update(content).digest("hex");
}

function notFound(message: "Page not found" | "Version not found"): never {
	throw new VersioningError(404, message);
}

async function createVersionWithClient(
	client: VersioningClient,
	pageId: string,
	content: string,
	userId: string,
) {
	const hash = hashContent(content);
	const previousVersion = await client.version.findFirst({
		where: { pageId },
		orderBy: { createdAt: "desc" },
		select: { hash: true },
	});

	if (previousVersion?.hash === hash) {
		return null;
	}

	const version = await client.version.create({
		data: {
			pageId,
			content,
			hash,
			createdById: userId,
		},
	});

	await client.auditEvent.create({
		data: {
			actorId: userId,
			actorType: "human",
			action: "page.version.created",
			targetId: version.id,
			targetType: "version",
			scope: "page",
			pageId,
			metadata: { hash },
		},
	});

	return version;
}

export async function createVersion(
	pageId: string,
	content: string,
	userId: string,
) {
	return createVersionWithClient(
		prisma as VersioningClient,
		pageId,
		content,
		userId,
	);
}

export async function getVersions(pageId: string) {
	return prisma.version.findMany({
		where: { pageId },
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
}

export async function revertToVersion(
	pageId: string,
	versionId: string,
	userId: string,
) {
	const { restoredContent, updatedPage, backupVersionId } =
		await prisma.$transaction(async (tx) => {
			const targetVersion = await tx.version.findUnique({
				where: { id: versionId },
			});

			if (!targetVersion || targetVersion.pageId !== pageId) {
				notFound("Version not found");
			}

			const page = await tx.page.findUnique({
				where: { id: pageId },
				include: { space: true },
			});

			if (!page) {
				notFound("Page not found");
			}

			const backupVersion = await createVersionWithClient(
				tx as VersioningClient,
				pageId,
				page.contentText,
				userId,
			);

			const updatedPage = await tx.page.update({
				where: { id: pageId },
				data: {
					contentText: targetVersion.content,
					updatedById: userId,
				},
				include: { space: true },
			});

			await tx.auditEvent.create({
				data: {
					actorId: userId,
					actorType: "human",
					action: "page.reverted",
					targetId: pageId,
					targetType: "page",
					scope: "page",
					pageId,
					metadata: {
						versionId,
						backupVersionId: backupVersion?.id ?? null,
					},
				},
			});

			return {
				restoredContent: targetVersion.content,
				updatedPage,
				backupVersionId: backupVersion?.id ?? null,
			};
		});

	void backupVersionId;

	await writeMarkdownFile(
		updatedPage.contentPath,
		{
			id: updatedPage.id,
			title: updatedPage.title,
			slug: updatedPage.slug,
			space: updatedPage.space.slug,
			path: updatedPage.path,
			status: updatedPage.status,
			tags: updatedPage.tags,
			updatedBy: updatedPage.updatedById ?? userId,
			updatedAt: updatedPage.updatedAt.toISOString(),
			source: updatedPage.source,
			pinned: updatedPage.pinned,
		},
		restoredContent,
	);

	return updatedPage;
}

export function isVersioningError(error: unknown): error is VersioningError {
	return error instanceof VersioningError;
}

export function toVersioningErrorResponse(error: unknown) {
	if (!isVersioningError(error)) {
		return null;
	}

	return NextResponse.json({ error: error.message }, { status: error.status });
}
