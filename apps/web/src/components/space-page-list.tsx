"use client";

import type { Page, User } from "@foundry/database";
import { formatDistanceToNow } from "date-fns";
import {
	Bot,
	FileEdit,
	MoreHorizontal,
	Pin,
	User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface SpacePageListProps {
	pages: PageWithUser[];
}

export function SpacePageList({ pages }: SpacePageListProps) {
	const [sortConfig, setSortConfig] = useState<{
		key: keyof PageWithUser | "updatedBy";
		direction: "asc" | "desc";
	} | null>(null);

	const getComparableValue = (
		page: PageWithUser,
		key: keyof PageWithUser | "updatedBy",
	): string | number | boolean => {
		if (key === "updatedBy")
			return page.updatedBy?.name || page.updatedBy?.email || "";
		const value = page[key];
		if (Array.isArray(value)) return value.join(", ");
		if (value instanceof Date) return value.getTime();
		return value ?? "";
	};

	const sortedPages = [...pages].sort((a, b) => {
		if (!sortConfig) return 0;
		const { key, direction } = sortConfig;
		const aValue = getComparableValue(a, key);
		const bValue = getComparableValue(b, key);
		if (aValue < bValue) return direction === "asc" ? -1 : 1;
		if (aValue > bValue) return direction === "asc" ? 1 : -1;
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
			<div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[color:var(--border-subtle)] bg-card/95 py-14 text-center">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
					<FileEdit className="h-5 w-5" />
				</div>
				<h3 className="text-[15px] font-medium text-foreground">
					No pages found
				</h3>
				<p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
					Create a new page or widen the filters for this space.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-[12px] border border-[color:var(--border-subtle)] bg-card/95">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead
							className="cursor-pointer px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]"
							onClick={() => requestSort("title")}
						>
							Title
						</TableHead>
						<TableHead
							className="cursor-pointer px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]"
							onClick={() => requestSort("path")}
						>
							Path
						</TableHead>
						<TableHead className="px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
							Tags
						</TableHead>
						<TableHead
							className="cursor-pointer px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]"
							onClick={() => requestSort("status")}
						>
							Status
						</TableHead>
						<TableHead
							className="cursor-pointer px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]"
							onClick={() => requestSort("source")}
						>
							Source
						</TableHead>
						<TableHead
							className="cursor-pointer px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]"
							onClick={() => requestSort("updatedAt")}
						>
							Updated
						</TableHead>
						<TableHead className="w-[56px] px-5"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedPages.map((page) => (
						<TableRow key={page.id} className="group">
							<TableCell className="px-5 py-4 font-medium whitespace-normal">
								<Link
									href={`/pages/${page.id}`}
									className="flex items-center gap-2 hover:underline"
								>
									{page.pinned ? (
										<Pin className="h-3 w-3 text-muted-foreground" />
									) : null}
									{page.title}
								</Link>
							</TableCell>
							<TableCell className="px-5 py-4 text-sm text-muted-foreground">
								{page.path}
							</TableCell>
							<TableCell className="px-5 py-4">
								<div className="flex flex-wrap gap-1">
									{page.tags?.map((tag) => (
										<Badge
											key={tag}
											variant="outline"
											className="text-xs font-normal"
										>
											{tag}
										</Badge>
									))}
								</div>
							</TableCell>
							<TableCell className="px-5 py-4">
								<Badge variant={page.status}>{page.status}</Badge>
							</TableCell>
							<TableCell className="px-5 py-4">
								<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
									{page.source === "agent" ? (
										<Bot className="h-3.5 w-3.5" />
									) : (
										<UserIcon className="h-3.5 w-3.5" />
									)}
									{page.source === "agent" ? "Agent" : "Human"}
								</div>
							</TableCell>
							<TableCell className="px-5 py-4 text-sm text-muted-foreground">
								<div className="flex flex-col">
									<span>
										{formatDistanceToNow(new Date(page.updatedAt), {
											addSuffix: true,
										})}
									</span>
									{page.updatedBy ? (
										<span className="text-xs opacity-70">
											by {page.updatedBy.name || page.updatedBy.email}
										</span>
									) : null}
								</div>
							</TableCell>
							<TableCell className="px-5 py-4">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
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
										<DropdownMenuItem asChild>
											<Link href={`/pages/${page.id}/edit`}>
												Open in editor
											</Link>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
