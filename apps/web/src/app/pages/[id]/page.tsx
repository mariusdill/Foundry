import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth";
import { PageClient } from "./page-client";

export default async function PageView({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requireAuth();
	const { id } = await params;

	return (
		<AppShell>
			<PageClient id={id} />
		</AppShell>
	);
}
