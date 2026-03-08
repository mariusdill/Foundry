"use client";

import { AlertCircle, ArrowRight, LockKeyhole } from "lucide-react";
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
	if (!error) return undefined;
	if (error === "CredentialsSignin") return "Invalid email or password.";
	if (error === "AccessDenied")
		return "Your account does not have access to that area.";
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
		<Card>
			<CardHeader className="pb-4">
				<p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
					Secure access
				</p>
				<CardTitle className="mt-1 text-[20px]">Sign in to Foundry</CardTitle>
				<CardDescription className="mt-1">{helperMessage}</CardDescription>
			</CardHeader>

			<CardContent>
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
							className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]"
							htmlFor="email"
						>
							Email
						</label>
						<Input
							autoComplete="email"
							id="email"
							name="email"
							placeholder="admin@foundry.local"
							required
							type="email"
						/>
					</div>

					<div className="space-y-2">
						<label
							className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]"
							htmlFor="password"
						>
							Password
						</label>
						<div className="relative">
							<LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
							<Input
								autoComplete="current-password"
								className="pl-9"
								id="password"
								name="password"
								placeholder="Enter your password"
								required
								type="password"
							/>
						</div>
					</div>

					{formError ? (
						<div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
							<AlertCircle className="mt-0.5 size-4 shrink-0" />
							<span>{formError}</span>
						</div>
					) : null}

					<Button className="w-full" disabled={isPending} type="submit">
						{isPending ? "Signing in..." : "Enter workspace"}
						<ArrowRight className="size-4" />
					</Button>
				</form>
			</CardContent>

			<CardFooter className="text-[12px] text-muted-foreground">
				<div className="flex w-full items-center justify-between gap-4">
					<span>Seed user: admin@foundry.local</span>
					<span className="font-mono uppercase tracking-[0.14em]">
						JWT session
					</span>
				</div>
			</CardFooter>
		</Card>
	);
}
