"use client";

import { Command as CommandIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	createContext,
	Fragment,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import { OPEN_COMMAND_PALETTE_EVENT } from "@/components/global-command-palette";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	type AppChromeBreadcrumb,
	type AppChromeState,
	resolveAppChromeState,
} from "@/lib/navigation";

type AppChromeContextValue = {
	state?: Partial<AppChromeState>;
	setState: (state?: Partial<AppChromeState>) => void;
};

const AppChromeContext = createContext<AppChromeContextValue | null>(null);

function useAppChromeContext() {
	const context = useContext(AppChromeContext);

	if (!context) {
		throw new Error(
			"App chrome components must be used within AppChromeProvider.",
		);
	}

	return context;
}

export function AppChromeProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<Partial<AppChromeState> | undefined>(
		undefined,
	);

	return (
		<AppChromeContext.Provider value={{ state, setState }}>
			{children}
		</AppChromeContext.Provider>
	);
}

export function RouteChromeRegistration({
	breadcrumbs,
	title,
}: Partial<AppChromeState>) {
	const { setState } = useAppChromeContext();

	useEffect(() => {
		const nextState = breadcrumbs || title ? { breadcrumbs, title } : undefined;
		setState(nextState);

		return () => setState(undefined);
	}, [breadcrumbs, setState, title]);

	return null;
}

export function CommandLauncherButton({
	label = "Search and commands",
	className,
}: {
	label?: string;
	className?: string;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			onClick={() =>
				document.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))
			}
			className={className}
		>
			<CommandIcon className="size-3.5" />
			<span className="truncate">{label}</span>
			<span className="text-[11px] text-[color:var(--text-muted)]">Cmd K</span>
		</Button>
	);
}

function AppTopBarBreadcrumbs({
	breadcrumbs,
}: {
	breadcrumbs: AppChromeBreadcrumb[];
}) {
	return (
		<Breadcrumb className="min-w-0 flex-1">
			<BreadcrumbList className="flex-nowrap gap-1.5 overflow-hidden text-[12px] sm:text-[13px]">
				{breadcrumbs.map((item, index) => {
					const isLast = index === breadcrumbs.length - 1;
					const itemKey = `${item.href ?? item.label}-${isLast ? "current" : "link"}`;

					return (
						<Fragment key={itemKey}>
							<BreadcrumbItem className="min-w-0 shrink-0">
								{isLast ? (
									<BreadcrumbPage className="truncate">
										{item.label}
									</BreadcrumbPage>
								) : item.href ? (
									<BreadcrumbLink asChild className="truncate">
										<Link href={item.href}>{item.label}</Link>
									</BreadcrumbLink>
								) : (
									<span className="truncate">{item.label}</span>
								)}
							</BreadcrumbItem>
							{isLast ? null : <BreadcrumbSeparator className="shrink-0" />}
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

export function AppTopBar() {
	const pathname = usePathname();
	const { state } = useAppChromeContext();
	const chrome = useMemo(
		() => resolveAppChromeState(pathname, state),
		[pathname, state],
	);

	return (
		<header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-[color:var(--border-subtle)] bg-[color:rgba(9,14,24,0.9)] px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-[color:rgba(9,14,24,0.72)] sm:px-5">
			<SidebarTrigger className="size-8 text-muted-foreground hover:text-foreground" />
			<Separator
				orientation="vertical"
				className="hidden h-4 bg-[color:var(--border-subtle)] sm:block"
			/>
			<div className="min-w-0 flex-1">
				<AppTopBarBreadcrumbs breadcrumbs={chrome.breadcrumbs} />
			</div>
			<CommandLauncherButton
				label="Search and commands"
				className="hidden h-9 items-center gap-2 rounded-md border border-[color:var(--border-subtle)] bg-surface-2 px-3 text-[13px] text-muted-foreground transition-colors hover:border-[color:var(--border-strong)] hover:bg-surface-2 hover:text-foreground sm:flex"
			/>
		</header>
	);
}
