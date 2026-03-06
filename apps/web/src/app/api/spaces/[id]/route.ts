import { rm } from "node:fs/promises";
import { prisma } from "@foundry/database";
import { createSpaceSchema } from "@foundry/shared";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const space = await prisma.space.findUnique({
			where: { id },
		});

		if (!space) {
			return NextResponse.json({ error: "Space not found" }, { status: 404 });
		}

		return NextResponse.json(space);
	} catch (error) {
		console.error("Failed to fetch space:", error);
		return NextResponse.json(
			{ error: "Failed to fetch space" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const space = await prisma.space.findUnique({
			where: { id },
		});

		if (!space) {
			return NextResponse.json({ error: "Space not found" }, { status: 404 });
		}

		const body = await request.json();
		const result = createSpaceSchema.partial().safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: "Validation failed", details: result.error.format() },
				{ status: 400 },
			);
		}

		const data = result.data;

		// If slug is being updated, check if it already exists
		if (data.slug && data.slug !== space.slug) {
			const existingSpace = await prisma.space.findUnique({
				where: { slug: data.slug },
			});

			if (existingSpace) {
				return NextResponse.json(
					{ error: "Space with this slug already exists" },
					{ status: 400 },
				);
			}

			// Note: We don't rename the folder on disk when slug changes in this MVP
			// to keep things simple, but we could add that logic here if needed.
		}

		const updatedSpace = await prisma.space.update({
			where: { id },
			data: {
				name: data.name,
				slug: data.slug,
				description: data.description,
				icon: data.icon,
				// We don't allow updating kind as it determines the folder structure
			},
		});

		return NextResponse.json(updatedSpace);
	} catch (error) {
		console.error("Failed to update space:", error);
		return NextResponse.json(
			{ error: "Failed to update space" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const space = await prisma.space.findUnique({
			where: { id },
		});

		if (!space) {
			return NextResponse.json({ error: "Space not found" }, { status: 404 });
		}

		// Delete folder on disk
		try {
			await rm(space.rootFolder, { recursive: true, force: true });
		} catch (error) {
			console.error("Failed to delete space folder:", error);
			// We continue with DB deletion even if folder deletion fails
			// as the folder might already be gone or we might have permission issues
		}

		// Delete space in database
		await prisma.space.delete({
			where: { id },
		});

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error("Failed to delete space:", error);
		return NextResponse.json(
			{ error: "Failed to delete space" },
			{ status: 500 },
		);
	}
}
