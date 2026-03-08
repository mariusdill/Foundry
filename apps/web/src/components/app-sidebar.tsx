"use client";

import { Bolt, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import {
	primaryNavigation,
	sidebarActionSurfaces,
	sidebarCollections,
} from "@/lib/navigation";

type AppSidebarProps = {
	displayName: string;
	displayRole: string;
	signOutAction: (formData: FormData) => void | Promise<void>;
};

function isActivePath(pathname: string, href: string) {
	if (href === "/") {
		return pathname === href;
	}

	return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(value: string) {
	const initials = value
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return initials || "OP";
}

export function AppSidebar({
	displayName,
	displayRole,
	signOutAction,
}: AppSidebarProps) {
	const pathname = usePathname();
	const initials = getInitials(displayName);

	return (
		<Sidebar
			data-testid="app-sidebar"
			variant="floating"
			collapsible="icon"
			className="md:p-3"
		>
			<SidebarHeader className="gap-3 p-2">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							size="lg"
							tooltip="Foundry"
							className="h-auto min-h-14 rounded-[14px] border border-sidebar-border bg-sidebar-accent px-3 py-3 shadow-[var(--shadow-soft)] hover:bg-sidebar-accent"
						>
							<Link href="/">
								<div className="flex size-9 items-center justify-center rounded-[10px] bg-sidebar-primary text-sidebar-primary-foreground shadow-[var(--shadow-sm)]">
									<Bolt className="size-4" />
								</div>
								<div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
									<span className="text-[13px] font-semibold text-sidebar-foreground">
										Foundry
									</span>
									<span className="text-[11px] text-sidebar-foreground/60">
										Authenticated workspace
									</span>
								</div>
								<Badge
									variant="agent"
									className="rounded-full border border-sidebar-border bg-sidebar group-data-[collapsible=icon]:hidden"
								>
									Live
								</Badge>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>

				{sidebarActionSurfaces.length ? (
					<SidebarMenu>
						{sidebarActionSurfaces.map((action) => {
							const ActionIcon = action.icon;

							return (
								<SidebarMenuItem key={action.href}>
									<SidebarMenuButton
										asChild
										variant="outline"
										size="lg"
										tooltip={action.label}
										isActive={isActivePath(pathname, action.href)}
										className="h-auto min-h-12 rounded-[12px] border-sidebar-border bg-transparent px-3 py-3 hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent"
									>
										<Link href={action.href}>
											<div className="flex size-8 items-center justify-center rounded-[10px] bg-sidebar-accent text-sidebar-foreground">
												<ActionIcon className="size-4" />
											</div>
											<div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
												<span className="text-[12px] font-semibold text-sidebar-foreground">
													{action.label}
												</span>
												<span className="text-[11px] text-sidebar-foreground/60">
													{action.description}
												</span>
											</div>
											{action.shortcut ? (
												<span className="rounded-full border border-sidebar-border px-2 py-0.5 text-[10px] font-medium text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
													{action.shortcut}
												</span>
											) : null}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				) : null}
			</SidebarHeader>

			<SidebarSeparator />

			<SidebarContent className="px-2 pb-2">
				<SidebarGroup className="pt-0">
					<SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/45">
						Workspace
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{primaryNavigation.map((item) => {
								const ItemIcon = item.icon;

								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild
											tooltip={item.label}
											isActive={isActivePath(pathname, item.href)}
										>
											<Link href={item.href}>
												<ItemIcon className="size-4" />
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
										{item.count ? (
											<SidebarMenuBadge>{item.count}</SidebarMenuBadge>
										) : null}
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{sidebarCollections.map((section) => (
					<SidebarGroup
						key={section.title}
						className="group-data-[collapsible=icon]:hidden"
					>
						<SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/45">
							{section.title}
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<div className="space-y-2 px-2">
								{section.items.map((item) => (
									<div
										key={`${section.title}-${item.label}`}
										className="rounded-[12px] border border-sidebar-border bg-sidebar-accent/60 px-3 py-2.5"
									>
										<p className="truncate text-[12px] font-medium text-sidebar-foreground">
											{item.label}
										</p>
										<p className="mt-1 truncate text-[11px] text-sidebar-foreground/60">
											{item.meta}
										</p>
									</div>
								))}
							</div>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarSeparator />

			<SidebarFooter className="p-2 pt-0">
				<div className="rounded-[14px] border border-sidebar-border bg-sidebar-accent p-3 shadow-[var(--shadow-sm)]">
					<div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
						<Avatar size="sm" className="ring-1 ring-sidebar-border">
							<AvatarFallback className="bg-sidebar text-sidebar-foreground">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
							<p className="truncate text-[13px] font-medium text-sidebar-foreground">
								{displayName}
							</p>
							<p className="truncate text-[11px] text-sidebar-foreground/60">
								{displayRole}
							</p>
						</div>
					</div>
					<div className="mt-3 flex items-center gap-2 group-data-[collapsible=icon]:mt-2 group-data-[collapsible=icon]:flex-col">
						<form
							action={signOutAction}
							className="flex-1 group-data-[collapsible=icon]:flex-none"
						>
							<Button
								variant="ghost"
								size="xs"
								className="w-full justify-center rounded-md border border-transparent hover:border-sidebar-border group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:px-0"
							>
								<LogOut className="size-3.5" />
								<span className="group-data-[collapsible=icon]:sr-only">
									Sign out
								</span>
							</Button>
						</form>
						<Button
							type="button"
							variant="secondary"
							size="xs"
							className="flex-1 justify-center rounded-md group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:px-0"
						>
							<Plus className="size-3.5" />
							<span className="group-data-[collapsible=icon]:sr-only">New</span>
						</Button>
					</div>
				</div>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
