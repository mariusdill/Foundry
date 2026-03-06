import { prisma } from "@foundry/database";
import { NextResponse } from "next/server";
import { requireRole, toAuthErrorResponse } from "@/lib/auth";
import { getVersions } from "@/lib/versioning";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await requireRole("editor");

		const { id } = await params;
		const page = await prisma.page.findUnique({ where: { id } });

		if (!page) {
			return NextResponse.json({ error: "Page not found" }, { status: 404 });
		}

		const versions = await getVersions(id);

		return NextResponse.json(
			versions.map((version) => ({
				id: version.id,
				createdAt: version.createdAt,
				createdBy: version.createdBy?.name ?? version.createdBy?.email ?? null,
				hashPreview: version.hash.slice(0, 12),
			})),
		);
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to fetch page versions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch page versions" },
			{ status: 500 },
		);
	}
}
