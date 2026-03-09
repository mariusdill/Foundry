import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@foundry/database";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import NextAuth, { type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { type AppRole, hasRequiredRole } from "@/auth/guards";
import authConfig from "@/auth.config";

const credentialsSchema = z.object({
	email: z.email().transform((value) => value.trim().toLowerCase()),
	password: z.string().min(1),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
	...authConfig,
	adapter: PrismaAdapter(prisma as never),
	providers: [
		Credentials({
			name: "Email and Password",
			credentials: {
				email: {
					label: "Email",
					type: "email",
				},
				password: {
					label: "Password",
					type: "password",
				},
			},
			async authorize(credentials) {
				const parsedCredentials = credentialsSchema.safeParse(credentials);

				if (!parsedCredentials.success) {
					return null;
				}

				const user = await prisma.user.findUnique({
					where: { email: parsedCredentials.data.email },
					select: {
						id: true,
						email: true,
						name: true,
						passwordHash: true,
						role: true,
					},
				});

				if (!user?.passwordHash) {
					return null;
				}

				const isValidPassword = await bcrypt.compare(
					parsedCredentials.data.password,
					user.passwordHash,
				);

				if (!isValidPassword) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				};
			},
		}),
	],
});

export async function authorizeApiRequest(requiredRole: AppRole = "reader") {
	const session = await auth();

	if (!session?.user) {
		return {
			response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
		};
	}

	if (!hasRequiredRole(session.user.role, requiredRole)) {
		return {
			response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
		};
	}

	return {
		session: session as Session,
	};
}
