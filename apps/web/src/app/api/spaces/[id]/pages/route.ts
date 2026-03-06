import { prisma } from "@foundry/database";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");

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
		console.error("Failed to fetch space pages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch space pages" },
			{ status: 500 },
		);
	}
}
