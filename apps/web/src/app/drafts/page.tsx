import { headers } from "next/headers";

import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth";

import { DraftsClient } from "./drafts-client";

export const metadata = {
	title: "Drafts | Foundry",
	description: "Review AI-generated and in-progress content",
};

export default async function DraftsPage() {
	await requireAuth();

	const headersList = await headers();
	const host = headersList.get("host") || "localhost:3000";
	const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

	const res = await fetch(`${protocol}://${host}/api/pages?status=draft`, {
		headers: {
			cookie: headersList.get("cookie") || "",
		},
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error("Failed to fetch drafts");
	}

	const drafts = await res.json();

	return (
		<AppShell>
			<div className="space-y-5">
				<header className="space-y-1 border-b border-[color:var(--border-subtle)] pb-5">
					<p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
						Workspace / drafts
					</p>
					<h2 className="text-[20px] font-medium tracking-tight text-foreground">
						Draft review queue
					</h2>
					<p className="text-[13px] text-muted-foreground">
						Review and promote AI-generated or in-progress content.
					</p>
				</header>
				<DraftsClient initialDrafts={drafts} />
			</div>
		</AppShell>
	);
}
