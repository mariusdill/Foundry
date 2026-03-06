import { prisma } from "@foundry/database";
import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth";
import { SpacesClient } from "./spaces-client";

export default async function SpacesPage() {
	await requireAuth();

	const spaces = await prisma.space.findMany({
		orderBy: { name: "asc" },
		include: {
			_count: {
				select: { pages: true },
			},
		},
	});

	return (
		<AppShell>
			<SpacesClient initialSpaces={spaces} />
		</AppShell>
	);
}
