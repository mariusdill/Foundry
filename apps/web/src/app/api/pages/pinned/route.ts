import { prisma } from "@foundry/database";
import { NextResponse } from "next/server";
import { requireAuth, toAuthErrorResponse } from "@/lib/auth";

export async function GET() {
	try {
		await requireAuth();

		const pages = await prisma.page.findMany({
			where: { pinned: true },
			orderBy: { updatedAt: "desc" },
			include: { space: true },
		});

		return NextResponse.json(pages);
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to fetch pinned pages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch pinned pages" },
			{ status: 500 },
		);
	}
}
