import { RouteChromeRegistration } from "@/components/app-top-bar";
import type { AppChromeBreadcrumb } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type PageChromeProps = {
	eyebrow?: string;
	title: string;
	description?: string;
	actions?: React.ReactNode;
	children?: React.ReactNode;
	className?: string;
	headerClassName?: string;
	titleClassName?: string;
	breadcrumbs?: AppChromeBreadcrumb[];
	topBarTitle?: string;
};

export function PageChrome({
	eyebrow,
	title,
	description,
	actions,
	children,
	className,
	headerClassName,
	titleClassName,
	breadcrumbs,
	topBarTitle,
}: PageChromeProps) {
	return (
		<div className={cn("space-y-4", className)}>
			{breadcrumbs || topBarTitle ? (
				<RouteChromeRegistration
					breadcrumbs={breadcrumbs}
					title={topBarTitle}
				/>
			) : null}
			<header
				className={cn(
					"flex flex-col gap-4 border-b border-[color:var(--border-subtle)] pb-4 sm:flex-row sm:items-end sm:justify-between",
					headerClassName,
				)}
			>
				<div className="min-w-0 flex-1">
					{eyebrow ? (
						<p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
							{eyebrow}
						</p>
					) : null}
					<h1
						className={cn(
							"mt-1 break-words text-[20px] font-medium tracking-tight text-foreground sm:text-[22px]",
							titleClassName,
						)}
					>
						{title}
					</h1>
					{description ? (
						<p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-muted-foreground">
							{description}
						</p>
					) : null}
				</div>
				{actions ? (
					<div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
						{actions}
					</div>
				) : null}
			</header>
			{children}
		</div>
	);
}
