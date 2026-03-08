import { FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Backlink {
	id: string;
	title: string;
	path: string;
	status: string;
	space: { name: string };
}

interface BacklinksSectionProps {
	backlinks: Backlink[];
}

export function BacklinksSection({ backlinks }: BacklinksSectionProps) {
	if (backlinks.length === 0) {
		return null;
	}

	return (
		<div className="mt-8 border-t border-[color:var(--border-subtle)] pt-6">
			<h3 className="text-[14px] font-medium text-foreground mb-3">
				Linked from
			</h3>
			<div className="space-y-2">
				{backlinks.map((page) => (
					<Link
						key={page.id}
						href={`/pages/${page.id}`}
						className="flex items-center gap-3 rounded-lg border border-[color:var(--border-subtle)] bg-surface-2/50 p-3 transition-colors hover:bg-surface-2"
					>
						<FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2">
								<p className="truncate text-[13px] font-medium text-foreground">
									{page.title}
								</p>
								<Badge variant="outline">{page.status}</Badge>
							</div>
							<p className="truncate text-[11px] text-muted-foreground">
								{page.space.name} / {page.path}
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
