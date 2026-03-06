import { Bolt, Command, Plus, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { auth, signOut } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	knowledgeNavigation,
	primaryNavigation,
	sidebarSpaceGroups,
} from "@/lib/navigation";

export async function AppShell({ children }: { children: React.ReactNode }) {
	const session = await auth();
	const displayName =
		session?.user.name ?? session?.user.email?.split("@")[0] ?? "Operator";
	const displayRole = session?.user.role ?? "reader";

	return (
		<div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
			<div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[290px_minmax(0,1fr)]">
				<aside className="flex flex-col rounded-[28px] border border-[color:var(--border-subtle)] bg-[linear-gradient(180deg,rgba(13,19,29,0.88),rgba(7,10,17,0.9))] px-4 py-5 shadow-[0_24px_80px_rgba(3,7,15,0.45)] lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
					<div className="flex items-center justify-between border-b border-[color:var(--border-subtle)] px-2 pb-5">
						<Link href="/" className="flex items-center gap-3">
							<div className="flex size-11 items-center justify-center rounded-2xl border border-[color:var(--border-strong)] bg-[linear-gradient(135deg,rgba(92,124,255,0.2),rgba(139,109,248,0.16))] shadow-[0_10px_30px_rgba(24,39,79,0.32)]">
								<Bolt className="size-5 text-[color:var(--text-primary)]" />
							</div>
							<div>
								<p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-muted)]">
									Knowledge Ops
								</p>
								<h1 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
									Foundry
								</h1>
							</div>
						</Link>
						<Badge variant="agent">Live</Badge>
					</div>

					<div className="mt-5 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(10,16,26,0.66)] p-3">
						<Link href="/search" className="flex items-center gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-[color:rgba(15,23,34,0.88)] px-3 py-3 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:border-[color:var(--border-strong)] transition-colors">
							<Command className="size-4" />
							<span>Search knowledge, drafts, and audit history</span>
						</Link>
					</div>

					<nav className="mt-5 flex flex-col gap-2">
						{primaryNavigation.map((item) => {
							const Icon = item.icon;

							return (
								<Link
									key={item.href}
									href={item.href}
									className="group flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-transparent px-3 py-3 text-[color:var(--text-secondary)] transition-all duration-200 hover:border-[color:var(--border-subtle)] hover:bg-[color:rgba(18,27,40,0.72)] hover:text-[color:var(--text-primary)]"
								>
									<span className="flex items-center gap-3">
										<Icon className="size-4" />
										<span className="text-sm font-medium">{item.label}</span>
									</span>
									{item.count ? (
										<span className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
											{item.count}
										</span>
									) : null}
								</Link>
							);
						})}
					</nav>

					<div className="mt-6 space-y-4 border-t border-[color:var(--border-subtle)] pt-6">
						{sidebarSpaceGroups.map((group) => (
							<div key={group.title}>
								<p className="px-2 text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
									{group.title}
								</p>
								<div className="mt-2 space-y-1.5">
									{group.items.map((item) => (
										<div
											key={item.label}
											className="rounded-2xl px-3 py-2 transition-colors hover:bg-[color:rgba(18,27,40,0.72)]"
										>
											<p className="text-sm font-medium text-[color:var(--text-primary)]">
												{item.label}
											</p>
											<p className="mt-1 text-xs text-[color:var(--text-muted)]">
												{item.meta}
											</p>
										</div>
									))}
								</div>
							</div>
						))}
					</div>

					<div className="mt-auto space-y-3 border-t border-[color:var(--border-subtle)] pt-5">
						<Card className="bg-[linear-gradient(180deg,rgba(15,24,37,0.96),rgba(10,15,24,0.96))]">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="text-sm">Workspace safety</CardTitle>
									<ShieldCheck className="size-4 text-[color:var(--success)]" />
								</div>
								<CardDescription>
									Agents default to draft-only writes. Every mutation is
									versioned and attributed.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{knowledgeNavigation.slice(0, 3).map((item) => (
									<div
										key={item.href}
										className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.72)] px-3 py-2"
									>
										<p className="text-sm font-medium text-[color:var(--text-primary)]">
											{item.label}
										</p>
										<p className="mt-1 text-xs text-[color:var(--text-muted)]">
											{item.hint}
										</p>
									</div>
								))}
							</CardContent>
						</Card>

						<div className="flex items-center justify-between rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(9,15,24,0.76)] px-4 py-4">
							<div>
								<p className="text-sm font-semibold text-[color:var(--text-primary)]">
									{displayName}
								</p>
								<p className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
									{displayRole} access
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
										className="min-w-0 rounded-xl px-3"
									>
										Sign out
									</Button>
								</form>
								<Button
									variant="secondary"
									size="sm"
									className="min-w-0 rounded-xl px-3"
								>
									<Plus className="size-4" />
									New
								</Button>
							</div>
						</div>
					</div>
				</aside>

				<div className="min-h-[calc(100vh-2rem)] rounded-[32px] border border-[color:var(--border-subtle)] bg-[linear-gradient(180deg,rgba(13,19,29,0.88),rgba(7,10,17,0.9))] p-4 shadow-[0_24px_80px_rgba(3,7,15,0.45)] sm:p-5 lg:p-6">
					<header className="rounded-[26px] border border-[color:var(--border-subtle)] bg-[color:rgba(10,15,24,0.82)] px-4 py-4 shadow-[0_12px_30px_rgba(5,8,14,0.24)] sm:px-5">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div>
								<p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
									Workspace / dashboard / today
								</p>
								<div className="mt-2 flex flex-wrap items-center gap-3">
									<h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--text-primary)] sm:text-[2rem]">
										Operational knowledge with human review built in.
									</h2>
									<Badge variant="stable">Stable system</Badge>
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<Button variant="ghost" size="sm" asChild>
									<Link href="/drafts">
										<Sparkles className="size-4" />
										Draft review
									</Link>
								</Button>
								<Button size="sm">
									<Plus className="size-4" />
									Create page
								</Button>
							</div>
						</div>
					</header>

					<main className="mt-5">{children}</main>
				</div>
			</div>
		</div>
	);
}
