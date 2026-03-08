"use client";

import {
	Clock,
	Command as CommandIcon,
	FileText,
	Search,
	X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

type PageResult = {
	id: string;
	title: string;
	slug: string;
	status: string;
	source: string;
	tags: string[];
	pinned: boolean;
	updatedAt: string;
	space: { slug: string; name: string };
	excerpt: string;
};

type Space = {
	id: string;
	slug: string;
	name: string;
};

export function SearchClient() {
	const [query, setQuery] = useState("");
	const [space, setSpace] = useState("all");
	const [status, setStatus] = useState("all");
	const [source, setSource] = useState("all");
	const [sort, setSort] = useState("relevance");
	const [results, setResults] = useState<PageResult[]>([]);
	const [spaces, setSpaces] = useState<Space[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);
	const debouncedQuery = useDebounce(query, 300);

	useEffect(() => {
		fetch("/api/spaces")
			.then((res) => res.json())
			.then((data) => setSpaces(data))
			.catch((err) => console.error("Failed to fetch spaces", err));
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === "k") {
				event.preventDefault();
				inputRef.current?.focus();
			}

			if (event.key === "Escape") {
				setQuery("");
				inputRef.current?.blur();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	useEffect(() => {
		const performSearch = async () => {
			if (
				!debouncedQuery &&
				space === "all" &&
				status === "all" &&
				source === "all"
			) {
				setResults([]);
				setHasSearched(false);
				return;
			}

			setIsLoading(true);
			setHasSearched(true);

			try {
				const params = new URLSearchParams();
				if (debouncedQuery) params.append("q", debouncedQuery);
				if (space !== "all") params.append("space", space);
				if (status !== "all") params.append("status", status);
				if (source !== "all") params.append("source", source);
				params.append("sort", sort);

				const res = await fetch(`/api/pages/search?${params.toString()}`);
				if (!res.ok) {
					setResults([]);
					return;
				}

				const data = await res.json();
				setResults(data);
			} catch (error) {
				console.error("Search error:", error);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		};

		performSearch();
	}, [debouncedQuery, space, status, source, sort]);

	const highlightText = useCallback((text: string, highlight: string) => {
		if (!highlight.trim()) return <span>{text}</span>;

		const parts = text.split(new RegExp(`(${highlight})`, "gi"));
		return (
			<span>
				{parts.map((part, index) =>
					part.toLowerCase() === highlight.toLowerCase() ? (
						<span
							key={`${part}-${index}`}
							className="rounded-sm bg-primary/12 px-0.5 text-foreground"
						>
							{part}
						</span>
					) : (
						<span key={`${part}-${index}`}>{part}</span>
					),
				)}
			</span>
		);
	}, []);

	return (
		<div className="space-y-5">
			<header className="space-y-1 border-b border-[color:var(--border-subtle)] pb-5">
				<p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
					Workspace / search
				</p>
				<h2 className="text-[20px] font-medium tracking-tight text-foreground">
					Search pages, drafts, and knowledge
				</h2>
				<p className="text-[13px] text-muted-foreground">
					Fast retrieval across titles, content, tags, and paths.
				</p>
			</header>

			<div className="space-y-3">
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						ref={inputRef}
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search pages, drafts, and knowledge..."
						className="h-11 pl-9 pr-24 text-[14px]"
					/>
					<div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
						{query ? (
							<button
								onClick={() => setQuery("")}
								className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
								type="button"
							>
								<X className="size-3.5" />
							</button>
						) : null}
						<div className="hidden items-center gap-1 rounded-sm border border-border bg-surface-2 px-2 py-1 text-[11px] text-muted-foreground sm:flex">
							<CommandIcon className="size-3" />
							<span>K</span>
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Select value={space} onValueChange={setSpace}>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="All spaces" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All spaces</SelectItem>
							{spaces.map((item) => (
								<SelectItem key={item.id} value={item.slug}>
									{item.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={status} onValueChange={setStatus}>
						<SelectTrigger className="w-[132px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Any status</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="stable">Stable</SelectItem>
							<SelectItem value="archived">Archived</SelectItem>
						</SelectContent>
					</Select>

					<Select value={source} onValueChange={setSource}>
						<SelectTrigger className="w-[132px]">
							<SelectValue placeholder="Source" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Any source</SelectItem>
							<SelectItem value="human">Human</SelectItem>
							<SelectItem value="agent">Agent</SelectItem>
						</SelectContent>
					</Select>

					<Select value={sort} onValueChange={setSort}>
						<SelectTrigger className="ml-auto w-[156px]">
							<SelectValue placeholder="Sort" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="relevance">Relevance</SelectItem>
							<SelectItem value="updatedAt">Recently updated</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-3">
				{isLoading ? (
					Array.from({ length: 3 }).map((_, index) => (
						<Card key={`skeleton-${index}`}>
							<CardContent className="space-y-3 p-4">
								<Skeleton className="h-4 w-1/3" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
							</CardContent>
						</Card>
					))
				) : hasSearched && results.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-16 text-center">
							<div className="mb-4 flex size-10 items-center justify-center rounded-md bg-surface-2 text-muted-foreground">
								<Search className="size-4" />
							</div>
							<p className="text-[15px] font-medium text-foreground">
								No results found
							</p>
							<p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
								Try adjusting your query or filters.
							</p>
						</CardContent>
					</Card>
				) : (
					results.map((result) => (
						<Link key={result.id} href={`/pages/${result.id}`}>
							<Card className="transition-colors hover:bg-surface-2">
								<CardContent className="space-y-3 p-4">
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0 space-y-1.5">
											<div className="flex flex-wrap items-center gap-2">
												<h3 className="text-[15px] font-medium text-foreground">
													{highlightText(result.title, debouncedQuery)}
												</h3>
												<Badge
													variant={
														result.status as "draft" | "stable" | "archived"
													}
												>
													{result.status}
												</Badge>
												{result.source === "agent" ? (
													<Badge variant="agent">agent</Badge>
												) : null}
											</div>

											{result.excerpt ? (
												<p className="line-clamp-2 text-[13px] leading-5 text-secondary">
													{highlightText(result.excerpt, debouncedQuery)}
												</p>
											) : null}
										</div>
									</div>

									<div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
										<span className="flex items-center gap-1.5">
											<FileText className="size-3.5" />
											{result.space.name}
										</span>
										<span className="flex items-center gap-1.5">
											<Clock className="size-3.5" />
											{new Date(result.updatedAt).toLocaleDateString()}
										</span>
										{result.tags?.slice(0, 3).map((tag) => (
											<span
												key={tag}
												className="rounded-sm bg-surface-2 px-1.5 py-0.5 text-[11px]"
											>
												#{tag}
											</span>
										))}
									</div>
								</CardContent>
							</Card>
						</Link>
					))
				)}
			</div>
		</div>
	);
}
