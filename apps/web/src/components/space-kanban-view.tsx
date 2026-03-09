"use client";

import type { Page, User } from "@foundry/database";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type PageWithUser = Page & { updatedBy: User | null };

interface SpaceKanbanViewProps {
	pages: PageWithUser[];
}

const COLUMNS = [
	{ id: "draft", label: "Draft", description: "Pages awaiting review" },
	{ id: "stable", label: "Stable", description: "Published pages" },
	{ id: "archived", label: "Archived", description: "Retired content" },
] as const;

function KanbanCard({ page }: { page: PageWithUser }) {
	return (
		<Link href={`/pages/${page.id}`}>
			<div className="group rounded-lg border border-[color:var(--border-subtle)] bg-card/95 p-3 shadow-[var(--shadow-xs)] transition-all hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-sm)]">
				<div className="flex items-start gap-2">
					<FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
					<div className="min-w-0 flex-1">
						<p className="truncate text-[13px] font-medium text-foreground">
							{page.title}
						</p>
						<p className="truncate text-[11px] text-muted-foreground">
							{page.path}
						</p>
					</div>
				</div>
				<div className="mt-3 flex items-center justify-between">
					<Badge variant={page.source}>{page.source}</Badge>
					<span className="text-[11px] text-[color:var(--text-muted)]">
						{formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}
					</span>
				</div>
				{page.updatedBy ? (
					<div className="mt-2 border-t border-[color:var(--border-subtle)] pt-2">
						<p className="truncate text-[11px] text-muted-foreground">
							by {page.updatedBy.name ?? page.updatedBy.email}
						</p>
					</div>
				) : null}
			</div>
		</Link>
	);
}

export function SpaceKanbanView({ pages }: SpaceKanbanViewProps) {
	const columns = COLUMNS.map((column) => ({
		...column,
		pages: pages.filter((page) => page.status === column.id),
	}));

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			{columns.map((column) => (
				<div
					key={column.id}
					className="flex flex-col rounded-[14px] border border-[color:var(--border-subtle)] bg-surface-2/50"
				>
					<div className="border-b border-[color:var(--border-subtle)] px-4 py-3">
						<div className="flex items-center justify-between">
							<h3 className="text-[13px] font-medium text-foreground">
								{column.label}
							</h3>
							<span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted-foreground">
								{column.pages.length}
							</span>
						</div>
						<p className="mt-0.5 text-[11px] text-[color:var(--text-muted)]">
							{column.description}
						</p>
					</div>
					<div className="flex-1 space-y-2 p-3">
						{column.pages.length > 0 ? (
							column.pages.map((page) => (
								<KanbanCard key={page.id} page={page} />
							))
						) : (
							<div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-[color:var(--border-subtle)]">
								<p className="text-[12px] text-muted-foreground">
									No {column.label.toLowerCase()} pages
								</p>
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
