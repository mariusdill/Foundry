"use client";

import type { Page, Space, User } from "@foundry/database";
import {
	FolderGit2,
	Kanban,
	List,
	PanelLeftClose,
	PanelLeftOpen,
	Plus,
	Search,
} from "lucide-react";
import { useState } from "react";
import { PageChrome } from "@/components/page-chrome";
import { SpaceKanbanView } from "@/components/space-kanban-view";
import { SpacePageList } from "@/components/space-page-list";
import { SpacePageTree } from "@/components/space-page-tree";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CreatePageDialog } from "./create-page-dialog";

type PageWithUser = Page & { updatedBy: User | null };

interface SpaceViewProps {
	space: Space;
	initialPages: PageWithUser[];
}

export function SpaceView({ space, initialPages }: SpaceViewProps) {
	const [treeOpen, setTreeOpen] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [sourceFilter, setSourceFilter] = useState<string>("all");
	const [tagsFilter, setTagsFilter] = useState<string>("all");
	const [viewMode, setViewMode] = useState<"list" | "board">("list");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	const uniqueTags = Array.from(
		new Set(initialPages.flatMap((page) => page.tags).filter(Boolean)),
	).sort((left, right) => left.localeCompare(right));

	const draftCount = initialPages.filter(
		(page) => page.status === "draft",
	).length;
	const stableCount = initialPages.filter(
		(page) => page.status === "stable",
	).length;
	const archivedCount = initialPages.filter(
		(page) => page.status === "archived",
	).length;

	const filteredPages = initialPages.filter((page) => {
		const matchesSearch =
			page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			page.path.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || page.status === statusFilter;
		const matchesSource =
			sourceFilter === "all" || page.source === sourceFilter;
		const matchesTag = tagsFilter === "all" || page.tags.includes(tagsFilter);

		return matchesSearch && matchesStatus && matchesSource && matchesTag;
	});

	return (
		<PageChrome
			className="space-y-5"
			eyebrow="Workspace / spaces"
			title={space.name}
			description="Browse this space by path, filter the working set, and jump straight into review or editing without leaving the shared workspace shell."
			breadcrumbs={[
				{ label: "Workspace", href: "/" },
				{ label: "Spaces", href: "/spaces" },
				{ label: space.name },
			]}
			topBarTitle={space.name}
			actions={
				<>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setTreeOpen((open) => !open)}
						className="text-muted-foreground"
					>
						{treeOpen ? (
							<PanelLeftClose className="size-4" />
						) : (
							<PanelLeftOpen className="size-4" />
						)}
						{treeOpen ? "Hide tree" : "Show tree"}
					</Button>
					<div className="flex items-center rounded-md border border-[color:var(--border-subtle)] bg-surface-2 p-1 shadow-[var(--shadow-xs)]">
						<Button
							variant={viewMode === "list" ? "secondary" : "ghost"}
							size="icon-xs"
							onClick={() => setViewMode("list")}
							aria-label="Show list view"
							aria-pressed={viewMode === "list"}
						>
							<List className="size-3.5" />
						</Button>
						<Button
							variant={viewMode === "board" ? "secondary" : "ghost"}
							size="icon-xs"
							onClick={() => setViewMode("board")}
							aria-label="Show board view"
							aria-pressed={viewMode === "board"}
						>
							<Kanban className="size-3.5" />
						</Button>
					</div>
					<Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
						<Plus className="size-4" />
						New page
					</Button>
				</>
			}
		>
			<Card className="overflow-hidden bg-card/95">
				<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1">
						<p className="text-[14px] font-medium text-foreground">
							Keep local structure close to the collection
						</p>
						<p className="text-[13px] text-muted-foreground">
							The tree stays nearby for path-based browsing while list and board
							views stay aligned with the rest of Foundry.
						</p>
					</div>
					<div className="flex flex-wrap gap-2 text-[12px] text-muted-foreground">
						<Badge variant="secondary">{initialPages.length} pages</Badge>
						<Badge variant="secondary">{draftCount} drafts</Badge>
						<Badge variant="outline">{stableCount} stable</Badge>
						{archivedCount > 0 ? (
							<Badge variant="outline">{archivedCount} archived</Badge>
						) : null}
					</div>
				</CardContent>
			</Card>

			<Card className="overflow-hidden bg-card/95">
				<CardHeader className="gap-4 border-b border-[color:var(--border-subtle)] pb-4">
					<div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<CardTitle>Browse pages in this space</CardTitle>
							<CardDescription>
								Search by title or path, then narrow the view by status, source,
								or tag.
							</CardDescription>
						</div>
						<p className="text-[12px] text-muted-foreground">
							{filteredPages.length} of {initialPages.length} pages shown
						</p>
					</div>
					<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
						<div className="relative flex-1 xl:max-w-sm">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search page titles or paths..."
								className="pl-9"
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-[148px]">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Any status</SelectItem>
									<SelectItem value="draft">Draft</SelectItem>
									<SelectItem value="stable">Stable</SelectItem>
									<SelectItem value="archived">Archived</SelectItem>
								</SelectContent>
							</Select>
							<Select value={sourceFilter} onValueChange={setSourceFilter}>
								<SelectTrigger className="w-[148px]">
									<SelectValue placeholder="Source" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Any source</SelectItem>
									<SelectItem value="human">Human</SelectItem>
									<SelectItem value="agent">Agent</SelectItem>
								</SelectContent>
							</Select>
							<Select value={tagsFilter} onValueChange={setTagsFilter}>
								<SelectTrigger className="w-[148px]">
									<SelectValue placeholder="Tag" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Any tag</SelectItem>
									{uniqueTags.map((tag) => (
										<SelectItem key={tag} value={tag}>
											{tag}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
			</Card>

			<section
				className={cn(
					"grid gap-4",
					treeOpen ? "xl:grid-cols-[280px_minmax(0,1fr)]" : "grid-cols-1",
				)}
			>
				{treeOpen ? (
					<Card className="overflow-hidden bg-card/95 xl:sticky xl:top-24 xl:self-start">
						<CardHeader className="gap-2 border-b border-[color:var(--border-subtle)] pb-4">
							<div className="flex items-start justify-between gap-3">
								<div>
									<CardTitle className="flex items-center gap-2">
										<FolderGit2 className="size-4 text-[color:var(--text-muted)]" />
										Page tree
									</CardTitle>
									<CardDescription>
										Browse this space by path and open any page directly.
									</CardDescription>
								</div>
								<Badge variant="outline">{initialPages.length}</Badge>
							</div>
						</CardHeader>
						<CardContent className="max-h-[70vh] overflow-y-auto p-3">
							<SpacePageTree pages={initialPages} />
						</CardContent>
					</Card>
				) : null}

				<div className="min-w-0">
					{viewMode === "list" ? (
						<SpacePageList pages={filteredPages} />
					) : (
						<SpaceKanbanView pages={filteredPages} />
					)}
				</div>
			</section>

			<CreatePageDialog
				spaceId={space.id}
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
			/>
		</PageChrome>
	);
}
