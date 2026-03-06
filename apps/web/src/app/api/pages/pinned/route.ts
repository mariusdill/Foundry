import { prisma } from "@foundry/database";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const pages = await prisma.page.findMany({
			where: { pinned: true },
			orderBy: { updatedAt: "desc" },
			include: { space: true },
		});

		return NextResponse.json(pages);
	} catch (error) {
		console.error("Failed to fetch pinned pages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch pinned pages" },
			{ status: 500 },
		);
	}
}
