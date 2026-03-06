"use client";

import type { Page, Space, User } from "@foundry/database";
import { formatDistanceToNow } from "date-fns";
import {
	Archive,
	Bot,
	CheckCircle,
	FileEdit,
	MoreHorizontal,
	Search,
	User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type DraftWithRelations = Page & {
	updatedBy: User | null;
	space: Space;
};

interface DraftsClientProps {
	initialDrafts: DraftWithRelations[];
}

export function DraftsClient({ initialDrafts }: DraftsClientProps) {
	const router = useRouter();
	const [drafts, setDrafts] = useState<DraftWithRelations[]>(initialDrafts);
	const [searchQuery, setSearchQuery] = useState("");
	const [sourceFilter, setSourceFilter] = useState<"all" | "human" | "agent">(
		"all",
	);
	const [spaceFilter, setSpaceFilter] = useState<string>("all");

	// Extract unique spaces for the filter
	const spaces = Array.from(
		new Map(initialDrafts.map((d) => [d.spaceId, d.space])).values(),
	);

	const filteredDrafts = drafts.filter((draft) => {
		const matchesSearch =
			draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			draft.path.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesSource =
			sourceFilter === "all" || draft.source === sourceFilter;
		const matchesSpace = spaceFilter === "all" || draft.spaceId === spaceFilter;

		return matchesSearch && matchesSource && matchesSpace;
	});

	const handlePromote = async (draftId: string) => {
		try {
			const res = await fetch(`/api/pages/${draftId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "stable" }),
			});

			if (!res.ok) throw new Error("Failed to promote draft");

			toast.success("Draft promoted to stable");
			setDrafts(drafts.filter((d) => d.id !== draftId));
			router.refresh();
		} catch (error) {
			toast.error("Failed to promote draft");
			console.error(error);
		}
	};

	const handleArchive = async (draftId: string) => {
		try {
			const res = await fetch(`/api/pages/${draftId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "archived" }),
			});

			if (!res.ok) throw new Error("Failed to archive draft");

			toast.success("Draft archived");
			setDrafts(drafts.filter((d) => d.id !== draftId));
			router.refresh();
		} catch (error) {
			toast.error("Failed to archive draft");
			console.error(error);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search drafts..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="flex gap-2">
					<Select
						value={sourceFilter}
						onValueChange={(v: any) => setSourceFilter(v)}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Source" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Sources</SelectItem>
							<SelectItem value="human">Human</SelectItem>
							<SelectItem value="agent">Agent</SelectItem>
						</SelectContent>
					</Select>

					<Select value={spaceFilter} onValueChange={setSpaceFilter}>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Space" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Spaces</SelectItem>
							{spaces.map((space) => (
								<SelectItem key={space.id} value={space.id}>
									{space.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{filteredDrafts.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
					<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
						<FileEdit className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-medium">No drafts awaiting review</h3>
					<p className="text-sm text-muted-foreground mt-1 max-w-sm mb-4">
						{initialDrafts.length === 0
							? "There are currently no drafts in the system."
							: "No drafts match your current filters."}
					</p>
					{initialDrafts.length === 0 && (
						<Button asChild>
							<Link href="/spaces">Go to Spaces</Link>
						</Button>
					)}
				</div>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Space / Path</TableHead>
								<TableHead>Source</TableHead>
								<TableHead>Updated</TableHead>
								<TableHead className="w-[50px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredDrafts.map((draft) => (
								<TableRow key={draft.id} className="group">
									<TableCell className="font-medium">
										<Link
											href={`/spaces/${draft.spaceId}/pages/${draft.id}`}
											className="hover:underline flex items-center gap-2"
										>
											{draft.title}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										<div className="flex flex-col">
											<span className="font-medium text-foreground">
												{draft.space.name}
											</span>
											<span>{draft.path}</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
											{draft.source === "agent" ? (
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
												{formatDistanceToNow(new Date(draft.updatedAt), {
													addSuffix: true,
												})}
											</span>
											{draft.updatedBy && (
												<span className="text-xs opacity-70">
													by {draft.updatedBy.name || draft.updatedBy.email}
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
													<Link
														href={`/spaces/${draft.spaceId}/pages/${draft.id}`}
													>
														Review Draft
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => handlePromote(draft.id)}
													className="text-green-600 focus:text-green-600"
												>
													<CheckCircle className="mr-2 h-4 w-4" />
													Promote to Stable
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => handleArchive(draft.id)}
													className="text-destructive focus:text-destructive"
												>
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
			)}
		</div>
	);
}
