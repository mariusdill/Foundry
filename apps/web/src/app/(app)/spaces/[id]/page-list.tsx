"use client";

import type { Page, User } from "@foundry/database";
import { formatDistanceToNow } from "date-fns";
import {
	Archive,
	Bot,
	Clock,
	FileEdit,
	MoreHorizontal,
	Pin,
	User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type PageWithUser = Page & { updatedBy: User | null };

interface PageListProps {
	pages: PageWithUser[];
}

export function PageList({ pages }: PageListProps) {
	const [sortConfig, setSortConfig] = useState<{
		key: keyof PageWithUser | "updatedBy";
		direction: "asc" | "desc";
	} | null>(null);

	const getComparableValue = (
		page: PageWithUser,
		key: keyof PageWithUser | "updatedBy",
	): string | number | boolean => {
		if (key === "updatedBy") {
			return page.updatedBy?.name || page.updatedBy?.email || "";
		}

		const value = page[key];

		if (Array.isArray(value)) {
			return value.join(", ");
		}

		if (value instanceof Date) {
			return value.getTime();
		}

		return value ?? "";
	};

	const sortedPages = [...pages].sort((a, b) => {
		if (!sortConfig) {
			return 0;
		}

		const { key, direction } = sortConfig;
		const aValue = getComparableValue(a, key);
		const bValue = getComparableValue(b, key);

		if (aValue < bValue) {
			return direction === "asc" ? -1 : 1;
		}

		if (aValue > bValue) {
			return direction === "asc" ? 1 : -1;
		}

		return 0;
	});

	const requestSort = (key: keyof PageWithUser | "updatedBy") => {
		let direction: "asc" | "desc" = "asc";

		if (
			sortConfig &&
			sortConfig.key === key &&
			sortConfig.direction === "asc"
		) {
			direction = "desc";
		}

		setSortConfig({ key, direction });
	};

	if (pages.length === 0) {
		return (
			<Card className="overflow-hidden bg-card/95">
				<CardContent className="flex flex-col items-center justify-center py-14 text-center">
					<div className="mb-4 flex size-10 items-center justify-center rounded-md bg-surface-2 text-muted-foreground">
						<FileEdit className="size-4" />
					</div>
					<p className="text-[15px] font-medium text-foreground">
						No pages found
					</p>
					<p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
						Try a different filter or create a new page in this space.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card className="hidden overflow-hidden bg-card/95 md:block">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							<TableHead
								className="cursor-pointer px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)] hover:bg-muted/50"
								onClick={() => requestSort("title")}
							>
								Page
							</TableHead>
							<TableHead
								className="cursor-pointer px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)] hover:bg-muted/50"
								onClick={() => requestSort("path")}
							>
								Path
							</TableHead>
							<TableHead
								className="cursor-pointer px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)] hover:bg-muted/50"
								onClick={() => requestSort("status")}
							>
								Status
							</TableHead>
							<TableHead
								className="cursor-pointer px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)] hover:bg-muted/50"
								onClick={() => requestSort("source")}
							>
								Source
							</TableHead>
							<TableHead
								className="cursor-pointer px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)] hover:bg-muted/50"
								onClick={() => requestSort("updatedAt")}
							>
								Updated
							</TableHead>
							<TableHead className="px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
								Tags
							</TableHead>
							<TableHead className="w-[56px] px-5" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedPages.map((page) => (
							<TableRow key={page.id} className="group">
								<TableCell className="px-5 py-4 whitespace-normal">
									<Link
										href={`/pages/${page.id}`}
										className="flex items-center gap-2 text-[15px] font-medium text-foreground hover:underline"
									>
										{page.pinned ? (
											<Pin className="size-3.5 text-muted-foreground" />
										) : null}
										{page.title}
									</Link>
								</TableCell>
								<TableCell className="px-5 py-4 align-top text-[12px] text-muted-foreground">
									{page.path}
								</TableCell>
								<TableCell className="px-5 py-4 align-top">
									<Badge variant={page.status}>{page.status}</Badge>
								</TableCell>
								<TableCell className="px-5 py-4 align-top">
									<div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
										{page.source === "agent" ? (
											<>
												<Bot className="size-3.5" /> Agent
											</>
										) : (
											<>
												<UserIcon className="size-3.5" /> Human
											</>
										)}
									</div>
								</TableCell>
								<TableCell className="px-5 py-4 align-top text-[12px] text-muted-foreground">
									<div className="space-y-1">
										<div className="flex items-center gap-1.5">
											<Clock className="size-3.5" />
											<span>
												{formatDistanceToNow(new Date(page.updatedAt), {
													addSuffix: true,
												})}
											</span>
										</div>
										{page.updatedBy ? (
											<p className="truncate text-[11px] text-[color:var(--text-muted)]">
												by {page.updatedBy.name || page.updatedBy.email}
											</p>
										) : null}
									</div>
								</TableCell>
								<TableCell className="px-5 py-4 align-top whitespace-normal">
									<div className="flex flex-wrap gap-1.5">
										{page.tags?.map((tag) => (
											<span
												key={tag}
												className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted-foreground"
											>
												#{tag}
											</span>
										))}
									</div>
								</TableCell>
								<TableCell className="px-5 py-4">
									<PageActions page={page} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>

			<div className="space-y-3 md:hidden">
				{sortedPages.map((page) => (
					<Card key={page.id} className="overflow-hidden bg-card/95">
						<CardContent className="space-y-3 p-4">
							<div className="space-y-2">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 space-y-2">
										<div className="flex flex-wrap items-center gap-2">
											<Link
												href={`/pages/${page.id}`}
												className="flex items-center gap-2 text-[15px] font-medium text-foreground hover:underline"
											>
												{page.pinned ? (
													<Pin className="size-3.5 text-muted-foreground" />
												) : null}
												{page.title}
											</Link>
											<Badge variant={page.status}>{page.status}</Badge>
										</div>
										<p className="text-[13px] text-muted-foreground">
											{page.path}
										</p>
									</div>
									<PageActions page={page} />
								</div>

								<div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
									<span className="flex items-center gap-1.5">
										{page.source === "agent" ? (
											<Bot className="size-3.5" />
										) : (
											<UserIcon className="size-3.5" />
										)}
										{page.source === "agent" ? "Agent" : "Human"}
									</span>
									<span className="flex items-center gap-1.5">
										<Clock className="size-3.5" />
										{formatDistanceToNow(new Date(page.updatedAt), {
											addSuffix: true,
										})}
									</span>
									{page.updatedBy ? (
										<span>
											by {page.updatedBy.name || page.updatedBy.email}
										</span>
									) : null}
								</div>

								<div className="flex flex-wrap gap-1.5">
									{page.tags?.map((tag) => (
										<span
											key={tag}
											className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted-foreground"
										>
											#{tag}
										</span>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</>
	);
}

function PageActions({ page }: { page: PageWithUser }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="h-8 w-8 p-0 text-muted-foreground transition-colors hover:text-foreground"
				>
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem asChild>
					<Link href={`/pages/${page.id}`}>View page</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<Pin className="mr-2 h-4 w-4" />
					{page.pinned ? "Unpin" : "Pin"}
				</DropdownMenuItem>
				<DropdownMenuItem className="text-destructive focus:text-destructive">
					<Archive className="mr-2 h-4 w-4" />
					Archive
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
