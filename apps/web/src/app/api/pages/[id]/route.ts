import { rm } from "node:fs/promises";
import { prisma, readMarkdownFile, writeMarkdownFile } from "@foundry/database";
import { updatePageSchema } from "@foundry/shared";
import { NextResponse } from "next/server";
import { requireAuth, requireRole, toAuthErrorResponse } from "@/lib/auth";
import { createVersion } from "@/lib/versioning";

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await requireAuth();

		const { id } = await params;
		const page = await prisma.page.findUnique({
			where: { id },
			include: { space: true },
		});

		if (!page) {
			return NextResponse.json({ error: "Page not found" }, { status: 404 });
		}

		try {
			const { frontmatter, markdown } = await readMarkdownFile(
				page.contentPath,
			);
			return NextResponse.json({
				...page,
				frontmatter,
				markdown,
			});
		} catch (error) {
			console.error("Failed to read markdown file:", error);
			// Return DB page even if file read fails, but indicate error
			return NextResponse.json({
				...page,
				markdownError: "Failed to read markdown content",
			});
		}
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to fetch page:", error);
		return NextResponse.json(
			{ error: "Failed to fetch page" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const user = await requireRole("editor");

		const { id } = await params;
		const page = await prisma.page.findUnique({
			where: { id },
			include: { space: true },
		});

		if (!page) {
			return NextResponse.json({ error: "Page not found" }, { status: 404 });
		}

		const body = await request.json();
		const result = updatePageSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: "Validation failed", details: result.error.format() },
				{ status: 400 },
			);
		}

		const data = result.data;
		let currentMarkdown = page.contentText;

		try {
			const fileContent = await readMarkdownFile(page.contentPath);
			currentMarkdown = fileContent.markdown;
		} catch (error) {
			console.error("Failed to read existing markdown file:", error);
		}

		if (data.markdown !== undefined && data.markdown !== currentMarkdown) {
			await createVersion(page.id, currentMarkdown, user.id);
		}

		// Update page in database
		const updatedPage = await prisma.page.update({
			where: { id },
			data: {
				title: data.title !== undefined ? data.title : undefined,
				status: data.status !== undefined ? data.status : undefined,
				tags: data.tags !== undefined ? data.tags : undefined,
				pinned: data.pinned !== undefined ? data.pinned : undefined,
				contentText: data.markdown !== undefined ? data.markdown : undefined,
				updatedById: user.id,
			},
			include: { space: true },
		});

		const nextMarkdown = data.markdown ?? currentMarkdown;

		// Write updated markdown file
		const frontmatter = {
			id: updatedPage.id,
			title: updatedPage.title,
			slug: updatedPage.slug,
			space: updatedPage.space.slug,
			path: updatedPage.path,
			status: updatedPage.status,
			tags: updatedPage.tags,
			updatedBy: updatedPage.updatedById || "system",
			updatedAt: updatedPage.updatedAt.toISOString(),
			source: updatedPage.source,
			pinned: updatedPage.pinned,
		};

		try {
			await writeMarkdownFile(
				updatedPage.contentPath,
				frontmatter,
				nextMarkdown,
			);
		} catch (error) {
			console.error("Failed to write markdown file:", error);
			return NextResponse.json(
				{ error: "Failed to write markdown file" },
				{ status: 500 },
			);
		}

		return NextResponse.json(updatedPage);
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to update page:", error);
		return NextResponse.json(
			{ error: "Failed to update page" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await requireRole("editor");

		const { id } = await params;
		const page = await prisma.page.findUnique({
			where: { id },
		});

		if (!page) {
			return NextResponse.json({ error: "Page not found" }, { status: 404 });
		}

		// Delete file on disk
		try {
			await rm(page.contentPath, { force: true });
		} catch (error) {
			console.error("Failed to delete page file:", error);
			// Continue with DB deletion even if file deletion fails
		}

		// Delete page in database
		await prisma.page.delete({
			where: { id },
		});

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to delete page:", error);
		return NextResponse.json(
			{ error: "Failed to delete page" },
			{ status: 500 },
		);
	}
}
