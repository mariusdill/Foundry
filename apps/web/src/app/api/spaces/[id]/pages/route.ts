import { prisma } from "@foundry/database";
import { NextResponse } from "next/server";
import { requireAuth, toAuthErrorResponse } from "@/lib/auth";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await requireAuth();

		const { id } = await params;
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const where: any = { spaceId: id };
		if (status) {
			where.status = status;
		}

		const pages = await prisma.page.findMany({
			where,
			orderBy: { updatedAt: "desc" },
			include: { space: true },
		});

		return NextResponse.json(pages);
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to fetch space pages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch space pages" },
			{ status: 500 },
		);
	}
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await requireAuth();

		const { id } = await params;
		const body = await request.json();
		const { title, slug, path } = body;

		if (!title || !slug || !path) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const space = await prisma.space.findUnique({
			where: { id },
		});

		if (!space) {
			return NextResponse.json({ error: "Space not found" }, { status: 404 });
		}

		// Check if page with same path already exists in this space
		const existingPage = await prisma.page.findUnique({
			where: {
				spaceId_path: {
					spaceId: id,
					path,
				},
			},
		});

		if (existingPage) {
			return NextResponse.json(
				{ error: "Page with this path already exists in this space" },
				{ status: 400 },
			);
		}

		const contentPath = `${space.rootFolder}${path}.md`;

		const page = await prisma.page.create({
			data: {
				spaceId: id,
				title,
				slug,
				path,
				contentPath,
				updatedById: session.id,
			},
		});

		return NextResponse.json(page, { status: 201 });
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to create page:", error);
		return NextResponse.json(
			{ error: "Failed to create page" },
			{ status: 500 },
		);
	}
}
