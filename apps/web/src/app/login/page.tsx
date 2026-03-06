import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
	searchParams: Promise<{
		callbackUrl?: string;
		error?: string;
	}>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const session = await auth();
	const { callbackUrl, error } = await searchParams;
	const safeCallbackUrl = callbackUrl?.startsWith("/") ? callbackUrl : "/";

	if (session?.user) {
		redirect(safeCallbackUrl);
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(92,124,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(90,184,255,0.12),transparent_26%)]" />
			<div className="absolute left-1/2 top-14 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(92,124,255,0.22),transparent_68%)] blur-3xl" />

			<div className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,440px)] lg:items-center">
				<section className="rounded-[32px] border border-[color:var(--border-subtle)] bg-[linear-gradient(180deg,rgba(10,16,26,0.88),rgba(6,10,17,0.94))] p-6 shadow-[0_30px_90px_rgba(3,7,15,0.42)] sm:p-8 lg:p-10">
					<p className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--text-muted)]">
						Knowledge operations / secure access
					</p>
					<h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-[color:var(--text-primary)] sm:text-5xl">
						Calm, traceable access for a workspace built around human review.
					</h1>
					<p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--text-secondary)] sm:text-base">
						Foundry keeps stable knowledge human-owned, drafts agent-friendly,
						and every mutation attributable. Sign in with local credentials to
						continue into the dark-first workspace.
					</p>

					<div className="mt-8 grid gap-3 sm:grid-cols-3">
						{[
							[
								"Scoped sessions",
								"JWT-backed sessions stay edge-friendly while preserving role context.",
							],
							[
								"Draft safety",
								"Agents default to draft-only writes, with human promotion for stable content.",
							],
							[
								"Audit posture",
								"Auth, token use, and content mutations remain attributable end to end.",
							],
						].map(([title, detail]) => (
							<div
								key={title}
								className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.72)] p-4"
							>
								<p className="text-sm font-semibold text-[color:var(--text-primary)]">
									{title}
								</p>
								<p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
									{detail}
								</p>
							</div>
						))}
					</div>
				</section>

				<LoginForm callbackUrl={safeCallbackUrl} error={error} />
			</div>
		</div>
	);
}
