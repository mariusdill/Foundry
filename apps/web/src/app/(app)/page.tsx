import { prisma } from "@foundry/database";
import { buildDashboardActivitySummary } from "@/components/dashboard-overview";
import { DashboardPage } from "@/components/dashboard-page";
import { requireAuth } from "@/lib/auth";

type OverviewStatus = "draft" | "stable" | "archived";
type OverviewSource = "human" | "agent";
type OverviewKind = "runbooks" | "projects";

function getUpdatedByLabel(page: {
	updatedBy: { name: string | null; email: string } | null;
	source: OverviewSource;
}) {
	return (
		page.updatedBy?.name ??
		page.updatedBy?.email ??
		(page.source === "agent" ? "Agent" : "Human")
	);
}

function toDashboardPageItem(page: {
	id: string;
	title: string;
	path: string;
	status: OverviewStatus;
	source: OverviewSource;
	updatedAt: Date;
	updatedBy: { name: string | null; email: string } | null;
	space: { id: string; name: string; kind: OverviewKind };
}) {
	return {
		id: page.id,
		title: page.title,
		path: page.path,
		status: page.status,
		source: page.source,
		updatedAt: page.updatedAt,
		updatedByLabel: getUpdatedByLabel(page),
		space: page.space,
	};
}

export default async function Home() {
	const user = await requireAuth();

	// Get user's space memberships for filtering
	const userMemberships = await prisma.spaceMember.findMany({
		where: { userId: user.id },
		select: { spaceId: true },
	});
	const userSpaceIds = userMemberships.map((m) => m.spaceId);

	const [
		draftCount,
		pinnedCount,
		myEditedCount,
		draftPages,
		pinnedPages,
		myRecentPages,
		recentActivity,
		mySpaces,
	] = await Promise.all([
		// Drafts in user's spaces
		prisma.page.count({
			where: {
				status: "draft",
				spaceId: { in: userSpaceIds },
			},
		}),
		// Pinned pages in user's spaces
		prisma.page.count({
			where: {
				pinned: true,
				spaceId: { in: userSpaceIds },
			},
		}),
		// Pages I've edited
		prisma.page.count({
			where: {
				updatedById: user.id,
				status: { not: "archived" },
			},
		}),
		// Drafts in my spaces
		prisma.page.findMany({
			where: {
				status: "draft",
				spaceId: { in: userSpaceIds },
			},
			orderBy: { updatedAt: "desc" },
			take: 4,
			include: {
				updatedBy: {
					select: { name: true, email: true },
				},
				space: {
					select: { id: true, name: true, kind: true },
				},
			},
		}),
		// Pinned pages in my spaces
		prisma.page.findMany({
			where: {
				pinned: true,
				spaceId: { in: userSpaceIds },
			},
			orderBy: { updatedAt: "desc" },
			take: 4,
			include: {
				updatedBy: {
					select: { name: true, email: true },
				},
				space: {
					select: { id: true, name: true, kind: true },
				},
			},
		}),
		// Pages I recently edited
		prisma.page.findMany({
			where: {
				updatedById: user.id,
				status: { not: "archived" },
			},
			orderBy: { updatedAt: "desc" },
			take: 6,
			include: {
				updatedBy: {
					select: { name: true, email: true },
				},
				space: {
					select: { id: true, name: true, kind: true },
				},
			},
		}),
		// Activity in my spaces
		prisma.auditEvent.findMany({
			where: {
				targetType: { in: ["page", "space"] },
				OR: [
					{ actorId: user.id },
					{
						page: {
							spaceId: { in: userSpaceIds },
						},
					},
				],
			},
			orderBy: { createdAt: "desc" },
			take: 6,
			include: {
				actor: {
					select: { name: true, email: true },
				},
				page: {
					select: {
						id: true,
						title: true,
						path: true,
						space: {
							select: { name: true },
						},
					},
				},
			},
		}),
		// My spaces
		prisma.space.findMany({
			where: {
				id: { in: userSpaceIds },
			},
			orderBy: { name: "asc" },
			take: 4,
			include: {
				_count: { select: { pages: true } },
			},
		}),
	]);

	const activity =
		recentActivity.length > 0
			? recentActivity.map((event) => {
					const metadata =
						event.metadata &&
						typeof event.metadata === "object" &&
						!Array.isArray(event.metadata)
							? event.metadata
							: null;
					const summary = buildDashboardActivitySummary({
						action: event.action,
						actorType: event.actorType,
						actorName: event.actor?.name ?? event.actor?.email ?? null,
						targetId: event.targetId,
						targetType: event.targetType,
						metadata,
						page: event.page,
					});

					return {
						id: event.id,
						createdAt: event.createdAt,
						...summary,
					};
				})
			: myRecentPages.slice(0, 4).map((page) => {
					const summary = buildDashboardActivitySummary({
						action: "page:update",
						actorType: page.source as OverviewSource,
						actorName: page.updatedBy?.name ?? page.updatedBy?.email ?? null,
						targetId: page.id,
						targetType: "page",
						page: {
							id: page.id,
							title: page.title,
							path: page.path,
							space: { name: page.space.name },
						},
					});

					return {
						id: page.id,
						createdAt: page.updatedAt,
						...summary,
					};
				});

	return (
		<DashboardPage
			userName={user.name ?? user.email}
			draftCount={draftCount}
			pinnedCount={pinnedCount}
			myEditedCount={myEditedCount}
			drafts={draftPages.map((page) =>
				toDashboardPageItem({
					...page,
					status: page.status as OverviewStatus,
					source: page.source as OverviewSource,
					space: {
						...page.space,
						kind: page.space.kind as OverviewKind,
					},
				}),
			)}
			pinnedPages={pinnedPages.map((page) =>
				toDashboardPageItem({
					...page,
					status: page.status as OverviewStatus,
					source: page.source as OverviewSource,
					space: {
						...page.space,
						kind: page.space.kind as OverviewKind,
					},
				}),
			)}
			recentPages={myRecentPages.map((page) =>
				toDashboardPageItem({
					...page,
					status: page.status as OverviewStatus,
					source: page.source as OverviewSource,
					space: {
						...page.space,
						kind: page.space.kind as OverviewKind,
					},
				}),
			)}
			activity={activity}
			spaces={mySpaces.map((space) => ({
				id: space.id,
				name: space.name,
				kind: space.kind as OverviewKind,
				description: space.description,
				pageCount: space._count.pages,
			}))}
		/>
	);
}
