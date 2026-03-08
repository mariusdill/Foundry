"use client";

import type { Page, Space, User } from "@foundry/database";
import {
	ChevronRight,
	FolderGit2,
	Kanban,
	List,
	PanelLeftClose,
	PanelLeftOpen,
	Plus,
	Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CreatePageDialog } from "./create-page-dialog";
import { KanbanView } from "./kanban-view";
import { PageList } from "./page-list";
import { PageTree } from "./page-tree";

type PageWithUser = Page & { updatedBy: User | null };

interface SpaceViewProps {
	space: Space;
	initialPages: PageWithUser[];
}

export function SpaceView({ space, initialPages }: SpaceViewProps) {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [sourceFilter, setSourceFilter] = useState<string>("all");
	const [tagsFilter, setTagsFilter] = useState<string>("all");
	const [viewMode, setViewMode] = useState<"list" | "board">("list");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const uniqueTags = Array.from(
		new Set(initialPages.flatMap((page) => page.tags).filter(Boolean)),
	).sort((left, right) => left.localeCompare(right));

	// Filter pages
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
		<div className="flex min-h-[calc(100vh-8rem)] overflow-hidden rounded-[14px] border border-[color:var(--border-subtle)] bg-surface-1 shadow-[0_1px_0_rgba(255,255,255,0.02)]">
			{/* Sidebar */}
			<div
				className={`flex flex-col border-r border-[color:var(--border-subtle)] bg-[color:rgba(255,255,255,0.02)] transition-all duration-300 ease-in-out ${
					sidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"
				}`}
			>
				<div className="flex items-center justify-between border-b border-[color:var(--border-subtle)] px-4 py-3.5">
					<div className="flex items-center gap-2 truncate text-[13px] font-medium text-foreground">
						<FolderGit2 className="h-4 w-4 shrink-0" />
						<span className="truncate">{space.name}</span>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto p-2">
					<PageTree pages={initialPages} spaceId={space.id} />
				</div>
			</div>

			{/* Main Content */}
			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				{/* Header */}
				<header className="flex h-14 shrink-0 items-center justify-between border-b border-[color:var(--border-subtle)] bg-[color:rgba(255,255,255,0.02)] px-4">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setSidebarOpen(!sidebarOpen)}
							className="text-muted-foreground hover:text-foreground"
						>
							{sidebarOpen ? (
								<PanelLeftClose className="h-4 w-4" />
							) : (
								<PanelLeftOpen className="h-4 w-4" />
							)}
						</Button>

						<div className="flex items-center text-[13px] text-muted-foreground">
							<Link
								href="/spaces"
								className="hover:text-foreground transition-colors"
							>
								Spaces
							</Link>
							<ChevronRight className="h-4 w-4 mx-1" />
							<span className="text-foreground font-medium">{space.name}</span>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<div className="flex items-center rounded-md border border-[color:var(--border-subtle)] bg-surface-2 p-1 mr-2">
							<Button
								variant={viewMode === "list" ? "secondary" : "ghost"}
								size="icon-xs"
								onClick={() => setViewMode("list")}
								aria-label="Show list view"
								aria-pressed={viewMode === "list"}
							>
								<List className="h-4 w-4" />
							</Button>
							<Button
								variant={viewMode === "board" ? "secondary" : "ghost"}
								size="icon-xs"
								onClick={() => setViewMode("board")}
								aria-label="Show board view"
								aria-pressed={viewMode === "board"}
							>
								<Kanban className="h-4 w-4" />
							</Button>
						</div>
						<Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
							<Plus className="h-4 w-4 mr-2" />
							New Page
						</Button>
					</div>
				</header>

				{/* Content Area */}
				<main className="flex-1 overflow-y-auto p-6">
					<div className="mx-auto max-w-6xl space-y-5">
						<div className="flex flex-col items-start justify-between gap-4 border-b border-[color:var(--border-subtle)] pb-5 sm:flex-row sm:items-center">
							<div>
								<p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
									Space / {space.name}
								</p>
								<h1 className="mt-1 text-[20px] font-medium tracking-tight text-foreground">
									Pages
								</h1>
								<p className="mt-2 max-w-2xl text-[13px] text-muted-foreground">
									Browse and filter every page in this space, then jump straight
									into review or editing.
								</p>
							</div>

							<div className="flex w-full items-center gap-2 sm:w-auto">
								<div className="relative w-full sm:w-64">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search pages..."
										className="pl-9"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
								</div>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-[130px] bg-surface-2">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="draft">Draft</SelectItem>
										<SelectItem value="stable">Stable</SelectItem>
										<SelectItem value="archived">Archived</SelectItem>
									</SelectContent>
								</Select>

								<Select value={sourceFilter} onValueChange={setSourceFilter}>
									<SelectTrigger className="w-[130px] bg-surface-2">
										<SelectValue placeholder="Source" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Sources</SelectItem>
										<SelectItem value="human">Human</SelectItem>
										<SelectItem value="agent">Agent</SelectItem>
									</SelectContent>
								</Select>

								<Select value={tagsFilter} onValueChange={setTagsFilter}>
									<SelectTrigger className="w-[130px] bg-surface-2">
										<SelectValue placeholder="Tags" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Tags</SelectItem>
										{uniqueTags.map((tag) => (
											<SelectItem key={tag} value={tag}>
												{tag}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{viewMode === "list" ? (
							<PageList pages={filteredPages} />
						) : (
							<KanbanView pages={filteredPages} />
						)}
					</div>
				</main>
			</div>

			<CreatePageDialog
				spaceId={space.id}
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
			/>
		</div>
	);
}
