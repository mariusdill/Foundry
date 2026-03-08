"use client";

import { Book, Folder, FolderGit2, LayoutGrid, List, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreateSpaceDialog } from "@/components/create-space-dialog";
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

export function SpacesClient({ initialSpaces }: SpacesClientProps) {
	const [spaces] = useState<Space[]>(initialSpaces);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
		<div className="space-y-5">
			<header className="flex items-start justify-between gap-4 border-b border-[color:var(--border-subtle)] pb-5">
				<div>
					<p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
						Workspace / spaces
					</p>
					<h2 className="mt-1 text-[20px] font-medium tracking-tight text-foreground">
						Spaces
					</h2>
					<p className="text-[13px] text-muted-foreground">
						Manage documentation spaces and project surfaces.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<div className="flex items-center rounded-md border border-[color:var(--border-subtle)] bg-surface-2 p-1">
						<Button
							variant={viewMode === "grid" ? "secondary" : "ghost"}
							size="icon-xs"
							onClick={() => setViewMode("grid")}
						>
							<LayoutGrid className="size-3.5" />
						</Button>
						<Button
							variant={viewMode === "list" ? "secondary" : "ghost"}
							size="icon-xs"
							onClick={() => setViewMode("list")}
						>
							<List className="size-3.5" />
						</Button>
					</div>
					<Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
						<Plus className="size-4" />
						Create space
					</Button>
				</div>
			</header>

			{spaces.length === 0 ? (
				<Card>
					<CardContent className="flex min-h-[280px] flex-col items-center justify-center text-center">
						<div className="mb-4 flex size-10 items-center justify-center rounded-md bg-surface-2 text-muted-foreground">
							<Folder className="size-4" />
						</div>
						<p className="text-[15px] font-medium text-foreground">
							No spaces yet
						</p>
						<p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
							Create your first space to organize runbooks and project
							knowledge.
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
							: "space-y-3"
					}
				>
					{spaces.map((space) => (
						<Link key={space.id} href={`/spaces/${space.id}`}>
							<Card className="h-full transition-colors hover:bg-surface-2">
								<CardHeader
									className={viewMode === "list" ? "pb-3" : undefined}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex items-start gap-3">
											<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-2">
												{renderIcon(space.icon)}
											</div>
											<div className="min-w-0">
												<CardTitle className="truncate">{space.name}</CardTitle>
												{space.description ? (
													<CardDescription className="mt-1 line-clamp-2">
														{space.description}
													</CardDescription>
												) : null}
											</div>
										</div>
										<Badge variant="secondary">{space.kind}</Badge>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<p className="text-[12px] text-muted-foreground">
										{space._count?.pages || 0} pages
									</p>
								</CardContent>
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
		</div>
	);
}
