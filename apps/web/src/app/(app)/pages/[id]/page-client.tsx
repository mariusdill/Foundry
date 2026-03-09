"use client";

import { formatDistanceToNow } from "date-fns";
import {
	Archive,
	CheckCircle2,
	Clock,
	Edit,
	FileStack,
	MoreHorizontal,
	Paperclip,
	Pin,
	PinOff,
	Shield,
	Upload,
	User,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BacklinksSection } from "@/components/backlinks-section";
import { MarkdownPreview } from "@/components/markdown-preview";
import { PageAuditStream } from "@/components/page-audit-stream";
import { PageChrome } from "@/components/page-chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { VersionList } from "@/components/version-list";

type PageData = {
	id: string;
	title: string;
	status: "draft" | "stable" | "archived";
	source: "human" | "agent";
	pinned: boolean;
	tags: string[];
	path: string;
	updatedAt: string;
	updatedBy?: { name: string | null; email: string | null };
	space: { id: string; name: string; slug: string };
	markdown: string;
};

type Backlink = {
	id: string;
	title: string;
	path: string;
	status: string;
	space: { name: string };
};

export function PageClient({ id }: { id: string }) {
	const [page, setPage] = useState<PageData | null>(null);
	const [backlinks, setBacklinks] = useState<Backlink[]>([]);
	const [spacePages, setSpacePages] = useState<
		Array<{ id: string; title: string }>
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const fetchPage = useCallback(
		async (showLoading = false) => {
			try {
				if (showLoading) {
					setLoading(true);
				}

				setError(null);

				const res = await fetch(`/api/pages/${id}`);
				if (!res.ok) {
					if (res.status === 404) {
						notFound();
					}
					throw new Error("Failed to fetch page");
				}

				const data = await res.json();
				setPage(data);

				const backlinksRes = await fetch(`/api/pages/${id}/backlinks`);
				if (backlinksRes.ok) {
					const backlinksData = await backlinksRes.json();
					setBacklinks(backlinksData);
				}

				const spacePagesRes = await fetch(
					`/api/pages?spaceId=${data.space.id}&limit=100`,
				);
				if (spacePagesRes.ok) {
					const spacePagesData = await spacePagesRes.json();
					setSpacePages(
						spacePagesData.pages?.map((p: PageData) => ({
							id: p.id,
							title: p.title,
						})) || [],
					);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				if (showLoading) {
					setLoading(false);
				}
			}
		},
		[id],
	);

	useEffect(() => {
		void fetchPage(true);
	}, [fetchPage]);

	const togglePin = async () => {
		if (!page) return;

		// Optimistic update
		setPage({ ...page, pinned: !page.pinned });

		try {
			await fetch(`/api/pages/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ pinned: !page.pinned }),
			});
		} catch (error) {
			// Revert on error
			setPage({ ...page, pinned: page.pinned });
			console.error("Failed to toggle pin:", error);
		}
	};

	// Function to resolve wiki link titles to page IDs
	const getPageIdByTitle = useCallback(
		(title: string): string | undefined => {
			const found = spacePages.find(
				(p) => p.title.toLowerCase() === title.toLowerCase(),
			);
			return found?.id;
		},
		[spacePages],
	);

	const handleRevert = useCallback(
		async (versionId: string) => {
			if (
				!window.confirm(
					"Restore this version and replace the current page content?",
				)
			) {
				return;
			}

			try {
				setActionError(null);

				const response = await fetch(`/api/pages/${id}/revert`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ versionId }),
				});

				if (!response.ok) {
					const payload = (await response.json().catch(() => null)) as {
						error?: string;
					} | null;
					throw new Error(payload?.error || "Failed to restore version");
				}

				await fetchPage();
			} catch (err) {
				setActionError(
					err instanceof Error ? err.message : "Failed to restore version",
				);
			}
		},
		[fetchPage, id],
	);

	if (loading) {
		return (
			<div className="container mx-auto max-w-5xl py-8 space-y-8">
				<div className="space-y-4">
					<Skeleton className="h-4 w-64" />
					<Skeleton className="h-12 w-3/4" />
					<div className="flex gap-2">
						<Skeleton className="h-6 w-16" />
						<Skeleton className="h-6 w-16" />
					</div>
				</div>
				<Skeleton className="h-px w-full" />
				<div className="space-y-4">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>
			</div>
		);
	}

	if (error || !page) {
		return (
			<div className="container mx-auto max-w-5xl py-8">
				<div className="bg-destructive/10 text-destructive p-4 rounded-md">
					{error || "Page not found"}
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
			<div className="min-w-0 flex-1 space-y-6">
				<PageChrome
					eyebrow="Page workspace"
					title={page.title}
					description="Read the current page, inspect recent changes, and move into editing without losing context."
					titleClassName="text-[28px] sm:text-[28px]"
					breadcrumbs={[
						{ label: "Workspace", href: "/" },
						{ label: page.space.name, href: `/spaces/${page.space.id}` },
						{ label: page.title },
					]}
					topBarTitle={page.title}
					actions={
						<>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										onClick={togglePin}
										className={
											page.pinned ? "text-primary" : "text-muted-foreground"
										}
									>
										{page.pinned ? (
											<Pin className="h-5 w-5 fill-current" />
										) : (
											<PinOff className="h-5 w-5" />
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									{page.pinned ? "Unpin page" : "Pin page"}
								</TooltipContent>
							</Tooltip>

							<Button variant="outline" size="sm" asChild>
								<Link href={`/pages/${id}/edit`}>
									<Edit className="mr-2 h-4 w-4" />
									Edit
								</Link>
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreHorizontal className="h-5 w-5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{page.status === "draft" && (
										<DropdownMenuItem>
											<Upload className="mr-2 h-4 w-4" />
											Promote to Stable
										</DropdownMenuItem>
									)}
									{page.status !== "archived" && (
										<>
											<DropdownMenuSeparator />
											<DropdownMenuItem className="text-destructive focus:text-destructive">
												<Archive className="mr-2 h-4 w-4" />
												Archive
											</DropdownMenuItem>
										</>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					}
				>
					<div className="flex flex-wrap items-center gap-2">
						<Badge
							variant={
								page.status === "draft"
									? "draft"
									: page.status === "stable"
										? "stable"
										: "archived"
							}
						>
							{page.status}
						</Badge>
						<Badge
							variant={page.source === "agent" ? "agent" : "human"}
							className="capitalize"
						>
							{page.source}
						</Badge>
						{page.tags?.map((tag) => (
							<Badge key={tag} variant="outline">
								#{tag}
							</Badge>
						))}
					</div>
				</PageChrome>

				{actionError ? (
					<div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-[13px] text-destructive">
						{actionError}
					</div>
				) : null}

				<div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[10px] border border-[color:var(--border-subtle)] bg-surface-2 px-4 py-3 text-[13px] text-muted-foreground">
					<div className="flex items-center gap-1.5">
						<Clock className="h-4 w-4" />
						<span>
							Updated{" "}
							{formatDistanceToNow(new Date(page.updatedAt), {
								addSuffix: true,
							})}
						</span>
					</div>

					{page.updatedBy && (
						<div className="flex items-center gap-1.5">
							<User className="h-4 w-4" />
							<span>
								By {page.updatedBy.name || page.updatedBy.email || "Unknown"}
							</span>
						</div>
					)}

					{page.status === "stable" && (
						<div className="flex items-center gap-1.5 text-emerald-500/80">
							<CheckCircle2 className="h-4 w-4" />
							<span>Verified</span>
						</div>
					)}
				</div>

				<Separator />

				<MarkdownPreview
					content={page.markdown || ""}
					getPageIdByTitle={getPageIdByTitle}
				/>

				<BacklinksSection backlinks={backlinks} />
			</div>

			<div className="w-full shrink-0 space-y-4 lg:sticky lg:top-24 lg:w-80 lg:self-start">
				<Tabs defaultValue="history" className="w-full">
					<TabsList className="grid w-full grid-cols-3 rounded-[10px] bg-surface-2/80 p-1">
						<TabsTrigger value="history" className="text-xs">
							<FileStack className="h-3.5 w-3.5" />
							History
						</TabsTrigger>
						<TabsTrigger value="audit" className="text-xs">
							<Shield className="h-3.5 w-3.5" />
							Audit
						</TabsTrigger>
						<TabsTrigger value="files" className="text-xs">
							<Paperclip className="h-3.5 w-3.5" />
							Files
						</TabsTrigger>
					</TabsList>
					<TabsContent
						value="history"
						className="mt-2 space-y-3 rounded-[12px] border border-[color:var(--border-subtle)] bg-card/95 p-4"
					>
						<div className="space-y-1">
							<p className="text-[13px] font-medium text-foreground">
								Version history
							</p>
							<p className="text-[12px] leading-5 text-muted-foreground">
								Review saved revisions and restore an earlier draft when needed.
							</p>
						</div>
						<VersionList pageId={id} onRevert={handleRevert} />
					</TabsContent>
					<TabsContent
						value="audit"
						className="mt-2 space-y-3 rounded-[12px] border border-[color:var(--border-subtle)] bg-card/95 p-4"
					>
						<div className="space-y-1">
							<p className="text-[13px] font-medium text-foreground">
								Recent page activity
							</p>
							<p className="text-[12px] leading-5 text-muted-foreground">
								Track who changed this page, what happened, and when it landed.
							</p>
						</div>
						<PageAuditStream page={page} />
					</TabsContent>
					<TabsContent
						value="files"
						className="mt-2 rounded-[12px] border border-[color:var(--border-subtle)] bg-card/95 p-4"
					>
						<div className="rounded-[12px] border border-dashed border-[color:var(--border-strong)] bg-surface-2/60 px-4 py-8 text-center">
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-background/70">
								<Paperclip className="h-4 w-4 text-muted-foreground" />
							</div>
							<p className="mt-4 text-[13px] font-medium text-foreground">
								No page attachments
							</p>
							<p className="mt-2 text-[12px] leading-5 text-muted-foreground">
								This page is currently document-first. Files will show up here
								once they are attached to the page.
							</p>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
