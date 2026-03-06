import { type AuditEvent, type Prisma, prisma } from "@foundry/database";
import { NextResponse } from "next/server";
import { requireAuth, toAuthErrorResponse } from "@/lib/auth";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const SENSITIVE_METADATA_KEY = /content|markdown|hash|secret|token|password/i;

type AuditEventWithActor = AuditEvent & {
	actor: {
		id: string;
		name: string | null;
		email: string;
	} | null;
};

function parseNumberParam(value: string | null, fallback: number, minimum = 0) {
	if (value === null) {
		return fallback;
	}

	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed < minimum) {
		throw new Error("INVALID_NUMBER");
	}

	return parsed;
}

function parseDateParam(value: string | null) {
	if (!value) {
		return null;
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new Error("INVALID_DATE");
	}

	return date;
}

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

function sanitizeEvent(event: AuditEventWithActor, isAdmin: boolean) {
	if (isAdmin) {
		return event;
	}

	return {
		...event,
		metadata: sanitizeMetadataValue(event.metadata),
	};
}

export async function GET(request: Request) {
	try {
		const user = await requireAuth();
		const { searchParams } = new URL(request.url);
		const actorId = searchParams.get("actor") ?? undefined;
		const action = searchParams.get("action") ?? undefined;
		const targetType = searchParams.get("targetType") ?? undefined;
		const pageId = searchParams.get("pageId") ?? undefined;
		const startDate = parseDateParam(searchParams.get("startDate"));
		const endDate = parseDateParam(searchParams.get("endDate"));
		const limit = Math.min(
			parseNumberParam(searchParams.get("limit"), DEFAULT_LIMIT),
			MAX_LIMIT,
		);
		const offset = parseNumberParam(searchParams.get("offset"), 0);

		const createdAt =
			startDate || endDate
				? {
						...(startDate ? { gte: startDate } : {}),
						...(endDate ? { lte: endDate } : {}),
					}
				: undefined;

		const visibilityWhere =
			user.role === "admin"
				? {}
				: {
						targetType: {
							in: ["page", "space"],
						},
					};

		const where: Prisma.AuditEventWhereInput = {
			...visibilityWhere,
			...(actorId ? { actorId } : {}),
			...(action ? { action } : {}),
			...(targetType ? { targetType } : {}),
			...(pageId ? { pageId } : {}),
			...(createdAt ? { createdAt } : {}),
		};

		const [events, total] = await Promise.all([
			prisma.auditEvent.findMany({
				where,
				orderBy: { createdAt: "desc" },
				take: limit,
				skip: offset,
				include: {
					actor: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			}),
			prisma.auditEvent.count({ where }),
		]);

		return NextResponse.json({
			events: events.map((event) =>
				sanitizeEvent(event as AuditEventWithActor, user.role === "admin"),
			),
			pagination: {
				limit,
				offset,
				total,
			},
		});
	} catch (error) {
		const authResponse = toAuthErrorResponse(error);
		if (authResponse) {
			return authResponse;
		}

		if (error instanceof Error && error.message === "INVALID_DATE") {
			return NextResponse.json(
				{ error: "Invalid date filter" },
				{ status: 400 },
			);
		}

		if (error instanceof Error && error.message === "INVALID_NUMBER") {
			return NextResponse.json(
				{ error: "Invalid pagination filter" },
				{ status: 400 },
			);
		}

		console.error("Failed to fetch audit events:", error);
		return NextResponse.json(
			{ error: "Failed to fetch audit events" },
			{ status: 500 },
		);
	}
}
