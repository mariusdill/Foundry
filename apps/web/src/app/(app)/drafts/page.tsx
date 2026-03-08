import { headers } from "next/headers";

import { PageChrome } from "@/components/page-chrome";
import { requireAuth } from "@/lib/auth";

import { DraftsClient } from "./drafts-client";

export const metadata = {
	title: "Drafts | Foundry",
	description: "Review draft pages before promotion or archive",
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
		<PageChrome
			eyebrow="Workspace / review"
			title="Review drafts before they become stable pages"
			description="Use source, updatedBy, and space context to decide what to review, promote, or archive."
		>
			<DraftsClient initialDrafts={drafts} />
		</PageChrome>
	);
}
