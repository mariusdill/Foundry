import { FileText, ScanSearch, ShieldEllipsis, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const metrics = [
	{
		label: "Stable pages",
		value: "218",
		detail: "+12 this week",
		icon: FileText,
	},
	{
		label: "Drafts awaiting review",
		value: "14",
		detail: "7 agent-authored",
		icon: Sparkles,
	},
	{
		label: "Search coverage",
		value: "99.2%",
		detail: "Title, content, tags, paths",
		icon: ScanSearch,
	},
	{
		label: "Scoped tokens",
		value: "8",
		detail: "2 expire this month",
		icon: ShieldEllipsis,
	},
];

const reviewQueue = [
	{
		title: "Incident playbook refresh",
		path: "runbooks/operations/incident-playbook",
		updatedAt: "8m ago",
		source: "agent",
	},
	{
		title: "MCP onboarding guidance",
		path: "projects/platform/mcp-onboarding",
		updatedAt: "21m ago",
		source: "human",
	},
	{
		title: "Search ranking notes",
		path: "projects/product/search-ranking-notes",
		updatedAt: "52m ago",
		source: "agent",
	},
];

const activityFeed = [
	{
		title: "ops-agent-02 appended notes to incident draft",
		detail: "write:drafts token used within runbooks/operations",
		when: "10:18",
	},
	{
		title: "Search index refreshed for platform space",
		detail: "218 pages updated with weighted text vectors",
		when: "09:54",
	},
	{
		title: "API token rotated for Cursor MCP client",
		detail: "Old token revoked and audit trail preserved",
		when: "09:21",
	},
];

export function DashboardPage() {
	return (
		<div className="space-y-6">
			<header className="flex items-start justify-between gap-4 border-b border-[color:var(--border-subtle)] pb-5">
				<div>
					<p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
						Workspace / dashboard / today
					</p>
					<h2 className="mt-1 text-[20px] font-medium tracking-tight text-foreground">
						Operational knowledge with human review built in.
					</h2>
					<p className="mt-1 text-[13px] text-muted-foreground">
						A quiet overview of review workload, search coverage, and system
						posture.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="sm">
						Draft review
					</Button>
					<Button size="sm">Create page</Button>
				</div>
			</header>

			<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{metrics.map((item) => {
					const Icon = item.icon;
					return (
						<Card key={item.label}>
							<CardContent className="p-4">
								<div className="flex items-center justify-between gap-3">
									<p className="text-[13px] text-secondary">{item.label}</p>
									<Icon className="size-4 text-[color:var(--text-muted)]" />
								</div>
								<p className="mt-2 text-[32px] font-medium tracking-tight text-foreground">
									{item.value}
								</p>
								<p className="mt-1 text-[12px] text-muted-foreground">
									{item.detail}
								</p>
							</CardContent>
						</Card>
					);
				})}
			</section>

			<section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-start justify-between gap-3">
							<div>
								<CardTitle>Review console</CardTitle>
								<CardDescription>
									Draft-first workflows stay visible and attributable.
								</CardDescription>
							</div>
							<Badge variant="draft">3 pending</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-1">
						{reviewQueue.map((item) => (
							<div
								key={item.title}
								className="flex items-center justify-between gap-4 rounded-md px-2 py-2 transition-colors hover:bg-surface-2"
							>
								<div className="min-w-0">
									<p className="truncate text-[13px] font-medium text-foreground">
										{item.title}
									</p>
									<p className="truncate text-[12px] text-muted-foreground">
										{item.path}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Badge variant={item.source === "agent" ? "agent" : "human"}>
										{item.source}
									</Badge>
									<span className="text-[11px] text-[color:var(--text-muted)]">
										{item.updatedAt}
									</span>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle>Recent activity</CardTitle>
						<CardDescription>What changed in the workspace.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{activityFeed.map((item) => (
							<div key={item.title} className="space-y-1">
								<div className="flex items-start justify-between gap-3">
									<p className="text-[13px] text-foreground">{item.title}</p>
									<span className="text-[11px] text-[color:var(--text-muted)]">
										{item.when}
									</span>
								</div>
								<p className="text-[12px] text-muted-foreground">
									{item.detail}
								</p>
							</div>
						))}
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
