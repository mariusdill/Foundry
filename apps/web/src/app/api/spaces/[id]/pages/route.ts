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
