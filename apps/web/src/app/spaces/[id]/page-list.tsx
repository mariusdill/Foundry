"use client";

import type { Page, User } from "@foundry/database";
import { formatDistanceToNow } from "date-fns";
import {
	Archive,
	Bot,
	FileEdit,
	MoreHorizontal,
	Pin,
	User as UserIcon,
} from "lucide-react";
import Link from "next/link";
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

interface PageListProps {
	pages: PageWithUser[];
	spaceId: string;
}

export function PageList({ pages, spaceId }: PageListProps) {
	if (pages.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
				<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
					<FileEdit className="h-6 w-6 text-muted-foreground" />
				</div>
				<h3 className="text-lg font-medium">No pages found</h3>
				<p className="text-sm text-muted-foreground mt-1 max-w-sm">
					Get started by creating a new page in this space.
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Title</TableHead>
						<TableHead>Path</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Source</TableHead>
						<TableHead>Updated</TableHead>
						<TableHead className="w-[50px]"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{pages.map((page) => (
						<TableRow key={page.id} className="group">
							<TableCell className="font-medium">
								<Link
									href={`/spaces/${spaceId}/pages/${page.id}`}
									className="hover:underline flex items-center gap-2"
								>
									{page.pinned && (
										<Pin className="h-3 w-3 text-muted-foreground" />
									)}
									{page.title}
								</Link>
							</TableCell>
							<TableCell className="text-muted-foreground text-sm">
								{page.path}
							</TableCell>
							<TableCell>
								<Badge
									variant={
										page.status === "stable"
											? "default"
											: page.status === "draft"
												? "secondary"
												: "outline"
									}
								>
									{page.status}
								</Badge>
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
									{page.source === "agent" ? (
										<>
											<Bot className="h-3.5 w-3.5" /> Agent
										</>
									) : (
										<>
											<UserIcon className="h-3.5 w-3.5" /> Human
										</>
									)}
								</div>
							</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								<div className="flex flex-col">
									<span>
										{formatDistanceToNow(new Date(page.updatedAt), {
											addSuffix: true,
										})}
									</span>
									{page.updatedBy && (
										<span className="text-xs opacity-70">
											by {page.updatedBy.name || page.updatedBy.email}
										</span>
									)}
								</div>
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<span className="sr-only">Open menu</span>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Actions</DropdownMenuLabel>
										<DropdownMenuItem asChild>
											<Link href={`/spaces/${spaceId}/pages/${page.id}`}>
												View Page
											</Link>
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
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
