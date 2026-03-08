"use client";

import { Book, Folder, FolderGit2, LayoutGrid, List, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CreateSpaceDialog } from "@/components/create-space-dialog";
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

type Space = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	icon: string;
	kind: "runbooks" | "projects";
	_count?: {
		pages: number;
	};
};

interface SpacesClientProps {
	initialSpaces: Space[];
}

function getPageLabel(count: number) {
	return `${count} page${count === 1 ? "" : "s"}`;
}

export function SpacesClient({ initialSpaces }: SpacesClientProps) {
	const [spaces] = useState<Space[]>(initialSpaces);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const runbookCount = spaces.filter(
		(space) => space.kind === "runbooks",
	).length;
	const projectCount = spaces.length - runbookCount;
	const totalPages = spaces.reduce(
		(count, space) => count + (space._count?.pages || 0),
		0,
	);

	const handleSpaceCreated = async () => {
		window.location.reload();
	};

	const renderIcon = (iconName: string) => {
		switch (iconName) {
			case "FolderGit2":
				return <FolderGit2 className="size-4 text-secondary" />;
			case "Book":
				return <Book className="size-4 text-secondary" />;
			default:
				return <Folder className="size-4 text-secondary" />;
		}
	};

	return (
		<PageChrome
			className="space-y-5"
			eyebrow="Workspace / spaces"
			title="Durable work areas for runbooks and projects"
			description={`${spaces.length} spaces holding pages, drafts, and recent work across runbooks and projects.`}
			actions={
				<>
					<div className="flex items-center rounded-md border border-[color:var(--border-subtle)] bg-surface-2 p-1 shadow-[var(--shadow-xs)]">
						<Button
							variant={viewMode === "grid" ? "secondary" : "ghost"}
							size="icon-xs"
							onClick={() => setViewMode("grid")}
							aria-label="Show grid view"
							aria-pressed={viewMode === "grid"}
						>
							<LayoutGrid className="size-3.5" />
						</Button>
						<Button
							variant={viewMode === "list" ? "secondary" : "ghost"}
							size="icon-xs"
							onClick={() => setViewMode("list")}
							aria-label="Show list view"
							aria-pressed={viewMode === "list"}
						>
							<List className="size-3.5" />
						</Button>
					</div>
					<Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
						<Plus className="size-4" />
						Create space
					</Button>
				</>
			}
		>
			<Card className="overflow-hidden bg-card/95">
				<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1">
						<p className="text-[14px] font-medium text-foreground">
							Spaces keep runbooks and project pages in one place
						</p>
						<p className="text-[13px] text-muted-foreground">
							Each space keeps related pages and drafts together without
							changing the grid, list, or create-space flow.
						</p>
					</div>
					<div className="flex flex-wrap gap-2 text-[12px] text-muted-foreground">
						<Badge variant="secondary">{runbookCount} runbooks</Badge>
						<Badge variant="secondary">{projectCount} projects</Badge>
						<Badge variant="outline">
							{totalPages} page{totalPages === 1 ? "" : "s"}
						</Badge>
					</div>
				</CardContent>
			</Card>

			{spaces.length === 0 ? (
				<Card className="overflow-hidden bg-card/95">
					<CardContent className="flex min-h-[280px] flex-col items-center justify-center text-center">
						<div className="mb-4 flex size-10 items-center justify-center rounded-md bg-surface-2 text-muted-foreground">
							<Folder className="size-4" />
						</div>
						<p className="text-[15px] font-medium text-foreground">
							No spaces yet
						</p>
						<p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
							Create your first space to hold runbooks or project pages.
						</p>
						<Button
							className="mt-5"
							onClick={() => setIsCreateDialogOpen(true)}
						>
							<Plus className="size-4" />
							Create space
						</Button>
					</CardContent>
				</Card>
			) : (
				<div
					className={
						viewMode === "grid"
							? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
							: "space-y-2"
					}
				>
					{spaces.map((space) => (
						<Link key={space.id} href={`/spaces/${space.id}`}>
							<Card
								className={
									viewMode === "grid"
										? "h-full overflow-hidden bg-card/95 transition-colors hover:bg-surface-2/80"
										: "overflow-hidden bg-card/95 transition-colors hover:bg-surface-2/80"
								}
							>
								{viewMode === "grid" ? (
									<>
										<CardHeader className="gap-4 pb-3">
											<div className="flex items-start justify-between gap-3">
												<div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-[color:var(--border-subtle)] bg-surface-2">
													{renderIcon(space.icon)}
												</div>
												<Badge variant="secondary">{space.kind}</Badge>
											</div>
											<div className="space-y-1">
												<CardTitle className="truncate">{space.name}</CardTitle>
												<CardDescription className="line-clamp-2 min-h-10">
													{space.description || "No description provided yet."}
												</CardDescription>
											</div>
										</CardHeader>
										<CardContent className="flex items-center justify-between gap-3 border-t border-[color:var(--border-subtle)] pt-3 text-[12px] text-muted-foreground">
											<span>{getPageLabel(space._count?.pages || 0)}</span>
											<span className="text-[color:var(--text-muted)]">
												Open space
											</span>
										</CardContent>
									</>
								) : (
									<CardContent className="flex items-center justify-between gap-4 p-4">
										<div className="flex min-w-0 items-center gap-3">
											<div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-[color:var(--border-subtle)] bg-surface-2">
												{renderIcon(space.icon)}
											</div>
											<div className="min-w-0">
												<div className="flex flex-wrap items-center gap-2">
													<CardTitle className="truncate">
														{space.name}
													</CardTitle>
													<Badge variant="secondary">{space.kind}</Badge>
												</div>
												<CardDescription className="mt-1 truncate">
													{space.description || "No description provided yet."}
												</CardDescription>
											</div>
										</div>
										<div className="shrink-0 text-right text-[12px] text-muted-foreground">
											<p>{getPageLabel(space._count?.pages || 0)}</p>
											<p className="mt-1 text-[11px] text-[color:var(--text-muted)]">
												Open space
											</p>
										</div>
									</CardContent>
								)}
							</Card>
						</Link>
					))}
				</div>
			)}

			<CreateSpaceDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onSuccess={handleSpaceCreated}
			/>
		</PageChrome>
	);
}
