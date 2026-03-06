"use client";

import type { Page } from "@foundry/database";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTreeProps {
	pages: Page[];
	spaceId: string;
}

type TreeNode = {
	name: string;
	path: string;
	page?: Page;
	children: Record<string, TreeNode>;
};

export function PageTree({ pages, spaceId }: PageTreeProps) {
	const pathname = usePathname();

	const tree = useMemo(() => {
		const root: TreeNode = { name: "root", path: "", children: {} };

		pages.forEach((page) => {
			// Remove leading slash if present and split
			const parts = page.path.replace(/^\//, "").split("/");
			let current = root;
			let currentPath = "";

			parts.forEach((part, index) => {
				currentPath += `/${part}`;
				if (!current.children[part]) {
					current.children[part] = {
						name: part,
						path: currentPath,
						children: {},
					};
				}

				if (index === parts.length - 1) {
					current.children[part].page = page;
				}

				current = current.children[part];
			});
		});

		return root;
	}, [pages]);

	if (pages.length === 0) {
		return (
			<div className="p-4 text-sm text-muted-foreground text-center">
				No pages yet
			</div>
		);
	}

	return (
		<div className="space-y-1">
			{Object.values(tree.children).map((node) => (
				<TreeNodeItem
					key={node.path}
					node={node}
					spaceId={spaceId}
					level={0}
					currentPathname={pathname}
				/>
			))}
		</div>
	);
}

interface TreeNodeItemProps {
	node: TreeNode;
	spaceId: string;
	level: number;
	currentPathname: string;
}

function TreeNodeItem({
	node,
	spaceId,
	level,
	currentPathname,
}: TreeNodeItemProps) {
	const [isExpanded, setIsExpanded] = useState(true);
	const hasChildren = Object.keys(node.children).length > 0;
	const isPage = !!node.page;

	const href = isPage ? `/spaces/${spaceId}/pages/${node.page?.id}` : "#";
	const isActive = currentPathname === href;

	return (
		<div>
			<div
				className={cn(
					"flex items-center gap-1.5 py-1.5 px-2 rounded-md text-sm cursor-pointer group transition-colors",
					isActive
						? "bg-accent text-accent-foreground font-medium"
						: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
				)}
				style={{ paddingLeft: `${level * 12 + 8}px` }}
				onClick={() => {
					if (hasChildren && !isPage) {
						setIsExpanded(!isExpanded);
					}
				}}
			>
				<div
					className="w-4 h-4 flex items-center justify-center shrink-0"
					onClick={(e) => {
						if (hasChildren) {
							e.stopPropagation();
							setIsExpanded(!isExpanded);
						}
					}}
				>
					{hasChildren ? (
						isExpanded ? (
							<ChevronDown className="h-3.5 w-3.5" />
						) : (
							<ChevronRight className="h-3.5 w-3.5" />
						)
					) : (
						<span className="w-3.5" /> // Spacer
					)}
				</div>

				{isPage ? (
					<FileText className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
				) : (
					<Folder className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
				)}

				{isPage ? (
					<Link
						href={href}
						className="truncate flex-1"
						onClick={(e) => e.stopPropagation()}
					>
						{node.page?.title || node.name}
					</Link>
				) : (
					<span className="truncate flex-1">{node.name}</span>
				)}
			</div>

			{hasChildren && isExpanded && (
				<div className="mt-0.5">
					{Object.values(node.children).map((childNode) => (
						<TreeNodeItem
							key={childNode.path}
							node={childNode}
							spaceId={spaceId}
							level={level + 1}
							currentPathname={currentPathname}
						/>
					))}
				</div>
			)}
		</div>
	);
}
