"use client";

import { formatDistanceToNow } from "date-fns";
import { Activity, AlertCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { buildDashboardActivitySummary } from "@/components/dashboard-overview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type AuditEventRecord = {
	id: string;
	action: string;
	actorType: "human" | "agent" | "system";
	targetId: string;
	targetType: string;
	createdAt: string;
	metadata?: Record<string, unknown> | null;
	actor?: {
		name: string | null;
		email: string;
	} | null;
};

type AuditResponse = {
	events: AuditEventRecord[];
};

type PageAuditStreamProps = {
	page: {
		id: string;
		title: string;
		path: string;
		space: { name: string };
	};
	limit?: number;
};

function getActionLabel(action: string) {
	const [, suffix = action] = action.split(":");
	return suffix.replace(/[-_]+/g, " ");
}

export function PageAuditStream({ page, limit = 8 }: PageAuditStreamProps) {
	const [events, setEvents] = useState<AuditEventRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchAudit = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await fetch(
				`/api/audit?pageId=${page.id}&targetType=page&limit=${limit}`,
			);

			if (!response.ok) {
				throw new Error("Failed to fetch audit events");
			}

			const data: AuditResponse = await response.json();
			setEvents(data.events);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	}, [limit, page.id]);

	useEffect(() => {
		void fetchAudit();
	}, [fetchAudit]);

	if (isLoading) {
		return (
			<div className="space-y-2">
				{[1, 2, 3].map((item) => (
					<div
						key={item}
						className="rounded-[12px] border border-[color:var(--border-subtle)] bg-surface-2/70 p-3"
					>
						<div className="space-y-2">
							<div className="flex items-center justify-between gap-3">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-3 w-14" />
							</div>
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-3 w-3/4" />
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
					onClick={() => void fetchAudit()}
					className="mt-3"
				>
					Try again
				</Button>
			</div>
		);
	}

	if (events.length === 0) {
		return (
			<div className="rounded-[12px] border border-dashed border-[color:var(--border-strong)] bg-surface-2/60 px-4 py-6 text-center">
				<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-background/70">
					<Activity className="h-4 w-4 text-muted-foreground" />
				</div>
				<p className="mt-3 text-[13px] font-medium text-foreground">
					No audit events yet
				</p>
				<p className="mt-1 text-[12px] leading-5 text-muted-foreground">
					Recent edits, restores, and page changes will show up here.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{events.map((event) => {
				const summary = buildDashboardActivitySummary({
					action: event.action,
					actorType: event.actorType,
					actorName: event.actor?.name ?? event.actor?.email ?? null,
					targetId: event.targetId,
					targetType: event.targetType,
					metadata: event.metadata,
					page,
				});

				return (
					<div
						key={event.id}
						className="rounded-[12px] border border-[color:var(--border-subtle)] bg-surface-2/70 p-3"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0 space-y-2">
								<div className="flex flex-wrap items-center gap-2">
									<Badge
										variant={
											event.actorType === "system" ? "outline" : event.actorType
										}
									>
										{event.actorType}
									</Badge>
									<span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
										{getActionLabel(event.action)}
									</span>
								</div>
								<p className="text-[13px] leading-5 text-foreground">
									{summary.title}
								</p>
								<p className="text-[12px] leading-5 text-muted-foreground">
									{summary.detail}
								</p>
							</div>
							<span className="shrink-0 text-[11px] text-[color:var(--text-muted)]">
								{formatDistanceToNow(new Date(event.createdAt), {
									addSuffix: true,
								})}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
