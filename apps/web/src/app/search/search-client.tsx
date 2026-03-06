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

// Types
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

	// Fetch spaces for filter
	useEffect(() => {
		fetch("/api/spaces")
			.then((res) => res.json())
			.then((data) => setSpaces(data))
			.catch((err) => console.error("Failed to fetch spaces", err));
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				inputRef.current?.focus();
			}
			if (e.key === "Escape") {
				setQuery("");
				inputRef.current?.blur();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Search effect
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
				if (res.ok) {
					const data = await res.json();
					setResults(data);
				} else {
					console.error("Search failed");
					setResults([]);
				}
			} catch (error) {
				console.error("Search error:", error);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		};

		performSearch();
	}, [debouncedQuery, space, status, source, sort]);

	// Highlight text helper
	const highlightText = useCallback((text: string, highlight: string) => {
		if (!highlight.trim()) return <span>{text}</span>;

		const parts = text.split(new RegExp(`(${highlight})`, "gi"));
		return (
			<span>
				{parts.map((part, i) =>
					part.toLowerCase() === highlight.toLowerCase() ? (
						<span
							key={i}
							className="bg-primary/20 text-primary font-medium rounded-sm px-0.5"
						>
							{part}
						</span>
					) : (
						<span key={i}>{part}</span>
					),
				)}
			</span>
		);
	}, []);

	return (
		<div className="space-y-6">
			{/* Search Header */}
			<div className="flex flex-col gap-4">
				<div className="relative">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
					<Input
						ref={inputRef}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search pages, drafts, and knowledge..."
						className="h-14 pl-12 pr-24 text-lg rounded-2xl bg-background/50 border-border/50 focus-visible:ring-primary/20"
					/>
					<div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
						{query && (
							<button
								onClick={() => setQuery("")}
								className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
							>
								<X className="size-4" />
							</button>
						)}
						<div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground font-medium border border-border/50">
							<CommandIcon className="size-3" />
							<span>K</span>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className="flex flex-wrap items-center gap-3">
					<Select value={space} onValueChange={setSpace}>
						<SelectTrigger className="w-[160px] h-9 rounded-xl bg-background/50">
							<SelectValue placeholder="All Spaces" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Spaces</SelectItem>
							{spaces.map((s) => (
								<SelectItem key={s.id} value={s.slug}>
									{s.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={status} onValueChange={setStatus}>
						<SelectTrigger className="w-[140px] h-9 rounded-xl bg-background/50">
							<SelectValue placeholder="Any Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Any Status</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="stable">Stable</SelectItem>
							<SelectItem value="archived">Archived</SelectItem>
						</SelectContent>
					</Select>

					<Select value={source} onValueChange={setSource}>
						<SelectTrigger className="w-[140px] h-9 rounded-xl bg-background/50">
							<SelectValue placeholder="Any Source" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Any Source</SelectItem>
							<SelectItem value="human">Human</SelectItem>
							<SelectItem value="agent">Agent</SelectItem>
						</SelectContent>
					</Select>

					<Select value={sort} onValueChange={setSort}>
						<SelectTrigger className="w-[140px] h-9 rounded-xl bg-background/50 ml-auto">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="relevance">Relevance</SelectItem>
							<SelectItem value="updatedAt">Recently Updated</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Results */}
			<div className="space-y-4">
				{isLoading ? (
					Array.from({ length: 3 }).map((_, i) => (
						<Card key={i} className="bg-background/40 border-border/50">
							<CardContent className="p-5 space-y-3">
								<div className="flex items-center gap-3">
									<Skeleton className="h-5 w-1/3" />
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
								<div className="flex items-center gap-4 pt-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-32" />
								</div>
							</CardContent>
						</Card>
					))
				) : hasSearched && results.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/50 rounded-3xl bg-background/20">
						<div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
							<Search className="size-6 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-medium text-foreground">
							No results found
						</h3>
						<p className="text-sm text-muted-foreground mt-1 max-w-sm">
							We couldn&apos;t find any pages matching your search. Try adjusting
							your filters or search terms.
						</p>
					</div>
				) : (
					results.map((result) => (
						<Link
							key={result.id}
							href={`/spaces/${result.space.slug}/${result.slug}`}
							className="block mb-3"
						>
							<Card className="group bg-background/40 border-border/50 hover:bg-muted/20 hover:border-border transition-all duration-200">
								<CardContent className="p-5">
									<div className="flex items-start justify-between gap-4">
										<div className="space-y-1.5 flex-1">
											<div className="flex items-center gap-2 flex-wrap">
												<h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
													{highlightText(result.title, debouncedQuery)}
												</h3>
												<Badge
													variant={result.status as "draft" | "stable" | "archived"}
													className="capitalize text-[10px] h-5 px-1.5"
												>
													{result.status}
												</Badge>
												{result.source === "agent" && (
													<Badge
														variant="agent"
														className="capitalize text-[10px] h-5 px-1.5"
													>
														Agent
													</Badge>
												)}
											</div>

											{result.excerpt && (
												<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
													{highlightText(result.excerpt, debouncedQuery)}
												</p>
											)}

											<div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
												<div className="flex items-center gap-1.5">
													<FileText className="size-3.5" />
													<span>{result.space.name}</span>
												</div>
												<div className="flex items-center gap-1.5">
													<Clock className="size-3.5" />
													<span>
														{new Date(result.updatedAt).toLocaleDateString()}
													</span>
												</div>
												{result.tags && result.tags.length > 0 && (
													<div className="flex items-center gap-1.5">
														{result.tags.slice(0, 3).map((tag) => (
															<span
																key={tag}
																className="px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50"
															>
																#{tag}
															</span>
														))}
														{result.tags.length > 3 && (
															<span className="text-[10px]">
																+{result.tags.length - 3}
															</span>
														)}
													</div>
												)}
											</div>
										</div>
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
