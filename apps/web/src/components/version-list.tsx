"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Eye, History, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Version {
	id: string;
	createdAt: string;
	createdBy: string | null;
	hashPreview: string;
}

interface VersionListProps {
	pageId: string;
	onRevert?: (versionId: string) => void;
}

export function VersionList({ pageId, onRevert }: VersionListProps) {
	const [versions, setVersions] = useState<Version[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchVersions() {
			try {
				setIsLoading(true);
				setError(null);
				const response = await fetch(`/api/pages/${pageId}/versions`);

				if (!response.ok) {
					throw new Error("Failed to fetch versions");
				}

				const data = await response.json();
				setVersions(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		}

		fetchVersions();
	}, [pageId]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<Card key={i} className="bg-card/50">
						<CardContent className="p-4 flex items-center justify-between">
							<div className="space-y-2">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-4 w-48" />
							</div>
							<div className="flex gap-2">
								<Skeleton className="h-9 w-20" />
								<Skeleton className="h-9 w-24" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<Card className="border-destructive/50 bg-destructive/10">
				<CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
					<AlertCircle className="h-8 w-8 text-destructive" />
					<p className="text-sm font-medium text-destructive">{error}</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => window.location.reload()}
						className="mt-4"
					>
						Try again
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (versions.length === 0) {
		return (
			<Card className="bg-muted/50 border-dashed">
				<CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
					<div className="p-3 bg-background rounded-full">
						<History className="h-6 w-6 text-muted-foreground" />
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium">No history yet</p>
						<p className="text-sm text-muted-foreground">
							Versions will appear here when changes are saved.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{versions.map((version, index) => {
				const isLatest = index === 0;
				const versionNumber = versions.length - index;

				return (
					<Card
						key={version.id}
						className={`transition-colors hover:bg-muted/50 ${isLatest ? "border-primary/20 bg-primary/5" : ""}`}
					>
						<CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="space-y-1.5">
								<div className="flex items-center gap-2">
									<span className="font-medium">Version {versionNumber}</span>
									{isLatest && (
										<Badge variant="secondary" className="text-xs font-normal">
											Current
										</Badge>
									)}
									<span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
										{version.hashPreview}
									</span>
								</div>

								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<span>
										{formatDistanceToNow(new Date(version.createdAt), {
											addSuffix: true,
										})}
									</span>
									<span>•</span>
									<span>{version.createdBy || "Unknown author"}</span>
								</div>
							</div>

							<div className="flex items-center gap-2 self-start sm:self-auto">
								<Button variant="outline" size="sm" className="h-8" asChild>
									<a href={`/pages/${pageId}/versions/${version.id}`}>
										<Eye className="h-4 w-4 mr-2" />
										View
									</a>
								</Button>

								{onRevert && !isLatest && (
									<Button
										variant="secondary"
										size="sm"
										className="h-8"
										onClick={() => onRevert(version.id)}
									>
										<RotateCcw className="h-4 w-4 mr-2" />
										Revert
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
