import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";
import { Card, CardContent } from "@/components/ui/card";

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
		<div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
			<div className="mx-auto grid max-w-[1120px] gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
				<Card>
					<CardContent className="space-y-6 p-6 lg:p-8">
						<div className="space-y-2">
							<p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
								Knowledge operations / secure access
							</p>
							<h1 className="max-w-2xl text-[28px] font-medium tracking-tight text-foreground lg:text-[34px]">
								Calm, traceable access for a workspace built around human
								review.
							</h1>
							<p className="max-w-xl text-[14px] leading-6 text-secondary">
								Foundry keeps stable knowledge human-owned, drafts
								agent-friendly, and every mutation attributable.
							</p>
						</div>

						<div className="grid gap-3 md:grid-cols-3">
							{[
								[
									"Scoped sessions",
									"JWT-backed sessions preserve role context while staying edge-friendly.",
								],
								[
									"Draft safety",
									"Agents default to draft-only writes and humans promote stable content.",
								],
								[
									"Audit posture",
									"Auth, token use, and mutations remain attributable end to end.",
								],
							].map(([title, detail]) => (
								<div
									key={title}
									className="rounded-[10px] border border-[color:var(--border-subtle)] bg-surface-2 p-4"
								>
									<p className="text-[13px] font-medium text-foreground">
										{title}
									</p>
									<p className="mt-1 text-[13px] leading-5 text-muted-foreground">
										{detail}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<LoginForm callbackUrl={safeCallbackUrl} error={error} />
			</div>
		</div>
	);
}
