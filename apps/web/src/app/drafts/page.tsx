import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { DraftsClient } from "./drafts-client";

export const metadata = {
	title: "Drafts | Foundry",
	description: "Review AI-generated and in-progress content",
};

export default async function DraftsPage() {
	await requireAuth();

	// Fetch drafts
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
		<div className="flex-1 space-y-4 p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Drafts Queue</h2>
			</div>
			<div className="hidden md:block">
				<p className="text-muted-foreground">
					Review and promote AI-generated or in-progress content.
				</p>
			</div>
			<DraftsClient initialDrafts={drafts} />
		</div>
	);
}
