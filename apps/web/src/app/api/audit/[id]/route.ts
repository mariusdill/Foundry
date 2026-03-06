import { prisma } from "@foundry/database";
import { NextResponse } from "next/server";
import { requireAuth, toAuthErrorResponse } from "@/lib/auth";

const SENSITIVE_METADATA_KEY = /content|markdown|hash|secret|token|password/i;

function sanitizeMetadataValue(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value
			.map((item) => sanitizeMetadataValue(item))
			.filter((item) => item !== undefined);
	}

	if (value && typeof value === "object") {
		const entries = Object.entries(value).flatMap(([key, entryValue]) => {
			if (SENSITIVE_METADATA_KEY.test(key)) {
				return [];
			}

			const sanitizedValue = sanitizeMetadataValue(entryValue);
			return sanitizedValue === undefined
				? []
				: [[key, sanitizedValue] as const];
		});

		return entries.length > 0 ? Object.fromEntries(entries) : null;
	}

	return value;
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const user = await requireAuth();
		const { id } = await params;
		const event = await prisma.auditEvent.findUnique({
			where: { id },
			include: {
				actor: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		if (!event) {
			return NextResponse.json(
				{ error: "Audit event not found" },
				{ status: 404 },
			);
		}

		if (
			user.role !== "admin" &&
			!["page", "space"].includes(event.targetType)
		) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		return NextResponse.json(
			user.role === "admin"
				? event
				: {
						...event,
						metadata: sanitizeMetadataValue(event.metadata),
					},
		);
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		console.error("Failed to fetch audit event:", error);
		return NextResponse.json(
			{ error: "Failed to fetch audit event" },
			{ status: 500 },
		);
	}
}
