import { prisma } from "@foundry/database";
import { NextResponse } from "next/server";
import { requireRole, toAuthErrorResponse } from "@/lib/auth";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await requireRole("editor");

		const { id } = await params;
		const version = await prisma.version.findUnique({
			where: { id },
			include: {
				createdBy: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		if (!version) {
			return NextResponse.json({ error: "Version not found" }, { status: 404 });
		}

		return NextResponse.json(version);
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to fetch version:", error);
		return NextResponse.json(
			{ error: "Failed to fetch version" },
			{ status: 500 },
		);
	}
}
