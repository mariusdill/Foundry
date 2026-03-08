import { prisma } from "@foundry/database";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { SpaceView } from "./space-view";

export default async function SpacePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requireAuth();
	const { id } = await params;

	const space = await prisma.space.findUnique({
		where: { id },
	});

	if (!space) {
		notFound();
	}

	const pages = await prisma.page.findMany({
		where: { spaceId: id },
		orderBy: { updatedAt: "desc" },
		include: { updatedBy: true },
	});

	return <SpaceView space={space} initialPages={pages} />;
}
