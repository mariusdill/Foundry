import { Bolt, Command, Plus, Sparkles } from "lucide-react";
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
		<div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
			<div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
				<aside className="flex flex-col rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-1)] px-3 py-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
					<div className="flex items-center justify-between px-2 pb-4">
						<Link href="/" className="flex items-center gap-2">
							<div className="flex size-6 items-center justify-center rounded-md bg-[color:var(--text-primary)]">
								<Bolt className="size-4 text-[color:var(--background)]" />
							</div>
							<h1 className="text-sm font-medium tracking-tight text-[color:var(--text-primary)]">
								Foundry
							</h1>
						</Link>
						<Badge variant="agent">Live</Badge>
					</div>

					<div className="px-2">
						<Link
							href="/search"
							className="flex items-center gap-2 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface-2)] px-2 py-1.5 text-xs text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:border-[color:var(--border-strong)] transition-colors"
						>
							<Command className="size-3.5" />
							<span>Search...</span>
						</Link>
					</div>

					<nav className="mt-4 flex flex-col gap-0.5 px-2">
						{primaryNavigation.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.href}
									href={item.href}
									className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[color:var(--text-secondary)] transition-all duration-200 hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text-primary)]"
								>
									<span className="flex items-center gap-2">
										<Icon className="size-4" />
										<span className="text-sm font-medium">{item.label}</span>
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

					<div className="mt-auto pt-4 px-2">
						<div className="flex items-center justify-between rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface-2)] px-3 py-2">
							<div>
								<p className="text-sm font-medium text-[color:var(--text-primary)]">
									{displayName}
								</p>
								<p className="text-xs text-[color:var(--text-muted)]">
									{displayRole}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<form
									action={async () => {
										"use server";
										await signOut({ redirectTo: "/login" });
									}}
								>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 min-w-0 rounded-md px-2 text-xs"
									>
										Sign out
									</Button>
								</form>
								<Button
									variant="secondary"
									size="sm"
									className="h-7 min-w-0 rounded-md px-2 text-xs"
								>
									<Plus className="size-3.5" />
									New
								</Button>
							</div>
						</div>
					</div>
				</aside>

				<div className="min-h-[calc(100vh-2rem)] rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-1)] p-5 lg:p-6">
					<header className="flex items-center justify-between gap-4 pb-5 border-b border-[color:var(--border-subtle)]">
						<div>
							<h2 className="text-lg font-medium tracking-tight text-[color:var(--text-primary)]">
								Operational knowledge with human review built in.
							</h2>
							<p className="text-sm text-[color:var(--text-muted)] mt-0.5">
								Workspace / dashboard / today
							</p>
						</div>

						<div className="flex items-center gap-2">
							<Button variant="ghost" size="sm" asChild>
								<Link href="/drafts">
									<Sparkles className="size-4 mr-1.5" />
									Draft review
								</Link>
							</Button>
							<Button size="sm">
								<Plus className="size-4 mr-1.5" />
								Create page
							</Button>
						</div>
					</header>

					<main className="mt-5">{children}</main>
				</div>
			</div>
		</div>
	);
}
