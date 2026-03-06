"use client";

import { Book, Folder, FolderGit2, LayoutGrid, List, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CreateSpaceDialog } from "@/components/create-space-dialog";

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
		// Refresh spaces list
		try {
			const response = await fetch("/api/spaces");
			if (response.ok) {
				await response.json();
				// We need to fetch the counts too, but the API might not return them by default.
				// For now, we can just append the new space or refresh the page.
				// Let's just refresh the page to get the server-rendered data again.
				window.location.reload();
			}
		} catch (error) {
			console.error("Failed to refresh spaces:", error);
		}
	};

	const renderIcon = (iconName: string) => {
		switch (iconName) {
			case "FolderGit2":
				return (
					<FolderGit2 className="size-5 text-[color:var(--text-secondary)]" />
				);
			case "Book":
				return <Book className="size-5 text-[color:var(--text-secondary)]" />;
			default:
				return <Folder className="size-5 text-[color:var(--text-secondary)]" />;
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Spaces</h1>
					<p className="text-sm text-[color:var(--text-secondary)]">
						Manage your documentation spaces and projects.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="flex items-center rounded-lg border border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.5)] p-1">
						<Button
							variant="ghost"
							size="icon"
							className={`h-8 w-8 rounded-md ${viewMode === "grid" ? "bg-[color:rgba(255,255,255,0.1)]" : ""}`}
							onClick={() => setViewMode("grid")}
						>
							<LayoutGrid className="size-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className={`h-8 w-8 rounded-md ${viewMode === "list" ? "bg-[color:rgba(255,255,255,0.1)]" : ""}`}
							onClick={() => setViewMode("list")}
						>
							<List className="size-4" />
						</Button>
					</div>
					<Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
						<Plus className="size-4" />
						Create space
					</Button>
				</div>
			</div>

			{spaces.length === 0 ? (
				<div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.3)] text-center">
					<div className="flex size-12 items-center justify-center rounded-full bg-[color:rgba(255,255,255,0.05)] mb-4">
						<Folder className="size-6 text-[color:var(--text-muted)]" />
					</div>
					<h3 className="text-lg font-medium">No spaces yet</h3>
					<p className="mt-1 text-sm text-[color:var(--text-secondary)] max-w-sm">
						Create your first space to start organizing your documentation and
						runbooks.
					</p>
					<Button
						onClick={() => setIsCreateDialogOpen(true)}
						className="mt-6 gap-2"
					>
						<Plus className="size-4" />
						Create space
					</Button>
				</div>
			) : (
				<div
					className={
						viewMode === "grid"
							? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
							: "flex flex-col gap-3"
					}
				>
					{spaces.map((space) => (
						<Link key={space.id} href={`/spaces/${space.slug}`}>
							<Card className="h-full transition-colors hover:bg-[color:rgba(255,255,255,0.02)]">
								<CardHeader
									className={
										viewMode === "list"
											? "flex flex-row items-center gap-4 py-4"
											: ""
									}
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex items-center gap-3">
											<div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color:var(--border-subtle)] bg-[color:rgba(10,15,24,0.86)]">
												{renderIcon(space.icon)}
											</div>
											<div>
												<CardTitle className="text-base">
													{space.name}
												</CardTitle>
												{viewMode === "list" && space.description && (
													<CardDescription className="mt-1 line-clamp-1">
														{space.description}
													</CardDescription>
												)}
											</div>
										</div>
										<Badge variant="secondary" className="capitalize">
											{space.kind}
										</Badge>
									</div>
									{viewMode === "grid" && space.description && (
										<CardDescription className="mt-3 line-clamp-2">
											{space.description}
										</CardDescription>
									)}
								</CardHeader>
								{viewMode === "grid" && (
									<CardContent>
										<div className="flex items-center gap-4 text-sm text-[color:var(--text-muted)]">
											<div className="flex items-center gap-1.5">
												<Book className="size-3.5" />
												<span>{space._count?.pages || 0} pages</span>
											</div>
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
		</div>
	);
}
