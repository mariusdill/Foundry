import type { NextAuthConfig } from "next-auth";

import type { AppRole } from "@/auth/guards";
import { resolveAuthSecret } from "@/auth/secret";

const authConfig = {
	secret: resolveAuthSecret(),
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
	providers: [],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.sub = user.id;
				token.role = user.role;
				token.name = user.name;
				token.email = user.email;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.sub ?? "";
				session.user.email = token.email ?? session.user.email ?? "";
				session.user.name = token.name ?? session.user.name;
				session.user.role = (token.role as AppRole | undefined) ?? "reader";
			}

			return session;
		},
	},
} satisfies NextAuthConfig;

export default authConfig;
