import { formatDistanceToNow } from "date-fns";
import { History, Pin } from "lucide-react";
import Link from "next/link";

import { PageChrome } from "@/components/page-chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type DashboardPageItem = {
	id: string;
	title: string;
	path: string;
	status: "draft" | "stable" | "archived";
	source: "human" | "agent";
	updatedAt: Date;
	updatedByLabel: string;
	space: {
		id: string;
		name: string;
		kind: "runbooks" | "projects";
	};
};

type DashboardActivityItem = {
	id: string;
	title: string;
	detail: string;
	tone: "human" | "agent" | "neutral";
	createdAt: Date;
	href?: string;
};

type DashboardSpaceSnapshot = {
	id: string;
	name: string;
	kind: "runbooks" | "projects";
	description: string | null;
	pageCount: number;
};

type DashboardPageProps = {
	userName: string;
	draftCount: number;
	pinnedCount: number;
	myEditedCount: number;
	drafts: DashboardPageItem[];
	pinnedPages: DashboardPageItem[];
	recentPages: DashboardPageItem[];
	activity: DashboardActivityItem[];
	spaces: DashboardSpaceSnapshot[];
};

function formatRelativeTime(value: Date) {
	return formatDistanceToNow(value, { addSuffix: true });
}

function PageItemRow({
	item,
	showPinned = false,
}: {
	item: DashboardPageItem;
	showPinned?: boolean;
}) {
	return (
		<div className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-surface-2/70 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0 space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<Link
						href={`/pages/${item.id}`}
						className="truncate text-[14px] font-medium text-foreground transition-colors hover:text-[color:var(--text-secondary)]"
					>
						{item.title}
					</Link>
					<Badge variant={item.status}>{item.status}</Badge>
					<Badge variant={item.source}>{item.source}</Badge>
					{showPinned ? <Badge variant="outline">pinned</Badge> : null}
				</div>
				<p className="truncate text-[12px] text-muted-foreground">
					{item.space.name} / {item.path}
				</p>
			</div>
			<div className="shrink-0 space-y-1 text-[11px] text-[color:var(--text-muted)] sm:text-right">
				<p>{item.updatedByLabel}</p>
				<p>{formatRelativeTime(item.updatedAt)}</p>
			</div>
		</div>
	);
}

function PageListCard({
	title,
	description,
	items,
	emptyTitle,
	emptyDescription,
	emptyHref,
	emptyLabel,
	showPinned = false,
	headerBadge,
}: {
	title: string;
	description: string;
	items: DashboardPageItem[];
	emptyTitle: string;
	emptyDescription: string;
	emptyHref: string;
	emptyLabel: string;
	showPinned?: boolean;
	headerBadge?: React.ReactNode;
}) {
	return (
		<Card className="overflow-hidden bg-card/95">
			<CardHeader className="gap-2 border-b border-[color:var(--border-subtle)] pb-4">
				<div className="flex items-start justify-between gap-3">
					<div>
						<CardTitle>{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
					{headerBadge}
				</div>
			</CardHeader>
			{items.length > 0 ? (
				<div className="divide-y divide-[color:var(--border-subtle)]">
					{items.map((item) => (
						<PageItemRow key={item.id} item={item} showPinned={showPinned} />
					))}
				</div>
			) : (
				<CardContent className="py-10">
					<p className="text-[14px] font-medium text-foreground">
						{emptyTitle}
					</p>
					<p className="mt-1 text-[13px] text-muted-foreground">
						{emptyDescription}
					</p>
					<Button asChild variant="ghost" size="sm" className="mt-4">
						<Link href={emptyHref}>{emptyLabel}</Link>
					</Button>
				</CardContent>
			)}
		</Card>
	);
}

function SummaryPanel({
	label,
	value,
	detail,
	href,
}: {
	label: string;
	value: string;
	detail: string;
	href?: string;
}) {
	const content = (
		<div className="rounded-[12px] border border-[color:var(--border-subtle)] bg-surface-2/80 px-4 py-4">
			<p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
				{label}
			</p>
			<p className="mt-2 line-clamp-2 text-[15px] font-medium tracking-tight text-foreground">
				{value}
			</p>
			<p className="mt-2 text-[12px] leading-5 text-muted-foreground">
				{detail}
			</p>
		</div>
	);

	if (!href) {
		return content;
	}

	return (
		<Link
			href={href}
			className="block transition-transform hover:-translate-y-0.5"
		>
			{content}
		</Link>
	);
}

function ActivityRow({ item }: { item: DashboardActivityItem }) {
	const content = (
		<div className="space-y-2 rounded-[12px] border border-[color:var(--border-subtle)] bg-surface-2/70 px-4 py-3 transition-colors hover:bg-surface-2">
			<div className="flex items-start justify-between gap-3">
				<p className="text-[13px] font-medium text-foreground">{item.title}</p>
				<span className="shrink-0 text-[11px] text-[color:var(--text-muted)]">
					{formatRelativeTime(item.createdAt)}
				</span>
			</div>
			<div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
				<Badge variant={item.tone === "neutral" ? "outline" : item.tone}>
					{item.tone === "neutral" ? "audit" : item.tone}
				</Badge>
				<span>{item.detail}</span>
			</div>
		</div>
	);

	if (!item.href) {
		return content;
	}

	return (
		<Link href={item.href} className="block">
			{content}
		</Link>
	);
}

export function DashboardPage({
	userName,
	draftCount,
	pinnedCount,
	myEditedCount,
	drafts,
	pinnedPages,
	recentPages,
	activity,
	spaces,
}: DashboardPageProps) {
	const firstRecentPage = recentPages[0];
	const latestChange = activity[0];

	return (
		<PageChrome
			className="space-y-5"
			eyebrow={`Welcome back, ${userName}`}
			title="Your Work"
			description="See what needs your attention, continue where you left off, and track changes across your spaces."
			actions={
				<>
					<Button asChild variant="ghost" size="sm">
						<Link href="/search">Search</Link>
					</Button>
					<Button asChild size="sm">
						<Link href="/drafts">Review</Link>
					</Button>
				</>
			}
		>
			<Card className="overflow-hidden bg-card/95">
				<CardHeader className="gap-3 border-b border-[color:var(--border-subtle)] pb-4">
					<CardTitle>Quick Overview</CardTitle>
					<CardDescription>
						{myEditedCount} pages you've edited · {draftCount} drafts in your
						spaces · {pinnedCount} pinned pages
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 pt-5 lg:grid-cols-3">
					<SummaryPanel
						label="Needs Your Attention"
						value={`${draftCount} draft${draftCount === 1 ? "" : "s"} awaiting review`}
						detail={
							draftCount > 0
								? "Open the review queue to decide what becomes stable pages."
								: "No drafts are waiting for review in your spaces."
						}
						href="/drafts"
					/>
					<SummaryPanel
						label="Continue Working"
						value={firstRecentPage?.title ?? "No recent pages yet"}
						detail={
							firstRecentPage
								? `${firstRecentPage.space.name} updated ${formatRelativeTime(firstRecentPage.updatedAt)}`
								: "Pages you edit will appear here for quick access."
						}
						href={firstRecentPage ? `/pages/${firstRecentPage.id}` : undefined}
					/>
					<SummaryPanel
						label="Latest Change"
						value={latestChange?.title ?? "No recent changes yet"}
						detail={
							latestChange
								? `${latestChange.detail} · ${formatRelativeTime(latestChange.createdAt)}`
								: "Activity in your spaces will show up here."
						}
						href={latestChange?.href}
					/>
				</CardContent>
			</Card>

			<section className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
				<div className="space-y-3">
					<PageListCard
						title="Drafts in Your Spaces"
						description="Review draft pages with source and updatedBy context before promotion or archive."
						items={drafts}
						headerBadge={<Badge variant="draft">{draftCount} in queue</Badge>}
						emptyTitle="No drafts in your spaces"
						emptyDescription="Drafts will appear here when pages need a human decision in spaces you're a member of."
						emptyHref="/spaces"
						emptyLabel="Browse spaces"
					/>
					<PageListCard
						title="Your Recent Pages"
						description="Continue working on pages you've recently edited without losing context."
						items={recentPages}
						emptyTitle="No recent pages yet"
						emptyDescription="Pages you edit will appear here after the first changes land."
						emptyHref="/spaces"
						emptyLabel="Open spaces"
					/>
				</div>

				<div className="space-y-3">
					<PageListCard
						title="Your Pinned Pages"
						description="Keep runbooks and project pages that matter every day within reach."
						items={pinnedPages}
						headerBadge={
							<div className="flex items-center gap-2 text-[11px] text-[color:var(--text-muted)]">
								<Pin className="size-3.5" />
								<span>{pinnedCount} pinned</span>
							</div>
						}
						emptyTitle="No pinned pages yet"
						emptyDescription="Pin stable pages from page detail when you want them close to home."
						emptyHref="/search"
						emptyLabel="Search pages"
						showPinned
					/>

					<Card className="overflow-hidden bg-card/95">
						<CardHeader className="gap-2 border-b border-[color:var(--border-subtle)] pb-4">
							<div className="flex items-start justify-between gap-3">
								<div>
									<CardTitle>Your Activity</CardTitle>
									<CardDescription>
										Recent changes in your spaces and pages you've worked on.
									</CardDescription>
								</div>
								<History className="mt-0.5 size-4 text-[color:var(--text-muted)]" />
							</div>
						</CardHeader>
						<CardContent className="space-y-3 pt-5">
							{activity.length > 0 ? (
								activity.map((item) => (
									<ActivityRow key={item.id} item={item} />
								))
							) : (
								<p className="text-[13px] text-muted-foreground">
									Activity will appear here when pages and spaces in your
									membership change.
								</p>
							)}
						</CardContent>
					</Card>

					<Card className="overflow-hidden bg-card/95">
						<CardHeader className="gap-2 border-b border-[color:var(--border-subtle)] pb-4">
							<CardTitle>Your Spaces</CardTitle>
							<CardDescription>
								Runbooks and projects you have access to.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 pt-5">
							{spaces.length > 0 ? (
								spaces.map((space) => (
									<Link
										key={space.id}
										href={`/spaces/${space.id}`}
										className="flex items-start justify-between gap-3 rounded-[12px] border border-[color:var(--border-subtle)] bg-surface-2/70 px-4 py-3 transition-colors hover:bg-surface-2"
									>
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<p className="truncate text-[13px] font-medium text-foreground">
													{space.name}
												</p>
												<Badge variant="secondary">{space.kind}</Badge>
											</div>
											<p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">
												{space.description || "No description yet."}
											</p>
										</div>
										<span className="shrink-0 text-[11px] text-[color:var(--text-muted)]">
											{space.pageCount} page{space.pageCount === 1 ? "" : "s"}
										</span>
									</Link>
								))
							) : (
								<div className="space-y-3">
									<p className="text-[13px] text-muted-foreground">
										You don't have access to any spaces yet.
									</p>
									<Button asChild variant="ghost" size="sm">
										<Link href="/spaces">Browse all spaces</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</section>
		</PageChrome>
	);
}
