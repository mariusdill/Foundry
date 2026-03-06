"use client";

import {
	AlertCircle,
	ArrowRight,
	LockKeyhole,
	ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LoginFormProps = {
	callbackUrl: string;
	error?: string;
};

function getErrorMessage(error?: string) {
	if (!error) {
		return undefined;
	}

	if (error === "CredentialsSignin") {
		return "Invalid email or password.";
	}

	if (error === "AccessDenied") {
		return "Your account does not have access to that area.";
	}

	return "We could not sign you in. Please try again.";
}

export function LoginForm({ callbackUrl, error }: LoginFormProps) {
	const router = useRouter();
	const [formError, setFormError] = useState<string | undefined>(
		getErrorMessage(error),
	);
	const [isPending, startTransition] = useTransition();

	const helperMessage = useMemo(
		() =>
			formError ?? "Use your local Foundry credentials to enter the workspace.",
		[formError],
	);

	return (
		<Card className="overflow-hidden border-[color:var(--border-strong)] bg-[linear-gradient(180deg,rgba(16,24,37,0.97),rgba(8,12,20,0.96))]">
			<CardHeader className="gap-4 border-b border-[color:var(--border-subtle)] pb-5">
				<div className="flex items-center justify-between gap-3">
					<div className="flex size-12 items-center justify-center rounded-2xl border border-[color:var(--border-strong)] bg-[linear-gradient(135deg,rgba(92,124,255,0.22),rgba(90,184,255,0.12))] shadow-[0_18px_42px_rgba(18,38,92,0.26)]">
						<ShieldCheck className="size-5 text-[color:var(--text-primary)]" />
					</div>
					<div className="rounded-full border border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.78)] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
						Local auth
					</div>
				</div>
				<div>
					<CardTitle className="text-[1.9rem] tracking-[-0.05em]">
						Sign in to Foundry
					</CardTitle>
					<CardDescription className="mt-3 max-w-lg text-sm leading-6 text-[color:var(--text-secondary)]">
						{helperMessage}
					</CardDescription>
				</div>
			</CardHeader>

			<CardContent className="pt-6">
				<form
					className="space-y-4"
					onSubmit={(event) => {
						event.preventDefault();

						const formData = new FormData(event.currentTarget);
						const email = String(formData.get("email") ?? "").trim();
						const password = String(formData.get("password") ?? "");

						setFormError(undefined);

						startTransition(async () => {
							const result = await signIn("credentials", {
								email,
								password,
								redirect: false,
								redirectTo: callbackUrl,
							});

							if (result?.error) {
								setFormError(getErrorMessage(result.error));
								return;
							}

							router.push(result?.url ?? callbackUrl);
							router.refresh();
						});
					}}
				>
					<div className="space-y-2">
						<label
							className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--text-muted)]"
							htmlFor="email"
						>
							Email
						</label>
						<Input
							autoComplete="email"
							className="h-11 rounded-xl border-[color:var(--border-strong)] bg-[color:rgba(7,11,18,0.74)] px-4"
							id="email"
							name="email"
							placeholder="admin@foundry.local"
							required
							type="email"
						/>
					</div>

					<div className="space-y-2">
						<label
							className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--text-muted)]"
							htmlFor="password"
						>
							Password
						</label>
						<div className="relative">
							<LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
							<Input
								autoComplete="current-password"
								className="h-11 rounded-xl border-[color:var(--border-strong)] bg-[color:rgba(7,11,18,0.74)] pl-11 pr-4"
								id="password"
								name="password"
								placeholder="Enter your password"
								required
								type="password"
							/>
						</div>
					</div>

					{formError ? (
						<div className="flex items-start gap-3 rounded-2xl border border-[color:rgba(240,107,116,0.28)] bg-[color:rgba(72,18,24,0.28)] px-4 py-3 text-sm text-[color:#ffd8dc]">
							<AlertCircle className="mt-0.5 size-4 shrink-0" />
							<span>{formError}</span>
						</div>
					) : null}

					<Button
						className="h-11 w-full rounded-xl text-sm font-semibold"
						disabled={isPending}
						type="submit"
					>
						{isPending ? "Signing in..." : "Enter workspace"}
						<ArrowRight className="size-4" />
					</Button>
				</form>
			</CardContent>

			<CardFooter className="justify-between gap-4 border-t border-[color:var(--border-subtle)] pt-5 text-xs text-[color:var(--text-muted)]">
				<span>Seed user: admin@foundry.local</span>
				<span className="font-mono uppercase tracking-[0.2em]">
					JWT session
				</span>
			</CardFooter>
		</Card>
	);
}
