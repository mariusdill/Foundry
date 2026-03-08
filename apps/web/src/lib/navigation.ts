import {
	ActivitySquare,
	BookMarked,
	FolderKanban,
	History,
	LayoutDashboard,
	type LucideIcon,
	Search,
	Settings2,
	ShieldEllipsis,
	Sparkles,
} from "lucide-react";

export type NavigationItem = {
	href: string;
	label: string;
	icon: LucideIcon;
	count?: number | string | null;
};

export type SidebarActionSurface = {
	href: string;
	label: string;
	description: string;
	icon: LucideIcon;
	shortcut?: string;
};

export type SidebarCollectionItem = {
	label: string;
	meta: string;
};

export type SidebarCollection = {
	title: string;
	items: SidebarCollectionItem[];
};

export type AppChromeBreadcrumb = {
	label: string;
	href?: string;
};

export type AppChromeState = {
	breadcrumbs: AppChromeBreadcrumb[];
	title: string;
};

export const primaryNavigation = [
	{ href: "/", label: "Home", icon: LayoutDashboard, count: null },
	{ href: "/search", label: "Search", icon: Search, count: "Cmd K" },
	{ href: "/drafts", label: "Drafts", icon: Sparkles, count: null },
	{ href: "/spaces", label: "Spaces", icon: FolderKanban, count: null },
] satisfies NavigationItem[];

export const sidebarActionSurfaces = [
	{
		href: "/search",
		label: "Search",
		description: "Find pages across projects and runbooks.",
		icon: Search,
		shortcut: "Cmd K",
	},
	{
		href: "/drafts",
		label: "Drafts",
		description: "Review changes waiting for a human decision.",
		icon: Sparkles,
	},
] satisfies SidebarActionSurface[];

export const commandNavigation = [
	{ href: "/", label: "Home", icon: LayoutDashboard, shortcut: "G H" },
	{ href: "/search", label: "Search", icon: Search, shortcut: "G S" },
	{ href: "/drafts", label: "Drafts", icon: Sparkles, shortcut: "G R" },
	{ href: "/spaces", label: "Spaces", icon: FolderKanban, shortcut: "G P" },
];

export const knowledgeNavigation = [
	{
		href: "/spaces",
		label: "Runbooks",
		icon: BookMarked,
		hint: "Operational truth",
	},
	{
		href: "/spaces",
		label: "Projects",
		icon: FolderKanban,
		hint: "Execution notes",
	},
	{
		href: "/audit",
		label: "Audit log",
		icon: History,
		hint: "Every write is attributable",
	},
	{
		href: "/settings/tokens",
		label: "Token settings",
		icon: ShieldEllipsis,
		hint: "Scoped access",
	},
	{
		href: "/settings/profile",
		label: "Profile",
		icon: Settings2,
		hint: "Workspace defaults",
	},
	{
		href: "/activity",
		label: "Recent agent activity",
		icon: ActivitySquare,
		hint: "Draft-first writes",
	},
];

export const sidebarCollections = [
	{
		title: "Recents",
		items: [
			{ label: "Incident response handbook", meta: "runbooks/operations" },
			{ label: "Launch review notes", meta: "projects/marketing" },
			{ label: "API token hardening", meta: "projects/platform" },
		],
	},
	{
		title: "Pinned",
		items: [
			{ label: "Search tuning checklist", meta: "runbooks/platform" },
			{ label: "Draft promotion policy", meta: "runbooks/knowledge" },
			{ label: "Quarterly roadmap", meta: "projects/product" },
		],
	},
] satisfies SidebarCollection[];

function formatSegmentLabel(segment: string) {
	return segment
		.replace(/[-_]+/g, " ")
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getAppChromeState(pathname: string): AppChromeState {
	const cleanPathname = pathname.split("?")[0] ?? pathname;
	const segments = cleanPathname.split("/").filter(Boolean);

	if (segments.length === 0) {
		return {
			breadcrumbs: [{ label: "Workspace", href: "/" }, { label: "Home" }],
			title: "Home",
		};
	}

	if (segments[0] === "search") {
		return {
			breadcrumbs: [{ label: "Workspace", href: "/" }, { label: "Search" }],
			title: "Search",
		};
	}

	if (segments[0] === "drafts") {
		return {
			breadcrumbs: [{ label: "Workspace", href: "/" }, { label: "Drafts" }],
			title: "Drafts",
		};
	}

	if (segments[0] === "spaces") {
		if (segments[1]) {
			return {
				breadcrumbs: [
					{ label: "Workspace", href: "/" },
					{ label: "Spaces", href: "/spaces" },
					{ label: "Space" },
				],
				title: "Space",
			};
		}

		return {
			breadcrumbs: [{ label: "Workspace", href: "/" }, { label: "Spaces" }],
			title: "Spaces",
		};
	}

	if (segments[0] === "pages") {
		const pageHref = segments[1] ? `/pages/${segments[1]}` : "/pages";

		if (segments[2] === "edit") {
			return {
				breadcrumbs: [
					{ label: "Workspace", href: "/" },
					{ label: "Pages", href: pageHref },
					{ label: "Edit" },
				],
				title: "Edit page",
			};
		}

		return {
			breadcrumbs: [
				{ label: "Workspace", href: "/" },
				{ label: "Pages" },
				{ label: "Page" },
			],
			title: "Page",
		};
	}

	const firstSegment = segments[0] ?? "workspace";
	const lastSegment = segments.at(-1) ?? firstSegment;

	return {
		breadcrumbs: [
			{ label: "Workspace", href: "/" },
			{ label: formatSegmentLabel(firstSegment) },
		],
		title: formatSegmentLabel(lastSegment),
	};
}

export function resolveAppChromeState(
	pathname: string,
	override?: Partial<AppChromeState>,
): AppChromeState {
	const defaultState = getAppChromeState(pathname);

	if (!override) {
		return defaultState;
	}

	return {
		breadcrumbs: override.breadcrumbs ?? defaultState.breadcrumbs,
		title: override.title ?? defaultState.title,
	};
}
