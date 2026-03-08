export type DashboardActivitySummary = {
	title: string;
	detail: string;
	href?: string;
	tone: "human" | "agent" | "neutral";
};

type DashboardActivityInput = {
	action: string;
	actorType: "human" | "agent" | "system";
	actorName?: string | null;
	targetId: string;
	targetType: string;
	metadata?: Record<string, unknown> | null;
	page?: {
		id: string;
		title: string;
		path: string;
		space: { name: string };
	} | null;
};

function getActorLabel(
	actorType: DashboardActivityInput["actorType"],
	actorName?: string | null,
) {
	const normalizedName = actorName?.trim();

	if (normalizedName) {
		return normalizedName;
	}

	if (actorType === "agent") {
		return "Agent";
	}

	if (actorType === "system") {
		return "System";
	}

	return "Human";
}

function getActionVerb(action: string) {
	if (action.endsWith(":create")) {
		return "created";
	}

	if (action.endsWith(":update")) {
		return "updated";
	}

	if (action.endsWith(":delete")) {
		return "deleted";
	}

	if (action.endsWith(":revert")) {
		return "reverted";
	}

	return "changed";
}

function getMetadataString(
	metadata: Record<string, unknown> | null | undefined,
	key: string,
) {
	const value = metadata?.[key];
	return typeof value === "string" && value.trim().length > 0
		? value.trim()
		: undefined;
}

function formatTargetType(targetType: string) {
	return targetType.replace(/[-_]+/g, " ");
}

export function buildDashboardActivitySummary({
	action,
	actorType,
	actorName,
	targetId,
	targetType,
	metadata,
	page,
}: DashboardActivityInput): DashboardActivitySummary {
	const actorLabel = getActorLabel(actorType, actorName);
	const actionVerb = getActionVerb(action);
	const targetLabel =
		page?.title ??
		getMetadataString(metadata, "title") ??
		getMetadataString(metadata, "name") ??
		formatTargetType(targetType);

	const detail = page
		? `${page.space.name} / ${page.path}`
		: `${formatTargetType(targetType).replace(/^./, (value) => value.toUpperCase())} ${actionVerb}`;

	const href = page?.id
		? `/pages/${page.id}`
		: targetType === "space"
			? `/spaces/${targetId}`
			: targetType === "page"
				? `/pages/${targetId}`
				: undefined;

	return {
		title: `${actorLabel} ${actionVerb} ${targetLabel}`,
		detail,
		href,
		tone: actorType === "system" ? "neutral" : actorType,
	};
}
