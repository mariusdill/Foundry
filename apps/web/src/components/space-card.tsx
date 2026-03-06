import { BookOpen, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface SpaceCardProps {
	space: {
		id: string;
		name: string;
		slug: string;
		description: string | null;
		kind: string;
		icon: string;
		_count?: {
			pages: number;
		};
	};
	viewMode: "grid" | "list";
}

export function SpaceCard({ space, viewMode }: SpaceCardProps) {
	const Icon = space.kind === "runbooks" ? BookOpen : FolderGit2;

	if (viewMode === "list") {
		return (
			<Link href={`/spaces/${space.slug}`}>
				<Card className="hover:bg-muted/50 transition-colors flex items-center p-4 gap-4">
					<div className="p-2 bg-primary/10 rounded-md">
						<Icon className="w-6 h-6 text-primary" />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<h3 className="font-semibold truncate">{space.name}</h3>
							<Badge variant="secondary" className="capitalize text-xs">
								{space.kind}
							</Badge>
						</div>
						{space.description && (
							<p className="text-sm text-muted-foreground truncate mt-1">
								{space.description}
							</p>
						)}
					</div>
					<div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
						<div className="flex items-center gap-1">
							<BookOpen className="w-4 h-4" />
							<span>{space._count?.pages || 0} pages</span>
						</div>
					</div>
				</Card>
			</Link>
		);
	}

	return (
		<Link href={`/spaces/${space.slug}`}>
			<Card className="hover:bg-muted/50 transition-colors h-full flex flex-col">
				<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
					<div className="p-2 bg-primary/10 rounded-md">
						<Icon className="w-6 h-6 text-primary" />
					</div>
					<Badge variant="secondary" className="capitalize">
						{space.kind}
					</Badge>
				</CardHeader>
				<CardContent className="flex-1 flex flex-col">
					<CardTitle className="line-clamp-1 mb-2">{space.name}</CardTitle>
					<CardDescription className="line-clamp-2 flex-1">
						{space.description || "No description provided."}
					</CardDescription>
					<div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 pt-4 border-t">
						<div className="flex items-center gap-1">
							<BookOpen className="w-4 h-4" />
							<span>{space._count?.pages || 0} pages</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
