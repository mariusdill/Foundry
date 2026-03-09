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
								Foundry / secure access
							</p>
							<h1 className="max-w-2xl text-[28px] font-medium tracking-tight text-foreground lg:text-[34px]">
								Enter a workspace built for steady review, durable pages, and
								clear ownership.
							</h1>
							<p className="max-w-xl text-[14px] leading-6 text-secondary">
								Foundry keeps work close to home: drafts stay easy to review,
								stable pages stay durable, and every change stays traceable.
							</p>
						</div>

						<div className="grid gap-3 md:grid-cols-3">
							{[
								[
									"Workspace entry",
									"Open Foundry with the same workspace context, review state, and role-aware access each time.",
								],
								[
									"Review by default",
									"Drafts stay easy to inspect before they move into durable, stable pages.",
								],
								[
									"Traceable changes",
									"Access, edits, and promotions remain attributable from the first draft to the final page.",
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
