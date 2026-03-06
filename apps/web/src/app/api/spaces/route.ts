import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@foundry/database";
import { createSpaceSchema } from "@foundry/shared";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const spaces = await prisma.space.findMany({
			orderBy: { name: "asc" },
		});
		return NextResponse.json(spaces);
	} catch (error) {
		console.error("Failed to fetch spaces:", error);
		return NextResponse.json(
			{ error: "Failed to fetch spaces" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
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

		return NextResponse.json(space, { status: 201 });
	} catch (error) {
		console.error("Failed to create space:", error);
		return NextResponse.json(
			{ error: "Failed to create space" },
			{ status: 500 },
		);
	}
}
