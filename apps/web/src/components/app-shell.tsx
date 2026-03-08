import { Bolt, Command, Plus } from "lucide-react";
import Link from "next/link";

import { auth, signOut } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { primaryNavigation } from "@/lib/navigation";

export async function AppShell({ children }: { children: React.ReactNode }) {
	const session = await auth();
	const displayName =
		session?.user.name ?? session?.user.email?.split("@")[0] ?? "Operator";
	const displayRole = session?.user.role ?? "reader";

	return (
		<div className="min-h-screen bg-background px-3 py-3 sm:px-4 sm:py-4">
			<div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1600px] gap-3 lg:grid-cols-[224px_minmax(0,1fr)]">
				<aside className="flex min-h-0 flex-col rounded-[12px] border border-[color:var(--border-subtle)] bg-surface-1 px-3 py-3 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
					<div className="flex items-center justify-between px-1.5 py-1">
						<Link href="/" className="flex items-center gap-2">
							<div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
								<Bolt className="size-3.5" />
							</div>
							<div className="flex items-center gap-2">
								<h1 className="text-[13px] font-medium tracking-tight text-foreground">
									Foundry
								</h1>
								<Badge variant="agent">Live</Badge>
							</div>
						</Link>
					</div>

					<div className="mt-4 px-1.5">
						<Link
							href="/search"
							className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-[13px] text-muted-foreground transition-colors hover:border-[color:var(--border-strong)] hover:text-foreground"
						>
							<Command className="size-3.5" />
							<span className="flex-1">Search...</span>
							<span className="text-[11px] text-[color:var(--text-muted)]">
								Cmd K
							</span>
						</Link>
					</div>

					<nav className="mt-4 flex flex-col gap-0.5 px-1.5">
						{primaryNavigation.map((item) => {
							const Icon = item.icon;

							return (
								<Link
									key={item.href}
									href={item.href}
									className="group flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-[13px] text-secondary transition-colors hover:bg-surface-2 hover:text-foreground"
								>
									<span className="flex items-center gap-2">
										<Icon className="size-4" />
										<span className="font-medium">{item.label}</span>
									</span>
									{item.count ? (
										<span className="text-[11px] text-[color:var(--text-muted)]">
											{item.count}
										</span>
									) : null}
								</Link>
							);
						})}
					</nav>

					<div className="mt-auto px-1.5 pt-4">
						<div className="rounded-[10px] border border-[color:var(--border-subtle)] bg-surface-2 p-3">
							<div className="flex items-center justify-between gap-3">
								<div className="min-w-0">
									<p className="truncate text-[13px] font-medium text-foreground">
										{displayName}
									</p>
									<p className="text-[11px] text-[color:var(--text-muted)]">
										{displayRole}
									</p>
								</div>
								<div className="flex items-center gap-1.5">
									<form
										action={async () => {
											"use server";
											await signOut({ redirectTo: "/login" });
										}}
									>
										<Button variant="ghost" size="xs" className="h-7 px-2.5">
											Sign out
										</Button>
									</form>
									<Button variant="secondary" size="xs" className="h-7 px-2.5">
										<Plus className="size-3.5" />
										New
									</Button>
								</div>
							</div>
						</div>
					</div>
				</aside>

				<div className="min-h-[calc(100vh-1.5rem)] rounded-[12px] border border-[color:var(--border-subtle)] bg-surface-1 p-5 sm:p-6">
					{children}
				</div>
			</div>
		</div>
	);
}
