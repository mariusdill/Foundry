import { prisma } from "@foundry/database";
import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await requireAuth();
		const { id: pageId } = await params;

		// Get the current page to find its title
		const currentPage = await prisma.page.findUnique({
			where: { id: pageId },
			select: { title: true },
		});

		if (!currentPage) {
			return NextResponse.json({ error: "Page not found" }, { status: 404 });
		}

		// Find all pages in the same space that mention this page's title in their content
		// This is a simple implementation - it searches for [[Title]] or just the title text
		const searchPattern = `[[${currentPage.title}]]`;

		const linkingPages = await prisma.page.findMany({
			where: {
				AND: [
					{ id: { not: pageId } },
					{
						contentText: { contains: searchPattern },
					},
				],
			},
			select: {
				id: true,
				title: true,
				path: true,
				status: true,
				space: {
					select: {
						name: true,
					},
				},
			},
			orderBy: { updatedAt: "desc" },
			take: 10,
		});

		return NextResponse.json(linkingPages);
	} catch (error) {
		console.error("Error fetching backlinks:", error);
		return NextResponse.json(
			{ error: "Failed to fetch backlinks" },
			{ status: 500 },
		);
	}
}
