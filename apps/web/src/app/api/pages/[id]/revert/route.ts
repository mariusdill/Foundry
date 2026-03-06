import { revertPageSchema } from "@foundry/shared";
import { NextResponse } from "next/server";
import { requireRole, toAuthErrorResponse } from "@/lib/auth";
import { revertToVersion, toVersioningErrorResponse } from "@/lib/versioning";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const user = await requireRole("editor");
		const { id } = await params;
		const body = await request.json();
		const result = revertPageSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: "Validation failed", details: result.error.format() },
				{ status: 400 },
			);
		}

		const page = await revertToVersion(id, result.data.versionId, user.id);
		return NextResponse.json(page);
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		const versioningResponse = toVersioningErrorResponse(error);
		if (versioningResponse) {
			return versioningResponse;
		}

		console.error("Failed to revert page:", error);
		return NextResponse.json(
			{ error: "Failed to revert page" },
			{ status: 500 },
		);
	}
}
