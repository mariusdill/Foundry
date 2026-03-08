import { AppShell } from "@/components/app-shell";

type AuthenticatedLayoutProps = {
	children: Parameters<typeof AppShell>[0]["children"];
};

export default function AuthenticatedLayout({
	children,
}: AuthenticatedLayoutProps) {
	return <AppShell>{children}</AppShell>;
}
