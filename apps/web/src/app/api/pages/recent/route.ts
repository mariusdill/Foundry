import { prisma } from "@foundry/database";
import { NextResponse } from "next/server";
import { requireAuth, toAuthErrorResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	try {
		await requireAuth();

		const { searchParams } = new URL(request.url);
		const limitParam = searchParams.get("limit");

		let limit = 20;
		if (limitParam) {
			const parsed = parseInt(limitParam, 10);
			if (!isNaN(parsed) && parsed > 0) {
				limit = Math.min(parsed, 100);
			}
		}

		const pages = await prisma.page.findMany({
			orderBy: { updatedAt: "desc" },
			take: limit,
			include: { space: true },
		});

		return NextResponse.json(pages);
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to fetch recent pages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch recent pages" },
			{ status: 500 },
		);
	}
}
