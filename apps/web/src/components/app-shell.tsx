import { cookies } from "next/headers";

import { auth, signOut } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { AppChromeProvider, AppTopBar } from "@/components/app-top-bar";
import { GlobalCommandPalette } from "@/components/global-command-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export async function AppShell({ children }: { children: React.ReactNode }) {
	const session = await auth();
	const cookieStore = await cookies();
	const displayName =
		session?.user.name ?? session?.user.email?.split("@")[0] ?? "Operator";
	const displayRole = session?.user.role ?? "reader";
	const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

	const signOutAction = async (formData: FormData) => {
		"use server";
		void formData;
		await signOut({ redirectTo: "/login" });
	};

	return (
		<div
			data-testid="app-shell"
			className="min-h-screen bg-background px-3 py-3 sm:px-4 sm:py-4"
		>
			<SidebarProvider defaultOpen={defaultOpen}>
				<GlobalCommandPalette showTrigger={false} />
				<AppSidebar
					displayName={displayName}
					displayRole={displayRole}
					signOutAction={signOutAction}
				/>
				<SidebarInset className="min-h-[calc(100vh-1.5rem)] rounded-[16px] border border-[color:var(--border-subtle)] bg-surface-1 shadow-[var(--shadow-panel)] sm:min-h-[calc(100vh-2rem)]">
					<AppChromeProvider>
						<div className="flex min-h-full flex-col">
							<AppTopBar />
							<div className="flex-1 p-5 sm:p-6">{children}</div>
						</div>
					</AppChromeProvider>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
