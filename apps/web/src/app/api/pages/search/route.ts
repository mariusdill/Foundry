import { prisma } from "@foundry/database";
import { searchFiltersSchema } from "@foundry/shared";
import { NextResponse } from "next/server";
import { requireAuth, toAuthErrorResponse } from "@/lib/auth";

export async function GET(request: Request) {
	try {
		await requireAuth();

		const { searchParams } = new URL(request.url);
		const params = Object.fromEntries(searchParams.entries());

		const result = searchFiltersSchema.safeParse(params);
		if (!result.success) {
			return NextResponse.json(
				{ error: "Invalid search parameters", details: result.error.format() },
				{ status: 400 },
			);
		}

		const { q, space, status, source, tag, pinned, sort } = result.data;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const where: any = {};

		if (q) {
			where.title = {
				contains: q,
				mode: "insensitive",
			};
		}

		if (space) {
			where.space = { slug: space };
		}

		if (status) {
			where.status = status;
		}

		if (source) {
			where.source = source;
		}

		if (tag) {
			where.tags = { has: tag };
		}

		if (pinned !== undefined) {
			where.pinned = pinned;
		}

		const pages = await prisma.page.findMany({
			where,
			orderBy: { updatedAt: "desc" },
			include: { space: true },
			take: 50,
		});

		const results = pages.map((page) => {
			const { contentText, ...metadata } = page;
			return {
				...metadata,
				excerpt: contentText ? contentText.substring(0, 200) : "",
			};
		});

		if (sort === "relevance" && q) {
			const lowerQ = q.toLowerCase();
			results.sort((a, b) => {
				const aExact = a.title.toLowerCase() === lowerQ;
				const bExact = b.title.toLowerCase() === lowerQ;
				if (aExact && !bExact) return -1;
				if (!aExact && bExact) return 1;

				const aStarts = a.title.toLowerCase().startsWith(lowerQ);
				const bStarts = b.title.toLowerCase().startsWith(lowerQ);
				if (aStarts && !bStarts) return -1;
				if (!aStarts && bStarts) return 1;

				return 0;
			});
		}

		return NextResponse.json(results);
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to search pages:", error);
		return NextResponse.json(
			{ error: "Failed to search pages" },
			{ status: 500 },
		);
	}
}
