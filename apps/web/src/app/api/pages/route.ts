import {
	prisma,
	resolvePageFilePath,
	writeMarkdownFile,
} from "@foundry/database";
import { createPageSchema } from "@foundry/shared";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const spaceId = searchParams.get("spaceId");

		const where = spaceId ? { spaceId } : {};

		const pages = await prisma.page.findMany({
			where,
			orderBy: { updatedAt: "desc" },
			include: { space: true },
		});

		return NextResponse.json(pages);
	} catch (error) {
		console.error("Failed to fetch pages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch pages" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const result = createPageSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: "Validation failed", details: result.error.format() },
				{ status: 400 },
			);
		}

		const data = result.data;

		// Check if space exists
		const space = await prisma.space.findUnique({
			where: { id: data.spaceId },
		});

		if (!space) {
			return NextResponse.json({ error: "Space not found" }, { status: 404 });
		}

		// Check if page with path already exists in this space
		const existingPage = await prisma.page.findUnique({
			where: {
				spaceId_path: {
					spaceId: data.spaceId,
					path: data.path,
				},
			},
		});

		if (existingPage) {
			return NextResponse.json(
				{ error: "Page with this path already exists in the space" },
				{ status: 400 },
			);
		}

		if (!process.env.DATA_DIR) {
			return NextResponse.json(
				{ error: "Server configuration error: DATA_DIR is not set" },
				{ status: 500 },
			);
		}

		const filePath = resolvePageFilePath(
			process.env.DATA_DIR,
			space.kind as any,
			space.slug,
			data.path,
		);

		// Create page in database
		const page = await prisma.page.create({
			data: {
				title: data.title,
				slug: data.slug,
				path: data.path,
				spaceId: data.spaceId,
				status: data.status,
				tags: data.tags,
				pinned: data.pinned,
				source: data.source,
				draftOfPageId: data.draftOfPageId,
				contentPath: filePath,
				contentText: data.markdown,
			},
			include: { space: true },
		});

		const frontmatter = {
			id: page.id,
			title: page.title,
			slug: page.slug,
			space: space.slug,
			path: page.path,
			status: page.status as any,
			tags: page.tags,
			updatedBy: page.updatedById || "system",
			updatedAt: page.updatedAt.toISOString(),
			source: page.source as any,
			pinned: page.pinned,
		};

		try {
			await writeMarkdownFile(filePath, frontmatter, data.markdown);
		} catch (error) {
			console.error("Failed to write markdown file:", error);
			// Rollback DB creation if file write fails
			await prisma.page.delete({ where: { id: page.id } });
			return NextResponse.json(
				{ error: "Failed to write markdown file" },
				{ status: 500 },
			);
		}

		return NextResponse.json(page, { status: 201 });
	} catch (error) {
		console.error("Failed to create page:", error);
		return NextResponse.json(
			{ error: "Failed to create page" },
			{ status: 500 },
		);
	}
}
