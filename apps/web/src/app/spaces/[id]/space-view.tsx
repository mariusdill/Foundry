"use client";

import type { Page, Space, User } from "@foundry/database";
import {
	ChevronRight,
	FolderGit2,
	PanelLeftClose,
	PanelLeftOpen,
	Plus,
	Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreatePageDialog } from "./create-page-dialog";
import { PageList } from "./page-list";
import { PageTree } from "./page-tree";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	// Filter pages
	const filteredPages = initialPages.filter((page) => {
		const matchesSearch =
			page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			page.path.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || page.status === statusFilter;
		const matchesSource =
			sourceFilter === "all" || page.source === sourceFilter;
		const matchesTags =
			tagsFilter === "all" || page.tags?.includes(tagsFilter);
		return matchesSearch && matchesStatus && matchesSource && matchesTags;
	});
	const uniqueTags = Array.from(
		new Set(initialPages.flatMap((p) => p.tags || [])),
	);

	return (
		<div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
			{/* Sidebar */}
			<div
				className={`border-r border-border transition-all duration-300 ease-in-out flex flex-col ${
					sidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"
				}`}
			>
				<div className="p-4 border-b border-border flex items-center justify-between">
					<div className="flex items-center gap-2 font-semibold truncate">
						<FolderGit2 className="h-4 w-4 shrink-0" />
						<span className="truncate">{space.name}</span>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto p-2">
					<PageTree pages={initialPages} spaceId={space.id} />
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				{/* Header */}
				<header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
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

						<div className="flex items-center text-sm text-muted-foreground">
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
						<Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
							<Plus className="h-4 w-4 mr-2" />
							New Page
						</Button>
					</div>
				</header>

				{/* Content Area */}
				<main className="flex-1 overflow-y-auto p-6">
					<div className="max-w-6xl mx-auto space-y-6">
						<div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
							<h1 className="text-2xl font-bold tracking-tight">Pages</h1>

							<div className="flex items-center gap-2 w-full sm:w-auto">
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
									<SelectTrigger className="w-[130px]">
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
									<SelectTrigger className="w-[130px]">
										<SelectValue placeholder="Source" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Sources</SelectItem>
										<SelectItem value="human">Human</SelectItem>
										<SelectItem value="agent">Agent</SelectItem>
									</SelectContent>
								</Select>

								<Select value={tagsFilter} onValueChange={setTagsFilter}>
									<SelectTrigger className="w-[130px]">
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

						<PageList pages={filteredPages} spaceId={space.id} />
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
