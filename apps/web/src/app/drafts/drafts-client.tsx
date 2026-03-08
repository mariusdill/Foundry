"use client";

import type { Page, Space, User } from "@foundry/database";
import { formatDistanceToNow } from "date-fns";
import {
	Archive,
	Bot,
	CheckCircle,
	Search,
	User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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

	const spaces = Array.from(
		new Map(
			initialDrafts.map((draft) => [draft.spaceId, draft.space]),
		).values(),
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
			setDrafts(drafts.filter((draft) => draft.id !== draftId));
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
			setDrafts(drafts.filter((draft) => draft.id !== draftId));
			router.refresh();
		} catch (error) {
			toast.error("Failed to archive draft");
			console.error(error);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search drafts..."
						className="pl-9"
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
					/>
				</div>

				<div className="flex flex-wrap gap-2">
					<Select
						value={sourceFilter}
						onValueChange={(value: "all" | "human" | "agent") =>
							setSourceFilter(value)
						}
					>
						<SelectTrigger className="w-[142px]">
							<SelectValue placeholder="Source" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All sources</SelectItem>
							<SelectItem value="human">Human</SelectItem>
							<SelectItem value="agent">Agent</SelectItem>
						</SelectContent>
					</Select>

					<Select value={spaceFilter} onValueChange={setSpaceFilter}>
						<SelectTrigger className="w-[168px]">
							<SelectValue placeholder="Space" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All spaces</SelectItem>
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
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-14 text-center">
						<div className="mb-4 flex size-10 items-center justify-center rounded-md bg-surface-2 text-muted-foreground">
							<Bot className="size-4" />
						</div>
						<p className="text-[15px] font-medium text-foreground">
							No drafts awaiting review
						</p>
						<p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
							{initialDrafts.length === 0
								? "There are currently no drafts in the workspace."
								: "No drafts match your current filters."}
						</p>
						{initialDrafts.length === 0 ? (
							<Button asChild className="mt-5">
								<Link href="/spaces">Browse spaces</Link>
							</Button>
						) : null}
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{filteredDrafts.map((draft) => (
						<Card key={draft.id}>
							<CardContent className="flex items-start justify-between gap-4 p-4">
								<div className="min-w-0 space-y-2">
									<div className="flex flex-wrap items-center gap-2">
										<Link
											href={`/pages/${draft.id}`}
											className="text-[15px] font-medium text-foreground hover:underline"
										>
											{draft.title}
										</Link>
										<Badge
											variant={draft.source === "agent" ? "agent" : "human"}
										>
											{draft.source === "agent" ? "agent" : "human"}
										</Badge>
										<Badge variant="draft">draft</Badge>
									</div>

									<p className="text-[13px] text-muted-foreground">
										{draft.space.name} / {draft.path}
									</p>

									<div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
										<span className="flex items-center gap-1.5">
											{draft.source === "agent" ? (
												<Bot className="size-3.5" />
											) : (
												<UserIcon className="size-3.5" />
											)}
											{draft.updatedBy?.name ||
												draft.updatedBy?.email ||
												"Unknown"}
										</span>
										<span>
											{formatDistanceToNow(new Date(draft.updatedAt), {
												addSuffix: true,
											})}
										</span>
									</div>
								</div>

								<div className="flex shrink-0 items-center gap-2">
									<Button variant="ghost" size="xs" asChild>
										<Link href={`/pages/${draft.id}`}>Review</Link>
									</Button>
									<Button
										variant="secondary"
										size="xs"
										onClick={() => handlePromote(draft.id)}
									>
										<CheckCircle className="size-3.5" />
										Promote
									</Button>
									<Button
										variant="ghost"
										size="xs"
										onClick={() => handleArchive(draft.id)}
									>
										<Archive className="size-3.5" />
										Archive
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
