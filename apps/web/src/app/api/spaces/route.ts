import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@foundry/database";
import { createSpaceSchema } from "@foundry/shared";
import { NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/audit";
import { requireAdmin, requireAuth, toAuthErrorResponse } from "@/lib/auth";

export async function GET() {
	try {
		await requireAuth();

		const spaces = await prisma.space.findMany({
			orderBy: { name: "asc" },
		});
		return NextResponse.json(spaces);
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to fetch spaces:", error);
		return NextResponse.json(
			{ error: "Failed to fetch spaces" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const user = await requireAdmin();

		const body = await request.json();
		const result = createSpaceSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: "Validation failed", details: result.error.format() },
				{ status: 400 },
			);
		}

		const data = result.data;

		// Check if space with slug already exists
		const existingSpace = await prisma.space.findUnique({
			where: { slug: data.slug },
		});

		if (existingSpace) {
			return NextResponse.json(
				{ error: "Space with this slug already exists" },
				{ status: 400 },
			);
		}

		if (!process.env.DATA_DIR) {
			return NextResponse.json(
				{ error: "Server configuration error: DATA_DIR is not set" },
				{ status: 500 },
			);
		}

		const rootFolder = join(process.env.DATA_DIR, data.kind, data.slug);

		// Create folder on disk
		try {
			await mkdir(rootFolder, { recursive: true });
		} catch (error) {
			console.error("Failed to create space folder:", error);
			return NextResponse.json(
				{ error: "Failed to create space folder on disk" },
				{ status: 500 },
			);
		}

		// Create space in database
		const space = await prisma.space.create({
			data: {
				name: data.name,
				slug: data.slug,
				description: data.description,
				kind: data.kind,
				icon: data.icon,
				rootFolder,
			},
		});

		await logAuditEvent({
			actorId: user.id,
			actorType: "human",
			action: "space:create",
			targetId: space.id,
			targetType: "space",
			metadata: {
				name: space.name,
				slug: space.slug,
				kind: space.kind,
			},
		});

		return NextResponse.json(space, { status: 201 });
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to create space:", error);
		return NextResponse.json(
			{ error: "Failed to create space" },
			{ status: 500 },
		);
	}
}
