import { requireAuth } from "@/lib/auth";
import { EditPageClient } from "./edit-page-client";

export default async function EditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requireAuth();
	const { id } = await params;

	return <EditPageClient id={id} />;
}
