import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth";
import { EditPageClient } from "./edit-page-client";

export default async function EditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requireAuth();
	const { id } = await params;

	return (
		<AppShell>
			<EditPageClient id={id} />
		</AppShell>
	);
}
