"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavigationLinkProps = {
	href: string;
	label: string;
	meta?: React.ReactNode;
	icon?: React.ComponentType<{ className?: string }>;
};

export function NavigationLink({
	href,
	label,
	meta,
	icon: Icon,
}: NavigationLinkProps) {
	const pathname = usePathname();
	const isActive = href === "/" ? pathname === href : pathname.startsWith(href);

	return (
		<Link
			href={href}
			className={cn(
				"group flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 transition-all duration-200",
				isActive
					? "border-border-strong bg-[linear-gradient(135deg,rgba(92,124,255,0.18),rgba(15,22,36,0.96))] text-text-primary shadow-[0_16px_40px_rgba(12,22,52,0.28)]"
					: "border-transparent bg-transparent text-text-secondary hover:border-border-subtle hover:bg-surface-3/80 hover:text-text-primary",
			)}
		>
			<span className="flex items-center gap-3">
				{Icon ? <Icon className="size-4" /> : null}
				<span className="text-sm font-medium">{label}</span>
			</span>
			{meta ? (
				<span className="text-[11px] uppercase tracking-[0.22em] text-text-muted">
					{meta}
				</span>
			) : null}
		</Link>
	);
}
