import { FileText, ScanSearch, ShieldEllipsis, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
		updatedBy: "ops-agent-02",
		source: "agent",
	},
	{
		title: "MCP onboarding guidance",
		path: "projects/platform/mcp-onboarding",
		updatedAt: "21m ago",
		updatedBy: "Dillmar",
		source: "human",
	},
	{
		title: "Search ranking notes",
		path: "projects/product/search-ranking-notes",
		updatedAt: "52m ago",
		updatedBy: "research-agent",
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
			{/* Metrics */}
			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{metrics.map((item) => {
					const Icon = item.icon;
					return (
						<div
							key={item.label}
							className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-2)] p-4"
						>
							<div className="flex items-center justify-between gap-3">
								<p className="text-sm text-[color:var(--text-secondary)]">
									{item.label}
								</p>
								<Icon className="size-4 text-[color:var(--text-muted)]" />
							</div>
							<p className="mt-2 text-2xl font-medium tracking-tight text-[color:var(--text-primary)]">
								{item.value}
							</p>
							<p className="mt-1 text-xs text-[color:var(--text-muted)]">
								{item.detail}
							</p>
						</div>
					);
				})}
			</section>

			{/* Main Content */}
			<section className="grid gap-4 xl:grid-cols-[1fr_380px]">
				{/* Review Queue */}
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-base font-medium">
									Review console
								</CardTitle>
								<CardDescription className="mt-0.5">
									Draft-first workflows stay visible and attributable
								</CardDescription>
							</div>
							<Badge variant="draft">3 pending</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-2">
						{reviewQueue.map((item) => (
							<div
								key={item.title}
								className="flex items-center justify-between gap-4 rounded-md p-2 hover:bg-[color:var(--surface-2)] transition-colors cursor-pointer"
							>
								<div className="min-w-0">
									<p className="text-sm font-medium text-[color:var(--text-primary)] truncate">
										{item.title}
									</p>
									<p className="text-xs text-[color:var(--text-muted)]">
										{item.path}
									</p>
								</div>
								<div className="flex items-center gap-3 shrink-0">
									<Badge
										variant={item.source === "agent" ? "agent" : "human"}
										className="text-[10px]"
									>
										{item.source}
									</Badge>
									<span className="text-xs text-[color:var(--text-muted)]">
										{item.updatedAt}
									</span>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Activity */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base font-medium">
							Recent activity
						</CardTitle>
						<CardDescription className="mt-0.5">
							What changed in the workspace
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{activityFeed.map((item) => (
							<div key={item.title} className="space-y-0.5">
								<div className="flex items-start justify-between gap-3">
									<p className="text-sm text-[color:var(--text-primary)]">
										{item.title}
									</p>
									<span className="text-xs text-[color:var(--text-muted)] shrink-0">
										{item.when}
									</span>
								</div>
								<p className="text-xs text-[color:var(--text-secondary)]">
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
