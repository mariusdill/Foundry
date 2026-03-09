"use client";

import type { Page } from "@foundry/database";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface SpacePageTreeProps {
	pages: Page[];
}

type TreeNode = {
	name: string;
	path: string;
	page?: Page;
	children: Record<string, TreeNode>;
};

export function SpacePageTree({ pages }: SpacePageTreeProps) {
	const pathname = usePathname();

	const tree = useMemo(() => {
		const root: TreeNode = { name: "root", path: "", children: {} };

		pages.forEach((page) => {
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
			<div className="rounded-[10px] border border-dashed border-[color:var(--border-subtle)] px-4 py-6 text-center text-sm text-muted-foreground">
				No pages yet
			</div>
		);
	}

	return (
		<div className="space-y-1.5">
			{Object.values(tree.children).map((node) => (
				<TreeNodeItem
					key={node.path}
					node={node}
					level={0}
					currentPathname={pathname}
				/>
			))}
		</div>
	);
}

function TreeNodeItem({
	node,
	level,
	currentPathname,
}: {
	node: TreeNode;
	level: number;
	currentPathname: string;
}) {
	const [isExpanded, setIsExpanded] = useState(true);
	const hasChildren = Object.keys(node.children).length > 0;
	const isPage = !!node.page;
	const href = isPage ? `/pages/${node.page?.id}` : "#";
	const isActive = currentPathname === href;
	const rowClassName = cn(
		"group flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
		isActive
			? "bg-accent text-accent-foreground shadow-[var(--shadow-xs)]"
			: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
	);

	return (
		<div>
			{isPage ? (
				<div
					className={rowClassName}
					style={{ paddingLeft: `${level * 12 + 8}px` }}
				>
					<div className="flex h-4 w-4 shrink-0 items-center justify-center">
						{hasChildren ? (
							<button
								type="button"
								className="flex h-4 w-4 items-center justify-center"
								onClick={() => setIsExpanded((expanded) => !expanded)}
							>
								{isExpanded ? (
									<ChevronDown className="h-3.5 w-3.5" />
								) : (
									<ChevronRight className="h-3.5 w-3.5" />
								)}
							</button>
						) : (
							<span className="w-3.5" />
						)}
					</div>
					<FileText className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
					<Link href={href} className="flex-1 truncate">
						{node.page?.title || node.name}
					</Link>
				</div>
			) : (
				<button
					type="button"
					className={cn(rowClassName, "w-full cursor-pointer text-left")}
					style={{ paddingLeft: `${level * 12 + 8}px` }}
					onClick={() => {
						if (hasChildren) setIsExpanded((expanded) => !expanded);
					}}
				>
					<div className="flex h-4 w-4 shrink-0 items-center justify-center">
						{hasChildren ? (
							isExpanded ? (
								<ChevronDown className="h-3.5 w-3.5" />
							) : (
								<ChevronRight className="h-3.5 w-3.5" />
							)
						) : (
							<span className="w-3.5" />
						)}
					</div>
					<Folder className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
					<span className="flex-1 truncate">{node.name}</span>
				</button>
			)}

			{hasChildren && isExpanded ? (
				<div className="mt-0.5">
					{Object.values(node.children).map((childNode) => (
						<TreeNodeItem
							key={childNode.path}
							node={childNode}
							level={level + 1}
							currentPathname={currentPathname}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}
