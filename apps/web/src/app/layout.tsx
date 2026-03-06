import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/providers";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
	variable: "--font-ibm-plex-mono",
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Foundry",
	description:
		"A premium dark-first knowledge workspace for humans and AI agents.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body className={`${inter.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
