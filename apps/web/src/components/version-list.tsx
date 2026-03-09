"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertCircle, History, Loader2, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Version {
	id: string;
	createdAt: string;
	createdBy: string | null;
	hashPreview: string;
}

interface VersionListProps {
	pageId: string;
	onRevert?: (versionId: string) => Promise<void> | void;
}

export function VersionList({ pageId, onRevert }: VersionListProps) {
	const [versions, setVersions] = useState<Version[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [revertingVersionId, setRevertingVersionId] = useState<string | null>(
		null,
	);

	const fetchVersions = useCallback(async () => {
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
	}, [pageId]);

	useEffect(() => {
		void fetchVersions();
	}, [fetchVersions]);

	const handleRevert = useCallback(
		async (versionId: string) => {
			if (!onRevert) {
				return;
			}

			setRevertingVersionId(versionId);

			try {
				await onRevert(versionId);
				await fetchVersions();
			} finally {
				setRevertingVersionId(null);
			}
		},
		[fetchVersions, onRevert],
	);

	if (isLoading) {
		return (
			<div className="space-y-2">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="rounded-[12px] border border-[color:var(--border-subtle)] bg-surface-2/70 p-3"
					>
						<div className="space-y-2">
							<div className="flex items-center justify-between gap-3">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-4 w-14" />
							</div>
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-3 w-32" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-[12px] border border-destructive/20 bg-destructive/10 p-4 text-center">
				<AlertCircle className="mx-auto h-5 w-5 text-destructive" />
				<p className="mt-2 text-[13px] font-medium text-destructive">{error}</p>
				<Button
					variant="outline"
					size="sm"
					onClick={() => void fetchVersions()}
					className="mt-3"
				>
					Try again
				</Button>
			</div>
		);
	}

	if (versions.length === 0) {
		return (
			<div className="rounded-[12px] border border-dashed border-[color:var(--border-strong)] bg-surface-2/60 px-4 py-6 text-center">
				<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-background/70">
					<History className="h-4 w-4 text-muted-foreground" />
				</div>
				<p className="mt-3 text-[13px] font-medium text-foreground">
					No history yet
				</p>
				<p className="mt-1 text-[12px] leading-5 text-muted-foreground">
					Saved markdown revisions will appear here.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{versions.map((version, index) => {
				const isLatest = index === 0;
				const versionNumber = versions.length - index;
				const isReverting = revertingVersionId === version.id;

				return (
					<div
						key={version.id}
						className={[
							"rounded-[12px] border p-3 transition-colors",
							isLatest
								? "border-primary/20 bg-primary/5"
								: "border-[color:var(--border-subtle)] bg-surface-2/70 hover:bg-surface-2",
						].join(" ")}
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0 space-y-2">
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-[13px] font-medium text-foreground">
										Version {versionNumber}
									</span>
									{isLatest ? <Badge variant="secondary">Current</Badge> : null}
								</div>
								<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
									<span>{version.createdBy || "Unknown author"}</span>
									<span className="text-[color:var(--border-strong)]">•</span>
									<span>
										{formatDistanceToNow(new Date(version.createdAt), {
											addSuffix: true,
										})}
									</span>
								</div>
							</div>
							<span className="rounded-md border border-[color:var(--border-subtle)] bg-background/70 px-2 py-1 font-mono text-[11px] text-[color:var(--text-muted)]">
								{version.hashPreview}
							</span>
						</div>

						{onRevert && !isLatest ? (
							<div className="mt-3 flex justify-end">
								<Button
									variant="secondary"
									size="sm"
									className="h-8"
									disabled={isReverting}
									onClick={() => void handleRevert(version.id)}
								>
									{isReverting ? (
										<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
									) : (
										<RotateCcw className="mr-2 h-3.5 w-3.5" />
									)}
									Restore
								</Button>
							</div>
						) : null}
					</div>
				);
			})}
		</div>
	);
}
