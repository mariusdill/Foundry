"use client";

import { formatDistanceToNow } from "date-fns";
import {
	Archive,
	CheckCircle2,
	Clock,
	Edit,
	MoreHorizontal,
	Pin,
	PinOff,
	Upload,
	User,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

type PageData = {
	id: string;
	title: string;
	status: "draft" | "stable" | "archived";
	source: "human" | "agent";
	pinned: boolean;
	tags: string[];
	updatedAt: string;
	updatedBy?: { name: string | null; email: string | null };
	space: { id: string; name: string; slug: string };
	markdown: string;
};

export function PageClient({ id }: { id: string }) {
	const [page, setPage] = useState<PageData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchPage() {
			try {
				const res = await fetch(`/api/pages/${id}`);
				if (!res.ok) {
					if (res.status === 404) {
						notFound();
					}
					throw new Error("Failed to fetch page");
				}
				const data = await res.json();
				setPage(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		}

		fetchPage();
	}, [id]);

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
			{/* Main Content Area */}
			<div className="min-w-0 flex-1 space-y-6">
				{/* Header Section */}
				<div className="space-y-3 border-b border-[color:var(--border-subtle)] pb-5">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href={`/spaces/${page.space.id}`}>
										{page.space.name}
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{page.title}</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>

					<div className="flex items-start justify-between gap-4">
						<h1 className="break-words text-[28px] font-medium tracking-tight text-foreground">
							{page.title}
						</h1>

						<div className="flex items-center gap-2 shrink-0">
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
									<Edit className="h-4 w-4 mr-2" />
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
											<Upload className="h-4 w-4 mr-2" />
											Promote to Stable
										</DropdownMenuItem>
									)}
									{page.status !== "archived" && (
										<>
											<DropdownMenuSeparator />
											<DropdownMenuItem className="text-destructive focus:text-destructive">
												<Archive className="h-4 w-4 mr-2" />
												Archive
											</DropdownMenuItem>
										</>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

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
				</div>

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

				{/* Main Content Area */}
				<MarkdownPreview content={page.markdown || ""} />
			</div>

			{/* Right Rail (Optional for v1) */}
			<div className="w-full shrink-0 space-y-4 lg:w-72">
				<Tabs defaultValue="history" className="w-full">
					<TabsList className="w-full grid grid-cols-3">
						<TabsTrigger value="history">History</TabsTrigger>
						<TabsTrigger value="audit">Audit</TabsTrigger>
						<TabsTrigger value="files">Files</TabsTrigger>
					</TabsList>
					<TabsContent
						value="history"
						className="mt-2 rounded-md border border-[color:var(--border-subtle)] bg-surface-2 p-4 text-center text-[13px] text-muted-foreground"
					>
						History placeholder
					</TabsContent>
					<TabsContent
						value="audit"
						className="mt-2 rounded-md border border-[color:var(--border-subtle)] bg-surface-2 p-4 text-center text-[13px] text-muted-foreground"
					>
						Audit placeholder
					</TabsContent>
					<TabsContent
						value="files"
						className="mt-2 rounded-md border border-[color:var(--border-subtle)] bg-surface-2 p-4 text-center text-[13px] text-muted-foreground"
					>
						Attachments placeholder
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
